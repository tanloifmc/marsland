# Mars Land Certificate System - Production

A professional Mars land ownership certificate system with blockchain integration, QR code verification, and NFT-ready features.

## 🚀 Tech Stack

### Frontend (Vercel)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript
- **Deployment**: Vercel

### Backend (Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Deno/TypeScript
- **Real-time**: Supabase Realtime

### Integrations
- **Payment**: Stripe (tanloifmc@yahoo.com)
- **Email**: Resend API
- **PDF Generation**: jsPDF + QR codes
- **Blockchain**: NFT-ready metadata

## 🏗️ Project Structure

```
mars-land-production/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configs
│   ├── types/               # TypeScript types
│   └── public/              # Static assets
├── supabase/                # Supabase configuration
│   ├── migrations/          # Database migrations
│   ├── functions/           # Edge functions
│   └── config.toml          # Supabase config
├── docs/                    # Documentation
└── scripts/                 # Deployment scripts
```

## 🌍 Features

### Core Features
- **Multi-language Support**: English (primary), Vietnamese, Chinese, Japanese, Spanish, French
- **Certificate Management**: Request, approve, issue certificates
- **Public Verification**: QR code and hash verification
- **Admin Dashboard**: Certificate review and management
- **PDF Generation**: Professional certificates with QR codes
- **Email Notifications**: Automated email system
- **NFT Integration**: Blockchain-ready metadata

### Business Features
- **PayPal Integration**: tanloifmc@yahoo.com
- **Global Market Ready**: English-first interface
- **Professional Design**: Mars theme with modern UI
- **Responsive**: Mobile and desktop optimized
- **SEO Optimized**: Search engine friendly

## 🚀 Deployment

### Prerequisites
- Vercel account
- Supabase account
- Stripe account
- Resend account

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Setup Supabase
1. Create new Supabase project
2. Run database migrations
3. Configure authentication providers
4. Set up storage buckets

## 📖 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [User Guide](./docs/USER_GUIDE.md)

## 🔐 Security

- JWT authentication via Supabase
- Row Level Security (RLS) policies
- Input validation and sanitization
- CORS configuration
- Rate limiting

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

For support, email: support@marsland.com
PayPal: tanloifmc@yahoo.com

