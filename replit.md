# Idasam Website

## Overview

This project is a modern React website for the Instituto de Desenvolvimento Ambiental e Social da Amazônia (Idasam). The site showcases the organization's mission, researchers, partnerships, and environmental initiatives in the Amazon region. Built with a focus on sustainability themes, the website features an Amazonian visual identity with earth-toned colors and smooth animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Animations**: CSS-based animations with transition classes

### Design System
- **Color Palette**: Amazon-inspired theme with forest green (#1A4D2E), terracotta (#C86A3B), sand/beige (#F5EFE6), and teal (#008080)
- **Typography**: Inter font family with clean, professional styling
- **Icons**: Lucide React icon library
- **Components**: Modular component architecture with reusable UI elements

### Project Structure
- **Client**: React frontend located in `/client` directory
- **Server**: Express.js backend with TypeScript in `/server` directory  
- **Shared**: Common schemas and types in `/shared` directory
- **Components**: Custom components for hero sections, testimonials, navigation, and content sections

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload with Vite integration for seamless development experience

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Type-safe database schemas with Zod validation
- **Migrations**: Database migrations managed through Drizzle Kit
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development

## External Dependencies

### Database
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Connection**: Environment-based DATABASE_URL configuration

### UI Libraries
- **Radix UI**: Headless UI primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Class Variance Authority**: Type-safe variant management for components

### Development Tools
- **Vite**: Fast build tool with React plugin and runtime error overlay
- **ESBuild**: Production bundling for server-side code
- **Replit Integration**: Development environment with cartographer plugin for enhanced debugging

### External Assets
- **Images**: Imgur-hosted images for logos, researcher photos, and background visuals
- **Fonts**: Google Fonts integration for Inter typography
- **Icons**: Lucide React for consistent iconography throughout the application

### Deployment Configuration
- **Production Build**: Optimized builds with separate client and server bundling
- **Environment Variables**: Database URL and NODE_ENV configuration
- **Static Assets**: Public directory serving with Express static middleware