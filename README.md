# Course Platform — Setup Guide

A one-time-payment course website. Next.js + Supabase (auth/database) +
Paystack (payment) + Cloudflare R2 (video hosting).

Everything in this codebase is real and functional — you just need to
plug in your own accounts/API keys below, then run it.

---

## 1. Install dependencies

```bash
cd course-platform
npm install
```

## 2. Set up Supabase

You said you already have an account — good, this is quick:

1. Go to your Supabase project → **SQL Editor** → New query.
2. Paste the entire contents of `supabase/schema.sql` and run it.
   This creates the `purchases` and `videos` tables, security rules,
   and 10 placeholder video rows.
3. Go to **Project Settings → API**. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (keep secret!) → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Authentication → Providers** and make sure Email is enabled.
   Under **Authentication → URL Configuration**, set your site URL
   (e.g. `http://localhost:3000` for now, your real domain later).

## 3. Set up Cloudflare R2 (video storage)

1. In the Cloudflare dashboard, go to **R2** → Create bucket.
   Name it e.g. `course-videos`.
2. Upload your 10 video files here. Keep track of the file names/paths
   you use (e.g. `videos/module-1.mp4`) — you'll need these to match
   the `r2_object_key` values in the `videos` table.
3. Go to **R2 → Manage API Tokens → Create API Token**.
   Give it **Object Read & Write** permission, scoped to your bucket.
4. Copy the values into your `.env`:
   - Account ID → `R2_ACCOUNT_ID`
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`
   - Bucket name → `R2_BUCKET_NAME`
   - Endpoint (format: `https://<account-id>.r2.cloudflarestorage.com`) → `R2_ENDPOINT`

**Important:** keep the bucket **private** (not public access). The app
generates temporary signed URLs on the server — that's what enforces
the paywall. If the bucket is public, anyone with a direct link can
watch without paying.

After uploading, update the `r2_object_key` values in Supabase's
`videos` table (Table Editor → videos) to match your actual file names,
and edit the titles/descriptions to your real content.

## 4. Set up Paystack

1. Log in to your Paystack dashboard (use test mode keys first).
2. Go to **Settings → API Keys & Webhooks**. Copy:
   - Public Key → `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - Secret Key → `PAYSTACK_SECRET_KEY`
3. In the same page, set your **Webhook URL** to:
   ```
   https://yourdomain.com/api/paystack/webhook
   ```
   (While developing locally, use a tool like `ngrok` to expose
   `localhost:3000` temporarily and set the webhook to that ngrok URL.)
   This webhook is what actually confirms payment — don't skip it.

## 5. Configure your course details

Copy the example env file and fill in your real values:

```bash
cp .env.example .env.local
```

Edit `.env.local` — at minimum set:
- `NEXT_PUBLIC_COURSE_NAME`
- `NEXT_PUBLIC_COURSE_PRICE_NGN` (in whole Naira, e.g. 25000)
- `NEXT_PUBLIC_COURSE_PRICE_USD` (in whole Dollars, e.g. 20)
- `NEXT_PUBLIC_COURSE_DESCRIPTION`
- `NEXT_PUBLIC_SITE_URL` (your real domain once deployed)

## 6. Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000`. Try the full flow:
1. Sign up with a test email
2. Click "Pay now" — use Paystack's test card numbers (from their docs)
3. After payment, you should land on `/payment/success`, then unlock `/dashboard`

## 7. Deploy

Recommended: [Vercel](https://vercel.com) (built for Next.js, free tier
is enough to start).

1. Push this code to a GitHub repo.
2. Import the repo in Vercel.
3. Add all the same environment variables from `.env.local` into
   Vercel's project settings.
4. Update `NEXT_PUBLIC_SITE_URL` to your real Vercel/custom domain.
5. Update the Paystack webhook URL to point at your live domain.
6. Switch Paystack keys from test mode to live mode when ready to
   accept real payments.

---

## How the paywall actually works (so you can trust it)

- Videos are **never publicly accessible** — they sit in a private R2
  bucket.
- When a logged-in user clicks a lesson, the app calls `/api/video-url`,
  which checks the `purchases` table server-side for a `status: success`
  row tied to that user, and only then generates a temporary signed URL
  (expires in 1 hour).
- Payment status is only ever set to `success` by the Paystack
  **webhook** (`/api/paystack/webhook`), which verifies a cryptographic
  signature to confirm the request really came from Paystack. The
  browser redirect after payment is just a UX nicety — it can't be
  faked to grant access.

## Costs to expect (rough, not a quote)

- Supabase: free tier covers this easily at low volume.
- Cloudflare R2: storage ~$0.015/GB/month, **no egress fees** — this is
  why R2 over S3 for video.
- Paystack: takes a percentage per transaction (check current rates on
  their site).
- Hosting (Vercel): free tier is fine to start.
