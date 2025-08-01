# Mars Land Certificate System - Deployment Guide

Complete deployment guide for Mars Land Certificate System with Vercel (frontend) and Supabase (backend).

## 🚀 Quick Start

### Prerequisites
- GitHub account
- Vercel account
- Supabase account
- PayPal Business account (tanloifmc@yahoo.com)
- Resend account (for emails)

## 📋 Step-by-Step Deployment

### 1. Setup Supabase Backend

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization/project
4. Choose region closest to your users
5. Wait for project to be ready

#### Run Database Migrations
1. Go to SQL Editor in Supabase dashboard
2. Copy content from `supabase/migrations/001_initial_schema.sql`
3. Run the SQL script
4. Verify tables are created in Table Editor

#### Configure Authentication
1. Go to Authentication > Settings
2. Enable email authentication
3. Configure redirect URLs:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/**`

#### Setup Storage
1. Go to Storage
2. Buckets should be auto-created from migration
3. Verify `certificates` and `avatars` buckets exist

#### Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy generate-certificate-pdf
supabase functions deploy send-email-notification
```

### 2. Setup PayPal Integration

#### PayPal Developer Account
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Login with tanloifmc@yahoo.com
3. Create new app for Mars Land Certificate System
4. Get Client ID and Client Secret
5. Configure webhook endpoints (optional)

#### PayPal Configuration
- **Business Email**: tanloifmc@yahoo.com
- **Currency**: USD (primary), EUR, GBP (optional)
- **Environment**: Sandbox for testing, Live for production

### 3. Setup Email Service (Resend)

#### Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up and verify email
3. Create API key
4. Add domain (optional for custom emails)

### 4. Deploy Frontend to Vercel

#### Prepare Repository
1. Push code to GitHub repository
2. Ensure all files are committed
3. Repository should be public or accessible to Vercel

#### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

#### Environment Variables
Add these environment variables in Vercel dashboard:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Email Configuration
RESEND_API_KEY=your_resend_api_key
```

### 5. Configure Custom Domain (Optional)

#### Add Custom Domain
1. In Vercel dashboard, go to Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update environment variables with new domain

#### SSL Certificate
- Vercel automatically provides SSL certificates
- Verify HTTPS is working
- Update all URLs to use HTTPS

## 🔧 Configuration Details

### Supabase Configuration

#### Row Level Security (RLS)
The database includes comprehensive RLS policies:
- Users can only access their own data
- Admins have elevated permissions
- Public verification is allowed for issued certificates

#### Storage Policies
- Certificate PDFs are publicly accessible
- User avatars are private to owners
- Admin can manage all files

### PayPal Configuration

#### Webhook Setup (Optional)
Configure webhooks for payment notifications:
- Endpoint: `https://your-domain.vercel.app/api/webhooks/paypal`
- Events: Payment completed, Payment failed

#### Currency Support
- Primary: USD
- Additional: EUR, GBP, CAD, AUD
- Automatic conversion available

### Email Templates

#### Resend Configuration
Email templates are built-in the Edge Functions:
- Certificate issued notification
- Certificate approved notification
- Admin new request notification

## 🧪 Testing

### Test Accounts

#### PayPal Sandbox
Use PayPal sandbox for testing:
- Buyer account: Create in PayPal Developer Dashboard
- Seller account: tanloifmc@yahoo.com (sandbox)

#### Test Data
Create test certificates with:
- Valid email addresses
- Test land coordinates
- Small amounts for testing

### Verification Testing
1. Create test certificate
2. Verify QR code generation
3. Test public verification page
4. Verify email notifications

## 🔒 Security Checklist

### Environment Variables
- [ ] All secrets are in environment variables
- [ ] No hardcoded API keys in code
- [ ] Production vs development environments separated

### Database Security
- [ ] RLS policies are enabled
- [ ] Service role key is secure
- [ ] Database backups are configured

### API Security
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Monitor function execution times
- Track user engagement

### Supabase Monitoring
- Monitor database performance
- Track API usage
- Set up alerts for errors

### Error Tracking
Consider adding error tracking:
- Sentry for error monitoring
- LogRocket for user session replay
- Custom logging for business metrics

## 🚀 Production Optimization

### Performance
- [ ] Images are optimized
- [ ] Code is minified
- [ ] Caching is configured
- [ ] CDN is utilized

### SEO
- [ ] Meta tags are configured
- [ ] Sitemap is generated
- [ ] Robots.txt is configured
- [ ] Schema markup is added

### Accessibility
- [ ] WCAG guidelines followed
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast is sufficient

## 🔄 Maintenance

### Regular Tasks
- Monitor certificate requests
- Review payment transactions
- Update dependencies
- Backup database

### Updates
- Test updates in staging environment
- Deploy during low-traffic periods
- Monitor for issues after deployment
- Have rollback plan ready

## 📞 Support

### Documentation
- API documentation: `/docs/API.md`
- User guide: `/docs/USER_GUIDE.md`
- Admin manual: `/docs/ADMIN_MANUAL.md`

### Contact Information
- Technical Support: support@marsland.com
- Business Inquiries: tanloifmc@yahoo.com
- Emergency Contact: Available in admin panel

## 🎉 Go Live Checklist

### Pre-Launch
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] PayPal live mode enabled
- [ ] Email templates tested

### Launch
- [ ] Deploy to production
- [ ] Verify all functionality
- [ ] Test payment flow
- [ ] Send test emails
- [ ] Monitor for errors

### Post-Launch
- [ ] Monitor performance
- [ ] Track user registrations
- [ ] Review payment transactions
- [ ] Collect user feedback
- [ ] Plan future updates

---

**Congratulations! Your Mars Land Certificate System is now live! 🚀**

For support or questions, contact: tanloifmc@yahoo.com

