# 🚀 DEPLOYMENT GUIDE - OpenClaw Mobile v2.0.0 ULTIMATE

## 📦 Quick Access Links

### Project Files
- **GitHub Repo**: https://github.com/Estes786/my-moltbot.1.1.git
- **HuggingFace Space**: https://huggingface.co/spaces/elmatador0197/MY-MOLTBOT
- **Sandbox URL**: https://3000-ie4od1ptp5zip6diqwe85-8f57ffe2.sandbox.novita.ai
- **Project Path**: `/home/user/webapp`

### Credentials Required
- **HF Write Token**: `<your-hf-write-token>`
- **HF Fine-grained Token**: `<your-hf-inference-token>`  
- **GitHub PAT**: `<your-github-personal-access-token>`
- **Telegram Bot Token**: `<your-telegram-bot-token>`
- **Cloudflare API Token**: `<your-cloudflare-api-token>`

---

## ⚠️ IMPORTANT: Token Permissions

Current HF token has **READ permission only**.

### For Production Deployment, You Need:
1. **Create NEW HuggingFace Token** with **INFERENCE permission**:
   - Go to: https://huggingface.co/settings/tokens
   - Click "New token"
   - Name: `openclaw-mobile-inference`
   - Permissions: Check **"Make calls to serverless Inference API"**
   - Create and copy the token

2. **Use NEW token** in all deployments below

---

## 🎯 3 DEPLOYMENT OPTIONS

## Option 1: GitHub (DO THIS FIRST) ⭐

### Prerequisites
- Complete GitHub authorization via #github tab
- GitHub App + OAuth configured

### Steps
```bash
# Navigate to project
cd /home/user/webapp

# Add GitHub remote (use PAT for authentication)
git remote add origin https://<YOUR-GITHUB-PAT>@github.com/Estes786/my-moltbot.1.1.git

# Push to GitHub (force push for new repo)
git branch -M main
git push -u origin main --force
```

**If GitHub auth not setup yet:**
1. Go to #github tab in interface
2. Complete GitHub App authorization
3. Complete OAuth authorization  
4. Return here and run push command

---

## Option 2: HuggingFace Space 🤗

### Method A: Via Git (Recommended)
```bash
cd /home/user/webapp

# Add HuggingFace Space as remote
git remote add hf https://<YOUR-HF-WRITE-TOKEN>@huggingface.co/spaces/elmatador0197/MY-MOLTBOT

# Push to HF Space
GIT_LFS_SKIP_SMUDGE=1 git push hf main --force
```

### Method B: Via HF CLI
```bash
# Install HuggingFace CLI
pip install huggingface_hub[cli]

# Login with write token
huggingface-cli login --token <YOUR-HF-WRITE-TOKEN>

# Upload to Space
cd /home/user/webapp
huggingface-cli upload elmatador0197/MY-MOLTBOT . --repo-type space
```

### Configure Space Secrets
After deployment, go to Space Settings → Variables and add:

```env
HF_TOKEN=<your-new-token-with-inference-permission>
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
```

### Space Configuration (README.md header)
Create/update README.md in Space with:
```yaml
---
title: OpenClaw Mobile
emoji: 🦞
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
license: mit
---
```

---

## Option 3: Cloudflare Pages ☁️

### Prerequisites
- Cloudflare account
- API token: `<your-cloudflare-api-token>`

### Step 1: Setup Cloudflare Authentication
```bash
# Set API token as environment variable
export CLOUDFLARE_API_TOKEN=<your-cloudflare-api-token>

# Verify authentication
npx wrangler whoami
```

### Step 2: Create Cloudflare Pages Project
```bash
cd /home/user/webapp

# Create project
npx wrangler pages project create openclaw-mobile \
  --production-branch main \
  --compatibility-date 2024-01-01
```

### Step 3: Deploy
```bash
# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name openclaw-mobile
```

You'll get URLs like:
- Production: `https://openclaw-mobile.pages.dev`
- Branch: `https://main.openclaw-mobile.pages.dev`

### Step 4: Set Environment Variables (Secrets)
```bash
# Add HF Token (use NEW token with inference permission!)
npx wrangler pages secret put HF_TOKEN --project-name openclaw-mobile

# Add Telegram Bot Token
npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name openclaw-mobile
```

---

## 📱 SETUP TELEGRAM WEBHOOK

After deployment to HuggingFace or Cloudflare, setup Telegram webhook:

### For HuggingFace Space:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR-BOT-TOKEN>/setWebhook" \
  -d "url=https://elmatador0197-MY-MOLTBOT.hf.space/api/telegram/webhook"
```

### For Cloudflare Pages:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR-BOT-TOKEN>/setWebhook" \
  -d "url=https://openclaw-mobile.pages.dev/api/telegram/webhook"
```

### Verify Webhook:
```bash
curl "https://api.telegram.org/bot<YOUR-BOT-TOKEN>/getWebhookInfo"
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-deployment-url/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## 🧪 TESTING

### Test Deployments

**Test Health:**
```bash
# HuggingFace
curl https://elmatador0197-MY-MOLTBOT.hf.space/api/health

