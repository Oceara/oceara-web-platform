# 🔐 Supabase Authentication Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Create an account (free tier available)
4. Create a new organization (e.g., "Oceara")
5. Create a new project:
   - **Name**: oceara-platform
   - **Database Password**: (Choose a strong password - save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

## Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the sidebar
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Enable Google OAuth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to configure
3. Toggle **Enable Sign in with Google**
4. You need Google OAuth credentials:

### Get Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Configure consent screen if needed
7. Application type: **Web application**
8. **Authorized redirect URIs**: Add this URL:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   (Get exact URL from Supabase Google provider settings)
9. Copy **Client ID** and **Client Secret**
10. Paste them in Supabase Google provider settings
11. Click **Save**

## Step 4: Create Database Tables

Run this SQL in **SQL Editor** in Supabase dashboard:

```sql
-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text check (role in ('landowner', 'buyer', 'administrator')),
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create projects table
create table if not exists public.projects (
  id serial primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  location text not null,
  area numeric not null,
  coordinates jsonb not null,
  status text check (status in ('Pending Review', 'Under Verification', 'Active', 'Verified', 'Rejected')) default 'Pending Review',
  verified boolean default false,
  description text,
  species text[],
  tree_count integer,
  credits_available integer default 0,
  credits_minted integer default 0,
  price_per_credit numeric default 25,
  impact text,
  image text,
  ml_analysis jsonb,
  field_data jsonb,
  satellite_images text[],
  submitted_date date default current_date,
  verification_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table if not exists public.transactions (
  id serial primary key,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  project_id integer references public.projects(id) on delete cascade not null,
  credits_purchased integer not null,
  total_cost numeric not null,
  tx_hash text,
  status text check (status in ('pending', 'confirmed', 'failed')) default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.transactions enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Projects policies
create policy "Projects are viewable by everyone"
  on public.projects for select
  using (true);

create policy "Landowners can create projects"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "Landowners can update own projects"
  on public.projects for update
  using (auth.uid() = owner_id);

-- Transactions policies
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = buyer_id);

create policy "Buyers can create transactions"
  on public.transactions for insert
  with check (auth.uid() = buyer_id);

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Step 5: Configure Environment Variables

Create `.env.local` file in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Firebase (for phone OTP)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 6: Firebase Setup (for Phone OTP)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Go to **Authentication** → **Sign-in method**
4. Enable **Phone** authentication
5. Add your domain to authorized domains
6. Go to **Project Settings** → copy the config values
7. Add them to `.env.local`

## Step 7: Test Authentication

1. Run `npm run dev`
2. Go to `http://localhost:3000`
3. Try:
   - ✅ Google sign-in
   - ✅ Phone OTP
   - ✅ Demo user bypass

## 🎉 Done!

Your authentication is now fully configured with:
- ✅ Real Google OAuth
- ✅ Phone OTP verification
- ✅ PostgreSQL database
- ✅ Row-level security
- ✅ Session management

