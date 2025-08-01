-- Mars Land Certificate System Database Schema
-- Created for Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE certificate_status AS ENUM ('pending', 'approved', 'rejected', 'issued');
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mars land parcels
CREATE TABLE public.land_parcels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    land_id TEXT UNIQUE NOT NULL, -- MARS-001-001-001 format
    coordinates TEXT NOT NULL, -- "Lat: -14.5684, Lng: 175.4728"
    size_sqm INTEGER NOT NULL DEFAULT 1000, -- Size in square meters
    region TEXT NOT NULL, -- "Olympia Undae", "Valles Marineris", etc.
    price_usd DECIMAL(10,2) NOT NULL DEFAULT 29.99,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    purchased_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificate templates
CREATE TABLE public.certificate_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    design_config JSONB NOT NULL, -- Store design configuration
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates
CREATE TABLE public.certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    certificate_id TEXT UNIQUE NOT NULL, -- CERT-MARS-000001 format
    land_parcel_id UUID REFERENCES public.land_parcels(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.certificate_templates(id),
    
    -- Certificate details
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    land_coordinates TEXT NOT NULL,
    land_size TEXT NOT NULL,
    land_value DECIMAL(10,2) NOT NULL,
    
    -- Status and workflow
    status certificate_status DEFAULT 'pending',
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_date TIMESTAMP WITH TIME ZONE,
    issued_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.profiles(id),
    
    -- Verification
    verification_hash TEXT UNIQUE NOT NULL,
    qr_code_url TEXT,
    
    -- PDF storage
    pdf_draft_url TEXT,
    pdf_final_url TEXT,
    
    -- NFT integration
    nft_token_id TEXT,
    nft_contract_address TEXT,
    nft_metadata_uri TEXT,
    nft_blockchain TEXT DEFAULT 'ethereum',
    
    -- Admin notes
    admin_notes TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificate requests (for tracking workflow)
CREATE TABLE public.certificate_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL, -- 'new', 'reissue', 'update'
    request_data JSONB, -- Store request details
    status TEXT DEFAULT 'pending',
    processed_by UUID REFERENCES public.profiles(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email notifications log
CREATE TABLE public.email_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_name TEXT,
    certificate_id UUID REFERENCES public.certificates(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE public.payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    certificate_id UUID REFERENCES public.certificates(id),
    user_id UUID REFERENCES public.profiles(id),
    payment_method TEXT NOT NULL, -- 'stripe', 'paypal'
    payment_id TEXT NOT NULL, -- External payment ID
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    payment_data JSONB, -- Store payment details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_certificates_status ON public.certificates(status);
CREATE INDEX idx_certificates_owner ON public.certificates(owner_id);
CREATE INDEX idx_certificates_verification_hash ON public.certificates(verification_hash);
CREATE INDEX idx_land_parcels_owner ON public.land_parcels(owner_id);
CREATE INDEX idx_land_parcels_land_id ON public.land_parcels(land_id);
CREATE INDEX idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);

-- Create functions for auto-generating IDs
CREATE OR REPLACE FUNCTION generate_certificate_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
    formatted_id TEXT;
BEGIN
    -- Get the next certificate number
    SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_id FROM 11) AS INTEGER)), 0) + 1
    INTO next_id
    FROM public.certificates
    WHERE certificate_id LIKE 'CERT-MARS-%';
    
    -- Format as CERT-MARS-000001
    formatted_id := 'CERT-MARS-' || LPAD(next_id::TEXT, 6, '0');
    
    RETURN formatted_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_land_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
    region_code TEXT;
    sector_code TEXT;
    parcel_code TEXT;
BEGIN
    -- Get the next land parcel number
    SELECT COALESCE(MAX(CAST(SUBSTRING(land_id FROM 10) AS INTEGER)), 0) + 1
    INTO next_id
    FROM public.land_parcels;
    
    -- Generate region, sector, and parcel codes
    region_code := LPAD((next_id / 1000000 + 1)::TEXT, 3, '0');
    sector_code := LPAD(((next_id / 1000) % 1000 + 1)::TEXT, 3, '0');
    parcel_code := LPAD((next_id % 1000 + 1)::TEXT, 3, '0');
    
    RETURN 'MARS-' || region_code || '-' || sector_code || '-' || parcel_code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_land_parcels_updated_at BEFORE UPDATE ON public.land_parcels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificate_templates_updated_at BEFORE UPDATE ON public.certificate_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default certificate template
INSERT INTO public.certificate_templates (name, description, design_config) VALUES
('Mars Standard Certificate', 'Standard Mars land ownership certificate with Mars theme', '{
  "colors": {
    "primary": "#dc2626",
    "secondary": "#f97316",
    "background": "#7f1d1d",
    "text": "#ffffff"
  },
  "fonts": {
    "title": "Arial Black",
    "body": "Arial",
    "size_title": 24,
    "size_body": 12
  },
  "layout": {
    "width": 800,
    "height": 600,
    "margin": 50
  },
  "elements": {
    "logo": true,
    "qr_code": true,
    "mars_background": true,
    "border": true
  }
}');

-- Insert system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('paypal_email', '"tanloifmc@yahoo.com"', 'PayPal business email for payments'),
('certificate_price', '29.99', 'Price for certificate issuance in USD'),
('auto_approve', 'false', 'Automatically approve certificate requests'),
('email_notifications', 'true', 'Enable email notifications'),
('nft_enabled', 'true', 'Enable NFT integration features');

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create certificate requests" ON public.certificates FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins can view all certificates" ON public.certificates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public can verify certificates" ON public.certificates FOR SELECT USING (status = 'issued');

-- Land parcels policies
CREATE POLICY "Users can view own land parcels" ON public.land_parcels FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Admins can manage land parcels" ON public.land_parcels FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Payment transactions policies
CREATE POLICY "Users can view own transactions" ON public.payment_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all transactions" ON public.payment_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('certificates', 'certificates', true),
('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Certificate PDFs are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can manage certificate files" ON storage.objects FOR ALL USING (
    bucket_id = 'certificates' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