# Cloudflare
curl https://openclaw-mobile.pages.dev/api/health
```

**Test Telegram Bot:**
1. Open Telegram
2. Search for your bot: `@YourBotUsername`
3. Send `/start`
4. Send a message: `Hello! Who are you?`
5. Try programmer mode: `/code Write a Python function to calculate fibonacci`

---

## ⚡ QUICK DEPLOYMENT SEQUENCE (15 MENIT!)

```bash
# 1. Navigate to project
cd /home/user/webapp

# 2. Build (if not already built)
npm run build

# 3. Push to GitHub
git remote add origin https://<YOUR-GITHUB-PAT>@github.com/Estes786/my-moltbot.1.1.git
git push -u origin main --force

# 4. Push to HuggingFace
git remote add hf https://<YOUR-HF-WRITE-TOKEN>@huggingface.co/spaces/elmatador0197/MY-MOLTBOT
GIT_LFS_SKIP_SMUDGE=1 git push hf main --force

# 5. Deploy to Cloudflare
export CLOUDFLARE_API_TOKEN=<your-cloudflare-api-token>
npx wrangler pages project create openclaw-mobile --production-branch main
npx wrangler pages deploy dist --project-name openclaw-mobile

# 6. Set secrets (for Cloudflare)
npx wrangler pages secret put HF_TOKEN --project-name openclaw-mobile
# Enter your NEW token with inference permission
npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name openclaw-mobile
# Enter: 8222227808:AAEz8hJKthzHzwOWnn8gXPZC1VKy-P2wj7c

# 7. Setup Telegram webhook (after HF/CF deployment running)
curl -X POST "https://api.telegram.org/bot<YOUR-BOT-TOKEN>/setWebhook" \
  -d "url=https://openclaw-mobile.pages.dev/api/telegram/webhook"
```

---

## 🔧 TROUBLESHOOTING

### Problem: GitHub push fails
**Solution:**
1. Ensure GitHub auth is completed via #github tab
2. Try with PAT in URL: `https://PAT@github.com/user/repo.git`
3. Check PAT permissions

### Problem: HuggingFace push fails
**Solution:**
1. Verify token has WRITE permission
2. Use `GIT_LFS_SKIP_SMUDGE=1` prefix
3. Try force push: `--force`

### Problem: LLM not responding
**Solution:**
1. Create NEW HF token with INFERENCE permission
2. Update token in Space Settings or via `wrangler secret put`
3. Wait 10-30 seconds for model cold start
4. Check Space/Pages logs

### Problem: Telegram bot not responding
**Solution:**
1. Verify webhook is set: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Check webhook URL is correct
3. Ensure deployment is running (not sleeping)
4. Check deployment logs

### Problem: Cloudflare deployment fails
**Solution:**
1. Verify API token: `npx wrangler whoami`
2. Check project name doesn't conflict
3. Ensure build completed: `npm run build`
4. Check `wrangler.jsonc` syntax

---

## 📊 DEPLOYMENT STATUS CHECKLIST

- [ ] ✅ **Local Build** - `npm run build` successful
- [ ] ✅ **Git Commit** - All changes committed
- [ ] ⏳ **GitHub Push** - Code uploaded to GitHub
- [ ] ⏳ **HuggingFace Deploy** - Space running
- [ ] ⏳ **Cloudflare Deploy** - Pages published
- [ ] ⏳ **Telegram Webhook** - Bot connected
- [ ] ⏳ **HF Token Update** - New token with inference permission
- [ ] ⏳ **Testing** - All endpoints working

---

## 📞 SUPPORT RESOURCES

- **Documentation**: `/home/user/webapp/README.md`
- **GitHub**: https://github.com/Estes786/my-moltbot.1.1
- **HuggingFace**: https://huggingface.co/spaces/elmatador0197/MY-MOLTBOT
- **Sandbox**: https://3000-ie4od1ptp5zip6diqwe85-8f57ffe2.sandbox.novita.ai

---

## 🎉 AFTER DEPLOYMENT

Once all deployments are complete:

1. **Test Telegram Bot**:
   - Open Telegram
   - Chat dengan bot Anda
   - Try: `Hello!`, `/code print hello world`, etc.

2. **Share Your Bot**:
   - Get bot username from @BotFather
   - Share dengan teman: `https://t.me/YourBotUsername`

3. **Monitor Usage**:
   - HF Space: Check logs di Space settings
   - Cloudflare: Dashboard → Pages → Logs
   - Telegram: @BotFather → Bot Settings → Statistics

4. **Customize**:
   - Edit system prompts di `src/index.tsx`
   - Add more features
   - Deploy updates dengan `git push`

---

**Made with ❤️ for Indonesian Developers**

**Status**: ✅ Core Complete • ⏳ Deployment Pending

**Good luck with deployment! 🚀**
