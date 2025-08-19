# Mars Land - Complete Production Deployment Guide

## 🚀 Overview

Mars Land is a comprehensive web application for virtual Mars land ownership, featuring:
- 3D Mars exploration with Three.js
- Land purchasing with PayPal integration
- Building system with 20x20 grid
- Social features (Community, Messages, Profile)
- Administrative tools and certificate management

## 📋 Prerequisites

Before deploying Mars Land to production, ensure you have:

1. **Supabase Account** - For database and authentication
2. **PayPal Developer Account** - For payment processing
3. **Vercel Account** - For frontend deployment
4. **GitHub Account** - For code repository

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `mars-land-production`
5. Generate a strong database password
6. Select your region
7. Click "Create new project"

### 2. Run Database Migration

1. Navigate to "SQL Editor" in your Supabase dashboard
2. Copy the entire content from `supabase/migrations/20240808_initial_schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the migration
5. Verify all tables are created successfully:
   - profiles
   - lands (with 1000 sample plots)
   - certificates
   - buildings
   - messages
   - community_posts
   - post_comments
   - post_likes
   - admin_settings

### 3. Configure Storage

1. Go to "Storage" in Supabase dashboard
2. Create a new bucket named `avatars`
3. Set the bucket to public
4. Configure RLS policies for avatar uploads

### 4. Get Supabase Credentials

From your Supabase project settings, copy:
- `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
- `anon public key` (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 💳 PayPal Setup

### 1. Create PayPal App

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal account
3. Click "Create App"
4. Enter app name: `Mars Land Production`
5. Select your business account (tanloifmc@yahoo.com)
6. Choose "Default Application" features
7. Click "Create App"

### 2. Get PayPal Credentials

From your PayPal app dashboard, copy:
- `Client ID` (NEXT_PUBLIC_PAYPAL_CLIENT_ID)
- Business email: tanloifmc@yahoo.com

### 3. Configure Webhooks (Optional)

1. In PayPal app settings, go to "Webhooks"
2. Add webhook URL: `https://your-domain.vercel.app/api/paypal/webhook`
3. Select relevant events (payment completion, etc.)

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set up environment variables
# - Deploy
```

#### Option B: GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Select the `frontend` directory as root
6. Configure environment variables
7. Deploy

### 3. Configure Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## ⚙️ Admin Configuration

### 1. Set Admin User

1. Sign up for an account using `tanloifmc@yahoo.com` (or update admin check in code)
2. This email will have admin access to the admin panel at `/admin`

### 2. Configure System Settings

1. Access the admin panel at `/admin`
2. Go to "Settings" tab
3. Configure:
   - **Land base price**: Default $100
   - **PayPal business email**: tanloifmc@yahoo.com
   - **PayPal Client ID**: Your production Client ID
   - **Max buildings per land**: Default 10
   - **Community center enabled**: true
   - **NFT integration enabled**: false (for future use)

## 🧪 Testing

### 1. Test Core Features

- [ ] User registration and login
- [ ] Mars 3D viewer and land selection
- [ ] Land purchase flow with PayPal
- [ ] Certificate generation and management
- [ ] Building system with 20x20 grid
- [ ] Community posts and comments
- [ ] Messaging system between neighbors
- [ ] Profile management with avatar, bio, music, diary
- [ ] Admin panel and certificate approval

### 2. Test Payment Flow

1. Use PayPal sandbox for testing
2. Create test accounts in PayPal Developer Dashboard
3. Test complete purchase flow
4. Verify certificate generation
5. Test admin approval workflow

### 3. Test Social Features

- Community posts creation and interaction
- Neighbor discovery and messaging
- Profile customization
- Music player functionality
- Diary system

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use Vercel environment variables for production
- Rotate keys regularly

### 2. Database Security

- RLS policies are properly configured
- Admin access restricted to tanloifmc@yahoo.com
- User data isolation enforced

### 3. Payment Security

- Use HTTPS for all payment operations
- Validate payment data server-side
- Implement proper error handling

## 📊 Monitoring

### 1. Application Monitoring

- Monitor Vercel deployment logs
- Set up error tracking (Sentry, etc.)
- Monitor performance metrics

### 2. Database Monitoring

- Monitor Supabase dashboard for usage
- Set up alerts for high usage
- Regular database backups

### 3. Payment Monitoring

- Monitor PayPal transaction logs
- Set up alerts for failed payments
- Regular reconciliation of payments

## 🚀 Production Checklist

### Pre-Deployment

- [ ] Database migration completed with sample data
- [ ] Environment variables configured
- [ ] PayPal app created and configured
- [ ] Admin user set up (tanloifmc@yahoo.com)
- [ ] All features tested (3D viewer, payments, social)
- [ ] Performance optimized
- [ ] Security review completed

### Post-Deployment

- [ ] DNS configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Admin panel accessible at /admin
- [ ] Payment flow tested in production
- [ ] Social features working
- [ ] Monitoring set up
- [ ] Backup strategy implemented

## 🆘 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies allow access

2. **PayPal Payment Issues**
   - Verify PayPal Client ID in admin settings
   - Check PayPal app configuration
   - Ensure business account is verified

3. **3D Viewer Performance**
   - Check browser compatibility
   - Verify Three.js loading
   - Monitor memory usage

4. **Social Features Issues**
   - Verify database tables exist
   - Check RLS policies for social tables
   - Test neighbor discovery algorithm

## 📈 Features Overview

### Core Features
- **3D Mars Viewer**: Interactive Mars planet with 1000+ land plots
- **Land Purchase**: PayPal integration with certificate generation
- **Building System**: 20x20 grid with drag & drop building editor
- **Authentication**: Supabase auth with profile management

### Social Features
- **Community Center**: Posts, comments, likes system
- **Messaging**: Private messaging between neighbors
- **Profile System**: Avatar, bio, music player, diary
- **Neighbor Discovery**: Automatic neighbor finding based on land proximity

### Admin Features
- **Certificate Management**: Approve/reject certificate requests
- **System Settings**: Configure PayPal, pricing, features
- **Analytics Dashboard**: User stats, revenue tracking
- **User Management**: View and manage user accounts

## 🔄 Maintenance

### Regular Tasks

- Update dependencies
- Monitor security vulnerabilities
- Review and optimize database queries
- Update documentation
- Backup critical data
- Review certificate requests
- Monitor payment transactions

### Updates

- Test updates in staging environment
- Use Vercel preview deployments
- Monitor deployment for issues
- Rollback if necessary

---

## 📞 Contact

For questions or support regarding Mars Land deployment:

- **Email**: tanloifmc@yahoo.com
- **GitHub**: https://github.com/tanloifmc/marsland
- **Project**: Mars Land Virtual Real Estate Platform

---

*Last updated: August 2024*

