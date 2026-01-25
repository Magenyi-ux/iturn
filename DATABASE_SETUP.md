# Supabase Database Setup Guide

To get your database working again, follow these steps:

## 1. Create a Supabase Project
1. Go to [Supabase.com](https://supabase.com/) and sign in.
2. Click **New Project** and follow the prompts.

## 2. Get your API Keys
1. Once your project is ready, click the **Settings** (gear icon) in the sidebar.
2. Go to **API**.
3. Copy the **Project URL**.
4. Copy the **anon** **public** key.

## 3. Configure the App
1. Create a file named `.env` in the root of this project.
2. Paste the following into the file, replacing the placeholders with your actual keys:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## 4. Set up the Database Table
1. Go to the **SQL Editor** in the Supabase sidebar.
2. Click **New Query**.
3. Paste the following SQL script and click **Run**:

```sql
-- Create the user_state table to store app data
create table user_state (
  id uuid references auth.users not null primary key,
  state jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table user_state enable row level security;

-- Create a policy so users can only see/edit their own data
create policy "Users can manage their own state."
  on user_state for all
  using ( auth.uid() = id );
```

## 5. Restart the App
Once you've added the `.env` file and run the SQL script, restart your development server. The app will now automatically detect your database and use it instead of local storage.
