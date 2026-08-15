# Setup Guide — The League of Extraordinary Asshole

This is a Next.js app with Supabase (auth + database) as the backend, meant
to be deployed on Netlify with your own domain. Follow these steps in order.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project.
2. Once it's created, go to **Project Settings → API**. You'll need two values:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Go to **SQL Editor → New query**, paste in the entire contents of
   `supabase/schema.sql` from this project, and click **Run**. This creates
   all the tables (polls, notes, trade board, resources, rules, hall of
   fame) plus the security rules that keep the site private to your league.
4. Go to **Authentication → Providers** and make sure **Email** is enabled
   (it is by default). If you don't want managers to have to click a
   confirmation email link before logging in, go to **Authentication →
   Settings** and turn off "Confirm email" — simpler for a small private
   league.

## 2. Push this project to GitHub

Netlify deploys from a Git repo, so this project needs to live in one.

```bash
cd loea-league-site
git add -A
git commit -m "Initial site"
```

Create a new repo on GitHub (or GitLab/Bitbucket), then push:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## 3. Deploy on Netlify

1. In Netlify, click **Add new site → Import an existing project**, and
   connect the GitHub repo you just pushed.
2. Netlify should auto-detect the settings from `netlify.toml` in this
   project (build command `npm run build`, the `@netlify/plugin-nextjs`
   plugin). Just click **Deploy**.
3. Once the first deploy is running, go to **Site configuration →
   Environment variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   (Use the values from step 1.) Then trigger a redeploy (**Deploys → Trigger
   deploy → Deploy site**) so the build picks them up.

## 4. Connect your domain

In Netlify: **Site configuration → Domain management → Add a domain**, enter
your domain, and follow Netlify's instructions to point your domain's DNS at
Netlify (usually adding an A record or changing nameservers, depending on
where you bought the domain). Netlify issues a free HTTPS certificate
automatically once DNS is pointed correctly — this can take anywhere from a
few minutes to a few hours to propagate.

## 5. Make yourself commissioner

1. Visit your live site and sign up for an account (this is your manager
   account — email + password).
2. Back in Supabase, go to **SQL Editor** and run (swap in the email you
   just signed up with):

   ```sql
   update public.profiles set is_commissioner = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```

3. Refresh the site — you'll now see commissioner-only controls: posting
   manager notes, creating polls, and editing the Rules and Hall of Fame
   pages.
4. Repeat step 1 for the rest of your league — everyone creates their own
   account. You don't need to do anything else to add them; there's no
   invite code required (see the note on privacy below).

## 6. Connect live ESPN standings (optional)

If your league is on ESPN Fantasy Football, add these to Netlify's
environment variables (same place as step 3) to power the Standings page:

- `ESPN_LEAGUE_ID` — found in your ESPN league's URL,
  e.g. `.../leagueId=1234567` → `1234567`
- `ESPN_SEASON_YEAR` — e.g. `2026`

If your league is **private** (most are), you also need two cookies from a
browser where you're logged into ESPN Fantasy:

1. Log into [fantasy.espn.com](https://fantasy.espn.com) and open your league.
2. Open your browser's developer tools (F12 or right-click → Inspect) →
   **Application** (Chrome) or **Storage** (Firefox) tab → **Cookies** →
   the fantasy.espn.com entry.
3. Copy the values of the `SWID` and `espn_s2` cookies.
4. Add them to Netlify as `ESPN_SWID` and `ESPN_S2`.

Redeploy after adding these. The Standings page checks for these
automatically and shows a setup notice if they're missing.

## 7. Running it locally (optional, for future edits)

```bash
npm install
cp .env.local.example .env.local
# fill in .env.local with your Supabase URL/key (and ESPN vars if you want)
npm run dev
```

Then open http://localhost:3000.

## A note on privacy

Right now, anyone with your site's URL can create an account and see
everything (polls, trade chat, notes) — there's no invite code gate. For a
private league that's normally fine since the URL isn't public anywhere,
but if you want to lock signups down further later (e.g. an invite-only
allowlist of emails), that's a small follow-up change — just ask.
