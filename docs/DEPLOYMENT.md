# Deployment

Static build, deployed to Firebase Hosting. Same target as the current site.

```bash
npm run build     # token guard → typecheck → client → ssr → prerender
npx firebase deploy --only hosting
```

`npm run build` produces `dist/` containing a real HTML file per route, plus
`robots.txt` and `sitemap.xml`. Nothing is generated at request time.

---

## 🔴 Fix this first: `www.delphiverify.com` is broken

**This is a live fault on the current site, independent of the redesign.**

`www.delphiverify.com` presents a certificate for `CN=firebaseapp.com`, whose
SANs cover only `firebaseapp.com` and `*.firebaseapp.com`. The `www` hostname
was never added to Firebase Hosting, so it has no certificate of its own.

Verify it yourself:

```bash
echo | openssl s_client -connect delphiverify.com:443 \
  -servername www.delphiverify.com 2>/dev/null \
  | openssl x509 -noout -subject -ext subjectAltName
```

Every visitor who types `www.` gets a full-page browser security interstitial —
the strongest possible negative trust signal, on a site selling trust.

**Fix:** Firebase console → Hosting → Add custom domain → `www.delphiverify.com`
→ add the DNS records Firebase provides → wait for certificate provisioning
(usually under an hour) → confirm it redirects to the apex.

Re-check after provisioning:

```bash
curl -sS -o /dev/null -w "%{http_code} %{redirect_url}\n" -L https://www.delphiverify.com
```

---

## Before the first production deploy

**Analytics.** There is currently no analytics on the live site, so there is no
baseline to judge this redesign against. Install something before cutting over,
not after. If you use a self-hosted or cookieless tool, the strict CSP in
`firebase.json` needs `script-src` and `connect-src` widened for that host only.

**Legal pages.** `/privacy` and `/terms` render draft content with visible
reviewer notes. Either port the current published text or have counsel complete
them. They must not ship in draft state.

**Localisation.** The current site serves 16 locales. This build ships English
only. See `docs/DESIGN-DECISIONS.md` §7 — the recommendation is to reintroduce
locales deliberately rather than machine-translating technical and legal copy.

**Redirects from the old site.** ✅ Configured in `firebase.json`:

| Old | New | Note |
|---|---|---|
| `/product` | `/platform` | 301 |
| `/verify-hashes` | `/verify` | 301 |
| `/download` | `/platform` | 301 — **but see below** |

**Open question on `/download`.** The old site had a dedicated iOS download
page; this build redirects it to `/platform`. If App Store installs matter as a
conversion path, that page should be rebuilt rather than redirected — a redirect
loses anyone arriving from an existing "download the app" link.

---

## Configuration notes

**`trailingSlash: true`** is set deliberately. The prerender step writes
`dist/platform/index.html`, so the served URL is `/platform/`, and each page's
canonical tag is generated to match. The old site declared `/product` as
canonical while serving `/product/`, which sent a mixed signal to crawlers.

**Caching.** Hashed assets under `/assets/**` are immutable and cached for a
year. HTML revalidates on every request so a deploy is visible immediately.

**CSP.** Strict by design — this site loads no third-party scripts, fonts or
frames, which is unusual enough to be worth preserving. Fonts are self-hosted
(see `docs/DESIGN-DECISIONS.md` §4 for the GDPR reasoning). If you add a
third-party service, widen the policy for that specific host rather than
loosening it generally.

`'unsafe-inline'` is present for `script-src` because `index.html` carries the
inline theme-bootstrap script that prevents a light flash before first paint,
and for `style-src` because of React inline styles. Both could be tightened
with a nonce if the hosting layer ever supports one.
