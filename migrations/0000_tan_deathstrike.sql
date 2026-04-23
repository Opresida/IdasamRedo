CREATE TABLE "article_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT NOW(),
	CONSTRAINT "article_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "article_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"author_name" text NOT NULL,
	"author_email" text NOT NULL,
	"content" text NOT NULL,
	"is_approved" text DEFAULT 'false' NOT NULL,
	"reaction_counts" text DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "article_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"anonymous_user_id" text NOT NULL,
	"reaction_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"image" text,
	"category_id" uuid,
	"author_name" text DEFAULT 'Admin' NOT NULL,
	"tags" text[],
	"published" text DEFAULT 'false' NOT NULL,
	"featured" text DEFAULT 'false' NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"reading_time" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW(),
	"updated_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "assinatura_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"token" text NOT NULL,
	"signer_name" text,
	"signer_email" text,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT NOW(),
	CONSTRAINT "assinatura_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "assinatura_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"signer_name" text NOT NULL,
	"signer_cpf" text,
	"signer_email" text,
	"signer_ip" text,
	"signer_user_agent" text,
	"signature_type" text NOT NULL,
	"signature_image" text,
	"document_hash" text NOT NULL,
	"signatario_id" uuid,
	"delegacao_id" uuid,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "audience_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audience_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "campaign_open_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"opened_at" timestamp with time zone DEFAULT NOW(),
	CONSTRAINT "unique_open_per_lead" UNIQUE("campaign_id","lead_id")
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"file_path" text,
	"file_data" text,
	"uploaded_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"telefone" text NOT NULL,
	"email" text NOT NULL,
	"organizacao" text,
	"descricao" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "course_notification_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"instructor" text NOT NULL,
	"workload" integer NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"location" text NOT NULL,
	"schedule" text,
	"address" text,
	"curriculum" text,
	"vacancies" integer,
	"status" text DEFAULT 'open' NOT NULL,
	"auth_code" text,
	"cert_template" text,
	"cert_block_config" text,
	"created_at" timestamp with time zone DEFAULT NOW(),
	CONSTRAINT "courses_auth_code_unique" UNIQUE("auth_code")
);
--> statement-breakpoint
CREATE TABLE "crm_doador" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stakeholder_id" uuid NOT NULL,
	"tipo_doador" text DEFAULT 'pf' NOT NULL,
	"cpf_cnpj" text,
	"area_interesse" text,
	"recorrente" boolean DEFAULT false NOT NULL,
	"valor_medio_doacao" text,
	"ultima_doacao" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "crm_documentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stakeholder_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"tipo" text NOT NULL,
	"file_data" text NOT NULL,
	"tamanho" integer,
	"criado_em" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_interacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stakeholder_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"descricao" text NOT NULL,
	"data" timestamp with time zone DEFAULT NOW() NOT NULL,
	"responsavel" text,
	"criado_em" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_orgao_publico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stakeholder_id" uuid NOT NULL,
	"nome_orgao" text NOT NULL,
	"esfera" text NOT NULL,
	"sigla" text,
	"setor_responsavel" text,
	"contato_nome" text,
	"contato_cargo" text,
	"contato_telefone" text,
	"contato_email" text
);
--> statement-breakpoint
CREATE TABLE "crm_pesquisador" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stakeholder_id" uuid NOT NULL,
	"cpf" text,
	"lattes" text,
	"orcid" text,
	"instituicao" text,
	"titulacao" text,
	"area_atuacao" text,
	"grupos_pesquisa" text
);
--> statement-breakpoint
CREATE TABLE "crm_pessoa_fisica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stakeholder_id" uuid NOT NULL,
	"cpf" text NOT NULL,
	"rg" text,
	"data_nascimento" text,
	"profissao" text,
	"nacionalidade" text
);
--> statement-breakpoint
CREATE TABLE "crm_pessoa_juridica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stakeholder_id" uuid NOT NULL,
	"cnpj" text NOT NULL,
	"razao_social" text NOT NULL,
	"nome_fantasia" text,
	"inscricao_estadual" text,
	"segmento" text,
	"porte" text,
	"responsavel_nome" text,
	"responsavel_cargo" text,
	"responsavel_telefone" text,
	"responsavel_email" text
);
--> statement-breakpoint
CREATE TABLE "crm_recibos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stakeholder_id" uuid NOT NULL,
	"numero" text NOT NULL,
	"valor" text NOT NULL,
	"descricao" text NOT NULL,
	"data_emissao" text NOT NULL,
	"pdf_data" text,
	"criado_em" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_stakeholders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"telefone" text,
	"endereco" text,
	"cidade" text,
	"estado" text,
	"cep" text,
	"observacoes" text,
	"status" text DEFAULT 'ativo' NOT NULL,
	"token_publico" text,
	"lgpd_consentimento" boolean DEFAULT false NOT NULL,
	"lgpd_consentido_em" timestamp with time zone,
	"lgpd_ip" text,
	"criado_em" timestamp with time zone DEFAULT NOW(),
	"atualizado_em" timestamp with time zone DEFAULT NOW(),
	CONSTRAINT "crm_stakeholders_token_publico_unique" UNIQUE("token_publico")
);
--> statement-breakpoint
CREATE TABLE "custom_html_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"html_content" text NOT NULL,
	"campaign_ids" text[],
	"trigger_type" text DEFAULT 'manual',
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "delegacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" text NOT NULL,
	"delegante_id" uuid NOT NULL,
	"delegado_id" uuid NOT NULL,
	"motivo" text NOT NULL,
	"poderes" text NOT NULL,
	"valida_de" timestamp with time zone NOT NULL,
	"valida_ate" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'ativa' NOT NULL,
	"ato_designacao_pdf" text,
	"revogado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "email_audiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audience_id" uuid NOT NULL,
	"template_id" uuid,
	"custom_html_template_id" uuid,
	"sent_at" timestamp with time zone DEFAULT NOW(),
	"sent_count" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"open_count" integer DEFAULT 0 NOT NULL,
	"subject" text
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"trigger" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"full_name" text,
	"cpf" text,
	"phone" text,
	"email" text,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text DEFAULT 'orcamento',
	"numero" text NOT NULL,
	"titulo" text NOT NULL,
	"cli_nome" text NOT NULL,
	"cli_email" text,
	"cli_tel" text,
	"valor_total" text,
	"status" text DEFAULT 'enviada',
	"emissao" text,
	"validade" text,
	"dados" text,
	"obs" text,
	"pdf_data" text,
	"pdf_assinado" text,
	"assinado_em" timestamp with time zone,
	"enviado_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "signatarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cargo" text NOT NULL,
	"role" text DEFAULT 'outro' NOT NULL,
	"email" text NOT NULL,
	"ativo" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_reactions" ADD CONSTRAINT "article_reactions_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audience_leads" ADD CONSTRAINT "audience_leads_audience_id_email_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."email_audiences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_open_events" ADD CONSTRAINT "campaign_open_events_campaign_id_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_doador" ADD CONSTRAINT "crm_doador_stakeholder_id_crm_stakeholders_id_fk" FOREIGN KEY ("stakeholder_id") REFERENCES "public"."crm_stakeholders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_documentos" ADD CONSTRAINT "crm_documentos_stakeholder_id_crm_stakeholders_id_fk" FOREIGN KEY ("stakeholder_id") REFERENCES "public"."crm_stakeholders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_interacoes" ADD CONSTRAINT "crm_interacoes_stakeholder_id_crm_stakeholders_id_fk" FOREIGN KEY ("stakeholder_id") REFERENCES "public"."crm_stakeholders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_orgao_publico" ADD CONSTRAINT "crm_orgao_publico_stakeholder_id_crm_stakeholders_id_fk" FOREIGN KEY ("stakeholder_id") REFERENCES "public"."crm_stakeholders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_pesquisador" ADD CONSTRAINT "crm_pesquisador_stakeholder_id_crm_stakeholders_id_fk" FOREIGN KEY ("stakeholder_id") REFERENCES "public"."crm_stakeholders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_pessoa_fisica" ADD CONSTRAINT "crm_pessoa_fisica_stakeholder_id_crm_stakeholders_id_fk" FOREIGN KEY ("stakeholder_id") REFERENCES "public"."crm_stakeholders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_pessoa_juridica" ADD CONSTRAINT "crm_pessoa_juridica_stakeholder_id_crm_stakeholders_id_fk" FOREIGN KEY ("stakeholder_id") REFERENCES "public"."crm_stakeholders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_recibos" ADD CONSTRAINT "crm_recibos_stakeholder_id_crm_stakeholders_id_fk" FOREIGN KEY ("stakeholder_id") REFERENCES "public"."crm_stakeholders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_audience_id_email_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."email_audiences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;