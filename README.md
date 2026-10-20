# Fashion with Ankita

Fashion with Ankita is a premium, feminine fashion-discovery website with a secure admin dashboard. The app is built for publishing daily women’s fashion looks, affiliate shopping links, and curated editorial experience.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase Auth + PostgreSQL + Storage
- React Hook Form + Zod
- Sonner
- Lucide React

## Local setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
2. Fill in your project values in `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   VITE_SUPABASE_STORAGE_BUCKET=fashion-media
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

## Supabase configuration

1. Create a Supabase project.
2. Run the migration in `supabase/migrations/001_initial_schema.sql`.
3. Create or confirm the bucket `fashion-media` and set it public.
4. Apply the storage policies in `supabase/storage_policies.sql`.
5. Create the admin account in Supabase Auth.
6. Insert the authenticated user id into `admin_users`:
   ```sql
   insert into admin_users (user_id)
   values ('<auth-user-id>');
   ```
7. Log in at `/admin/login`.

## Admin authorization model

Public visitors can read only published looks. Database-level access is protected by row-level security. The app uses the `is_admin_user()` function and the `admin_users` table to enforce admin-only mutation access.

## Deployment

### Vercel

- Import the project into Vercel.
- Add the environment variables from `.env.example`.
- Build command: `npm run build`
- Publish directory: `dist`

### Netlify

- Import the GitHub repo.
- Add the same environment variables.
- Build command: `npm run build`
- Publish directory: `dist`

## Database and media notes

- Public content queries should only read rows where `status = 'published'` and `published_at <= now()`.
- Media files are stored in Supabase Storage with paths stored in the database.
- Affiliate URLs are saved exactly as supplied by the administrator and opened in a new tab.
- The application includes affiliate disclosures and AI-generated visual disclosures.

## Acceptance checklist

- Admin login works with a valid Supabase user.
- A draft post remains hidden from public visitors.
- A published post appears on the home page and looks list.
- Category and search filtering works.
- A look detail page loads with the gallery and shopping buttons.
- Editing and deleting look records works from the admin area.
- Only authorized admins can write to the database or storage.
- The site is mobile and desktop responsive.

## Important

This project is ready for a real Supabase configuration. Without a valid Supabase URL, anon key, and initialized database, the app will display the front-end shell and require the admin setup described above.
