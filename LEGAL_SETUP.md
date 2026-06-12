# Vovu Legal Setup — Termly.io

## Step 1 — Create Termly account
Go to: https://app.termly.io/sign-up
Sign up with your business email.
Plan: Start with Free (covers Privacy Policy + Terms).

## Step 2 — Create Privacy Policy
1. Dashboard → Add New Website
2. Website name: Vovu
3. Website URL: https://moonjab-dot-com.github.io/vovu-app
4. Category: Social Networking
5. Click "Generate Privacy Policy"

Answer these questions in Termly:
- Do you collect personal data? YES
- What data do you collect?
  ✓ Email address (.edu only)
  ✓ First name
  ✓ University/campus
  ✓ User-generated content (plans, preferences)
  ✓ Usage data (which plans viewed, applied to)
- Do you use cookies? YES (Supabase session)
- Do you share data with third parties?
  ✓ Supabase (database hosting)
  ✓ Resend (email delivery)
  ✓ GitHub Pages (hosting)
  NOT sold to advertisers — select NO
- Is your app directed at children under 13? NO
- Do you comply with COPPA? YES (18+ via .edu)
- GDPR applicable? YES (select if any EU users possible)
- CCPA applicable? YES (California students)

6. Generate → Copy the hosted URL Termly provides

## Step 3 — Create Terms of Use
1. Dashboard → Terms and Conditions
2. Same website
3. Key answers:
   - Service type: Social networking platform
   - Users must be 18+? YES (.edu implies college age)
   - User-generated content allowed? YES
   - Can users be banned? YES
   - Governing law: State of Ohio
     (Kenyon College is in Ohio)
   - Dispute resolution: Informal negotiation first
4. Generate → Copy the hosted URL

## Step 4 — Get your hosted URLs
Termly gives you hosted pages at URLs like:
  https://app.termly.io/policy/privacy/YOUR-ID
  https://app.termly.io/policy/terms-and-conditions/YOUR-ID

## Step 5 — Update the HTML files
In privacidad.html, replace:
  TERMLY_PRIVACY_URL_HERE
with your Termly Privacy Policy URL.

In terminos.html, replace:
  TERMLY_TERMS_URL_HERE
with your Termly Terms of Use URL.

Then update the [DATE] placeholders in both files with today's date (e.g., June 12, 2026).

## Step 6 — Register legal email addresses
- privacy@vovu.app → forward to your personal email
- legal@vovu.app → forward to your personal email

(Use your domain registrar / Google Workspace / Resend to set up forwarding.)

## Step 7 — Run RLS policies in Supabase
See the SQL section in COMPLIANCE_SQL.md (generated separately).
Go to: Supabase Dashboard → SQL Editor → New Query → paste and run.

## Step 8 — Commit the URL updates
After replacing the Termly URLs and dates:
  git add privacidad.html terminos.html
  git commit -m "legal: update Termly URLs and effective dates"
  git push origin main
