import { getDocument, OPS, type PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs'

export interface ExtractedImage {
  id: string            // IMG_0, IMG_1, ...
  page: number
  dataUrl: string       // data:image/png;base64,...
  width: number
  height: number
}

export interface ParsedPdf {
  pageCount: number
  fullText: string       // texto concatenado com marcadores de página
  images: ExtractedImage[]
}

export async function parsePdf(buffer: Buffer): Promise<ParsedPdf> {
  const data = new Uint8Array(buffer)
  const doc: PDFDocumentProxy = await getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
  }).promise

  const pageCount = doc.numPages
  const textParts: string[] = []
  const images: ExtractedImage[] = []
  let imgCounter = 0

  for (let p = 1; p <= pageCount; p++) {
    console.log(`[pdfParser] processando página ${p}/${pageCount}…`)
    const page = await doc.getPage(p)

    const content = await page.getTextContent()
    const lines: string[] = []
    let currentY: number | null = null
    let currentLine = ''
    for (const item of content.items as any[]) {
      if (!('str' in item)) continue
      const y = Math.round(item.transform[5])
      if (currentY === null) {
        currentY = y
        currentLine = item.str
      } else if (Math.abs(y - currentY) > 2) {
        if (currentLine.trim()) lines.push(currentLine.trim())
        currentLine = item.str
        currentY = y
      } else {
        currentLine += (item.hasEOL ? '\n' : '') + item.str
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim())
    textParts.push(`--- Página ${p} ---\n${lines.join('\n')}`)

    try {
      const ops = await page.getOperatorList()
      const seenImgNames = new Set<string>()
      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i]
        if (fn === OPS.paintImageXObject) {
          const imgName = ops.argsArray[i]?.[0]
          if (!imgName || seenImgNames.has(imgName)) continue
          seenImgNames.add(imgName)

          // page.objs.get só dispara o callback quando o objeto está pronto.
          // Para certas imagens (que exigiriam render da página), ele NUNCA
          // fica pronto e a Promise penduraria pra sempre. Limita a 4s por
          // imagem: se não vier, segue sem ela em vez de travar o request.
          const obj = await Promise.race([
            new Promise<any>((resolve) => {
              try {
                page.objs.get(imgName, resolve)
              } catch {
                resolve(null)
              }
            }),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
          ]).catch(() => null)

          if (!obj) continue
          const pngDataUrl = await imageObjToPngDataUrl(obj)
          if (!pngDataUrl) continue

          images.push({
            id: `IMG_${imgCounter}`,
            page: p,
            dataUrl: pngDataUrl,
            width: obj.width || 0,
            height: obj.height || 0,
          })
          imgCounter++
        }
      }
    } catch {
      // se extração de imagem falhar pra uma página, continua (texto já foi extraído)
    }
  }

  await doc.destroy()

  return {
    pageCount,
    fullText: textParts.join('\n\n'),
    images,
  }
}

async function imageObjToPngDataUrl(obj: any): Promise<string | null> {
  const { data, width, height, kind } = obj || {}
  if (!data || !width || !height) return null

  const rgba = Buffer.alloc(width * height * 4)
  if (kind === 1 /* GRAYSCALE_1BPP */) {
    for (let i = 0; i < width * height; i++) {
      const byte = data[Math.floor(i / 8)]
      const bit = (byte >> (7 - (i % 8))) & 1
      const v = bit ? 255 : 0
      rgba[i * 4] = v
      rgba[i * 4 + 1] = v
      rgba[i * 4 + 2] = v
      rgba[i * 4 + 3] = 255
    }
  } else if (data.length === width * height * 3) {
    for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
      rgba[j] = data[i]
      rgba[j + 1] = data[i + 1]
      rgba[j + 2] = data[i + 2]
      rgba[j + 3] = 255
    }
  } else if (data.length === width * height * 4) {
    data.copy(rgba)
  } else if (data.length === width * height) {
    for (let i = 0, j = 0; i < data.length; i++, j += 4) {
      rgba[j] = data[i]
      rgba[j + 1] = data[i]
      rgba[j + 2] = data[i]
      rgba[j + 3] = 255
    }
  } else {
    return null
  }

  return encodePng(rgba, width, height)
}

function encodePng(rgba: Buffer, width: number, height: number): string {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = width * 4
  const raw = Buffer.alloc(height * (stride + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const zlib = require('zlib') as typeof import('zlib')
  const compressed = zlib.deflateSync(raw)

  const chunks: Buffer[] = [
    sig,
    makePngChunk('IHDR', ihdr),
    makePngChunk('IDAT', compressed),
    makePngChunk('IEND', Buffer.alloc(0)),
  ]
  return 'data:image/png;base64,' + Buffer.concat(chunks).toString('base64')
}

function makePngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

let crcTable: number[] | null = null
function crc32(buf: Buffer): number {
  if (!crcTable) {
    crcTable = []
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
