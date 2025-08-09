-- Mars Land Database Schema
-- This migration creates the initial database structure for Mars Land platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    music_url TEXT,
    diary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mars land plots table
CREATE TABLE public.lands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    land_id TEXT UNIQUE NOT NULL, -- Format: MARS-LAT-LNG (e.g., MARS-45-90)
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    position_x DECIMAL(10, 6) NOT NULL, -- 3D position on Mars sphere
    position_y DECIMAL(10, 6) NOT NULL,
    position_z DECIMAL(10, 6) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    is_owned BOOLEAN DEFAULT FALSE,
    owner_id UUID REFERENCES public.profiles(id),
    purchased_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Land ownership certificates
CREATE TABLE public.certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    certificate_id TEXT UNIQUE NOT NULL, -- Format: CERT-MARS-000001
    land_id UUID REFERENCES public.lands(id) NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'issued', 'rejected')),
    payment_id TEXT, -- PayPal payment ID
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_amount DECIMAL(10, 2),
    payment_currency TEXT DEFAULT 'USD',
    qr_code_url TEXT,
    pdf_url TEXT,
    verification_hash TEXT UNIQUE,
    nft_token_id TEXT,
    nft_contract_address TEXT,
    nft_metadata_uri TEXT,
    admin_notes TEXT,
    issued_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Building structures on land
CREATE TABLE public.buildings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    land_id UUID REFERENCES public.lands(id) NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    building_type TEXT NOT NULL, -- 'house', 'factory', 'farm', etc.
    name TEXT,
    description TEXT,
    grid_position JSONB NOT NULL, -- 20x20 grid position data
    model_url TEXT, -- 3D model file URL
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community messages/chat
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id), -- NULL for community messages
    land_id UUID REFERENCES public.lands(id), -- For location-based messages
    message_type TEXT DEFAULT 'private' CHECK (message_type IN ('private', 'community', 'neighbor')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community center posts
CREATE TABLE public.community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post comments
CREATE TABLE public.post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes
CREATE TABLE public.post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Admin settings
CREATE TABLE public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_lands_coordinates ON public.lands(latitude, longitude);
CREATE INDEX idx_lands_owner ON public.lands(owner_id);
CREATE INDEX idx_lands_owned ON public.lands(is_owned);
CREATE INDEX idx_certificates_owner ON public.certificates(owner_id);
CREATE INDEX idx_certificates_status ON public.certificates(status);
CREATE INDEX idx_certificates_payment ON public.certificates(payment_id);
CREATE INDEX idx_buildings_land ON public.buildings(land_id);
CREATE INDEX idx_buildings_owner ON public.buildings(owner_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_land ON public.messages(land_id);
CREATE INDEX idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Lands policies
CREATE POLICY "Lands are viewable by everyone" ON public.lands
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can purchase land" ON public.lands
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Certificates policies
CREATE POLICY "Users can view their own certificates" ON public.certificates
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Public certificate verification" ON public.certificates
    FOR SELECT USING (verification_hash IS NOT NULL);

CREATE POLICY "Users can create certificate requests" ON public.certificates
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Buildings policies
CREATE POLICY "Buildings are viewable by everyone" ON public.buildings
    FOR SELECT USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Land owners can manage their buildings" ON public.buildings
    FOR ALL USING (auth.uid() = owner_id);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id OR 
        message_type = 'community'
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Community posts policies
CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" ON public.community_posts
    FOR UPDATE USING (auth.uid() = author_id);

-- Post comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Post likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like posts" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Admin settings policies (only for admins)
CREATE POLICY "Admin settings are viewable by admins only" ON public.admin_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND email = 'tanloifmc@yahoo.com'
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.lands
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.buildings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert initial admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('land_base_price', '100', 'Base price for land plots in USD'),
('paypal_business_email', '"tanloifmc@yahoo.com"', 'PayPal business email for payments'),
('max_buildings_per_land', '10', 'Maximum buildings allowed per land plot'),
('community_center_enabled', 'true', 'Enable community center features'),
('nft_integration_enabled', 'false', 'Enable NFT integration features');

-- Insert sample land data (first 1000 plots)
DO $$
DECLARE
    lat DECIMAL;
    lng DECIMAL;
    land_id_str TEXT;
    pos_x DECIMAL;
    pos_y DECIMAL;
    pos_z DECIMAL;
    radius DECIMAL := 2.01;
    phi DECIMAL;
    theta DECIMAL;
BEGIN
    FOR lat IN -80..80 BY 2 LOOP
        FOR lng IN -180..180 BY 2 LOOP
            land_id_str := 'MARS-' || lat::TEXT || '-' || lng::TEXT;
            
            -- Calculate 3D position on Mars sphere
            phi := (90 - lat) * (PI() / 180);
            theta := (lng + 180) * (PI() / 180);
            
            pos_x := radius * SIN(phi) * COS(theta);
            pos_y := radius * COS(phi);
            pos_z := radius * SIN(phi) * SIN(theta);
            
            INSERT INTO public.lands (
                land_id, latitude, longitude, 
                position_x, position_y, position_z,
                price
            ) VALUES (
                land_id_str, lat, lng,
                pos_x, pos_y, pos_z,
                100 + (RANDOM() * 900)::INTEGER -- Random price between 100-1000
            );
            
            -- Exit after 1000 records for initial setup
            IF (SELECT COUNT(*) FROM public.lands) >= 1000 THEN
                EXIT;
            END IF;
        END LOOP;
        
        IF (SELECT COUNT(*) FROM public.lands) >= 1000 THEN
            EXIT;
        END IF;
    END LOOP;
END $$;

