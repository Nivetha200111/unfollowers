# Supabase Setup Guide

Follow these steps to set up your Supabase database for the Follower Manager app.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `follower-manager` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be created (this takes a few minutes)

## Step 2: Get Your Project Credentials

1. Once your project is ready, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/schema-simple.sql` and paste it into the editor
4. Click "Run" to execute the SQL

## Step 4: Configure Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   # Supabase
   REACT_APP_SUPABASE_URL="https://your-project-id.supabase.co"
   REACT_APP_SUPABASE_ANON_KEY="your-anon-key-here"

   # Twitter OAuth Credentials
   TWITTER_CLIENT_ID="your_twitter_client_id"
   TWITTER_CLIENT_SECRET="your_twitter_client_secret"

   # JWT Secret (generate a strong secret)
   JWT_SECRET="your-super-secret-jwt-key-here"

   # Encryption Key (for storing sensitive tokens)
   ENCRYPTION_KEY="your-encryption-key-here"
   ```

## Step 5: Set Up Twitter OAuth

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create a new app or use an existing one
3. In your app settings, go to **Authentication settings**
4. Enable **OAuth 2.0**
5. Add your callback URL: `http://localhost:3000/api/auth/callback` (for development)
6. Copy your **Client ID** and **Client Secret**

## Step 6: Test the Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser
4. Try to log in with Twitter

## Troubleshooting

### Database Connection Error
If you get a "connection to the database" error:
1. Make sure you're using the correct Project URL
2. Check that your anon key is correct
3. Verify the database schema was created successfully

### Twitter OAuth Error
If Twitter authentication fails:
1. Check your Twitter app settings
2. Make sure the callback URL is correct
3. Verify your Client ID and Secret

### Environment Variables Not Loading
If environment variables aren't loading:
1. Make sure `.env.local` is in the root directory
2. Restart your development server
3. Check that variable names start with `REACT_APP_`

## Production Deployment

For production deployment on Vercel:

1. Add all environment variables to your Vercel project settings
2. Update the Twitter callback URL to your production domain
3. Deploy your project

The app will automatically use the production environment variables when deployed.
