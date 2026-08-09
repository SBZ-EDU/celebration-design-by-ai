# Deployment — جشن‌ساز

## GitHub
- https://github.com/SBZ-EDU/celebration-design-by-ai
- Branch: main

## Cloudflare Pages
- Account ID: 5b456a2b43bb367410c50b35b9e7f71f
- Project: celebration-design-by-ai
- Live: https://celebration-design-by-ai.pages.dev
- Latest: https://f9dacfc5.celebration-design-by-ai.pages.dev
- Token name: ancient-fire-1864 (store in GitHub Secrets, don't commit)

### Manual
npm run build
CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=xxx npx wrangler pages deploy dist --project-name=celebration-design-by-ai

### GitHub Action
.github/workflows/deploy.yml auto deploys on push if secrets set.

### Setup Secrets (via UI)
gh secret set CLOUDFLARE_API_TOKEN -b "your_token"
gh secret set CLOUDFLARE_ACCOUNT_ID -b "5b456a2b43bb367410c50b35b9e7f71f"

Or via GitHub web: Settings > Secrets and variables > Actions

## R2
You gave AccessKeyId 51ff55b29... but Secret missing + R2 not enabled.
Enable at Cloudflare Dashboard > R2.

## Next
- Add custom domain jashnsaz.ir
- Add VITE_OPENAI_API_KEY for real AI chat
