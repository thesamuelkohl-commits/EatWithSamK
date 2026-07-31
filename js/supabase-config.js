/* ============================================================
   SUPABASE CONFIG — fill these in, then real accounts work.

   1. Create a free project at https://supabase.com (Sign up → New project).
   2. In the SQL Editor, run the script from `supabase/favorites.sql`
      in this repo — it creates the `favorites` table and locks it down
      so each visitor can only ever see/edit their own rows.
   3. Go to Project Settings → API and copy:
       - "Project URL"       → SUPABASE_URL below
       - "anon" "public" key → SUPABASE_ANON_KEY below
      (The anon key is safe to expose in client-side code like this —
      it's meant to be public. The `favorites.sql` policies are what
      actually keep everyone's data private, not this key.)
   4. Go to Authentication → URL Configuration and add every URL
      you'll sign in from to "Redirect URLs", e.g.:
       - http://localhost:8123/*   (local testing)
       - https://www.eatwithsamk.com/*   (once live)

   Until this is filled in, the "Sign In" button will show a friendly
   error instead of crashing the page — favorites still work as a
   guest (saved to this browser only), same as before.
   ============================================================ */

const SUPABASE_URL = "https://gmxjjnjhsiswlxdygaei.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Ny_jgxS5Gs7PPd5JQPpcoQ_mvdmNS1B";
