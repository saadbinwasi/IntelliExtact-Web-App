# DocuMind Frontend

A beautiful, modern UI for document intelligence and AI-powered data extraction.

## Quick Start

1. **Install dependencies**: `npm install`
2. **Configure environment**: Copy `.env.example` to `.env.local` and add your API keys
3. **Set up Supabase**: Run the migration SQL from `supabase/migrations/`
4. **Start dev server**: `npm run dev`
5. **Test**: Go to `/get-started` and upload a document

📖 **See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing instructions**

## Features

- 🎨 Modern, responsive design with Tailwind CSS
- 🌙 Dark mode support
- 📱 Mobile-friendly interface
- ⚡ Built with Next.js 16 and React 18
- 🎯 TypeScript for type safety
- 🎨 Beautiful gradient designs and animations
- 📄 Multiple pages: Home, Dashboard, Pricing

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Build

Create an optimized production build:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Pages

- **Home** (`/`) - Landing page with features, use cases, and call-to-action
- **Dashboard** (`/dashboard`) - Document upload and processing interface (UI demo only)
- **Pricing** (`/pricing`) - Pricing plans and FAQ

## Components

All reusable UI components are in the `/components` directory:

- `Navbar.tsx` - Navigation header
- `Hero.tsx` - Hero section with CTA
- `Features.tsx` - Features showcase
- `HowItWorks.tsx` - Process explanation
- `UseCases.tsx` - Industry use cases
- `CTA.tsx` - Call-to-action section
- `Footer.tsx` - Site footer
- `ModelSelector.tsx` - AI model selection component

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Note

This is a **UI-only frontend demo**. The backend extraction API is not included or configured. The dashboard shows UI elements but won't process actual documents without a backend integration.

## License

MIT
# IntelliExtact-Web-App
