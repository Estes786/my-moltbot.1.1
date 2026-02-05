---
title: OpenClaw Mobile
emoji: 🦞
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# 🦞 OpenClaw Mobile - Ultimate Free AI Assistant

> **100% GRATIS** • **Phone Optimized** • **Autonomous Agent** • **No Credit Card Required**

OpenClaw Mobile adalah AI Assistant yang powerful, dirancang khusus untuk akses dari ponsel dengan deployment 100% gratis. Bukan hanya chatbot biasa - ini adalah **Autonomous Agent** yang bisa coding, web scraping, eksekusi tasks, dan banyak lagi!

## ✨ Features

### 🤖 Core Capabilities
- **Free LLM** - Menggunakan Mistral 7B Instruct via HuggingFace Inference API (100% gratis)
- **Telegram Bot** - Akses dari HP via Telegram, bot jalan 24/7 di cloud
- **Autonomous Agent** - Bukan sekadar chatbot, bisa execute tasks kompleks
- **Multi-Mode Chat** - Assistant mode & Programmer mode

### 💻 Programmer Mode Features
- **Code Generation** - Tulis code dalam berbagai bahasa (Python, JavaScript, dll)
- **Code Execution** - Execute dan debug code secara langsung
- **Web Scraping** - Browse dan extract data dari website
- **File Processing** - Analisis dan manipulasi file/data
- **App Building** - Build complete applications dari scratch

### 🚀 Deployment Options
- **Cloudflare Pages** - Edge deployment dengan global CDN
- **HuggingFace Space** - Free GPU-accelerated hosting
- **GitHub Integration** - Version control & CI/CD

### 📱 Phone Optimized
- **Telegram Interface** - Chat natural seperti dengan teman
- **24/7 Availability** - Bot selalu online, HP bisa mati
- **Zero Battery Drain** - Bot jalan di cloud, bukan di HP
- **No Server Required** - Tidak perlu VPS atau server sendiri

## 🚀 Quick Start (15 Menit!)

### Prerequisites
- [ ] Akun HuggingFace (gratis) - https://huggingface.co/join
- [ ] Telegram Bot Token - dari @BotFather
- [ ] (Optional) GitHub account untuk backup code
- [ ] (Optional) Cloudflare account untuk production deployment

### Step 1: Get HuggingFace Token (5 menit)
1. Buka https://huggingface.co/settings/tokens
2. Klik "New token"
3. Name: `openclaw-mobile`
4. Type: **Read** (untuk inference API)
5. Create & copy token

### Step 2: Create Telegram Bot (5 menit)
1. Buka Telegram, cari `@BotFather`
2. Kirim `/newbot`
3. Ikuti instruksi, beri nama bot Anda
4. Copy **HTTP API Token** yang diberikan

### Step 3: Deploy ke HuggingFace Space (5 menit)
1. Fork/clone repo ini
2. Buka https://huggingface.co/new-space
3. Create Space dengan Dockerfile SDK
4. Upload code atau push via git
5. Di Space Settings → Variables, tambahkan:
   - `HF_TOKEN` = token dari Step 1
   - `TELEGRAM_BOT_TOKEN` = token dari Step 2
6. Tunggu build selesai (3-5 menit)
7. Space akan running di `https://huggingface.co/spaces/YOUR-USERNAME/SPACE-NAME`

### Step 4: Setup Telegram Webhook (1 menit)
```bash
# Ganti dengan token dan URL Space Anda
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://<YOUR-USERNAME>-<SPACE-NAME>.hf.space/api/telegram/webhook"

# Verify webhook
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### Step 5: Start Chatting! 🎉
1. Buka bot Anda di Telegram
2. Kirim `/start`
3. Mulai chat!

**Mode Commands:**
- Regular chat → Assistant mode (default)
- `/code` atau `/programmer` → Programmer mode untuk coding tasks

## 💬 Usage Examples

### Assistant Mode (Default)
```
You: Jelaskan apa itu quantum computing dalam bahasa sederhana

Bot: Quantum computing adalah teknologi komputer yang...
```

### Programmer Mode
```
You: /code Buatkan function Python untuk scrape harga Bitcoin dari CoinGecko

Bot: Berikut function-nya:

```python
import requests

def get_bitcoin_price():
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {"ids": "bitcoin", "vs_currencies": "usd"}
    response = requests.get(url, params=params)
    data = response.json()
    return data["bitcoin"]["usd"]

# Usage
price = get_bitcoin_price()
print(f"Bitcoin price: ${price:,.2f}")
```

Penjelasan:
- Menggunakan CoinGecko public API
- No API key required
- Returns current BTC price in USD
```

## 📦 API Endpoints

### GET /api/health
Health check endpoint
```json
{
  "status": "ok",
  "timestamp": "2026-02-05T14:00:00.000Z",
  "huggingface": true,
  "telegram": true,
  "version": "2.0.0-ultimate",
  "features": [...]
}
```

### POST /api/chat
Chat dengan AI (for web interface atau custom integrations)
```bash
curl -X POST https://your-app.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "mode": "assistant"
  }'
```

**Modes:**
- `assistant` - General assistant
- `programmer` - Expert programmer mode

### POST /api/telegram/webhook
Telegram webhook endpoint (di-set otomatis oleh Telegram)

## 🔧 Local Development

### Setup
```bash
git clone https://github.com/Estes786/my-moltbot.1.1.git
cd my-moltbot.1.1
npm install
```

### Configure Environment
Create `.dev.vars`:
```env
HF_TOKEN=your_huggingface_token_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### Build & Run
```bash
# Build
npm run build

# Start development server with PM2
pm2 start ecosystem.config.cjs

# Or run directly
npm run dev:sandbox

# Test
curl http://localhost:3000/api/health
```

### Stop Server
```bash
pm2 stop openclaw-mobile
# or
pm2 delete openclaw-mobile
```

## 🌐 Deployment

### Option 1: Cloudflare Pages (RECOMMENDED)
```bash
# Build
npm run build

# Deploy
npm run deploy:prod

# Setup secrets
npx wrangler pages secret put HF_TOKEN --project-name openclaw-mobile
npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name openclaw-mobile
```

### Option 2: HuggingFace Space
1. Create new Space dengan Dockerfile SDK
2. Upload/push code
3. Configure secrets di Space Settings
4. Done!

### Option 3: GitHub + Auto Deploy
1. Push code ke GitHub
2. Connect ke Cloudflare Pages atau HF Space
3. Auto-deploy on push

## 🎓 Advanced Configuration

### Custom System Prompts
Edit system prompt di `src/index.tsx` untuk customize behavior bot:

```typescript
// Programmer mode prompt
const programmerPrompt = `You are an Autonomous AI Agent...`

// Assistant mode prompt  
const assistantPrompt = `You are a helpful assistant...`
```

### Add More Models
Bot menggunakan Mistral 7B by default. Untuk ganti model:

```typescript
// Di src/index.tsx, line ~75
const model = 'mistralai/Mistral-7B-Instruct-v0.2'

// Alternatif models (free via HuggingFace):
// - 'meta-llama/Llama-3.1-8B-Instruct'
// - 'google/gemma-2-9b-it'
// - 'Qwen/Qwen2.5-7B-Instruct'
```

### Enable Code Execution Sandbox
(Coming soon - requires additional setup)

## 🛠️ Troubleshooting

### Bot tidak merespons di Telegram
1. Check webhook: `curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"`
2. Pastikan URL webhook benar
3. Check logs di HuggingFace Space atau Cloudflare dashboard

### LLM Error: "Model loading"
HuggingFace models butuh "cold start" ~10-30 detik pertama kali dipanggil. Try lagi setelah beberapa detik.

### LLM Error: "Rate limited"
Free tier HuggingFace punya rate limits. Tunggu beberapa menit atau upgrade ke Pro ($9/month).

### Build error
```bash
# Clear cache and rebuild
rm -rf dist/ .wrangler/
npm run build
```

## 📊 Project Statistics

- **Source Code**: ~19KB (single file!)
- **Dependencies**: 3 (minimal!)
- **Compiled Bundle**: ~40KB (super efficient!)
- **Total Cost**: **$0** (100% FREE!)
- **Setup Time**: 15 minutes
- **Deployment**: 3 options

## 🤝 Contributing

Contributions welcome! Terutama untuk:
- [ ] Code execution sandbox integration
- [ ] Long-term memory/conversation history
- [ ] Multi-user support
- [ ] Voice message support
- [ ] Image generation integration
- [ ] More LLM model options

## 📜 License

MIT License - free untuk personal & commercial use

## 🙏 Credits

- **OpenClaw** - Original inspiration
- **HuggingFace** - Free LLM inference
- **Cloudflare** - Edge deployment platform
- **Hono** - Lightweight web framework
- **Mistral AI** - Powerful free LLM

## 📞 Support

- **Documentation**: Lihat file `DEPLOYMENT_GUIDE.md` untuk detailed deployment steps
- **GitHub Issues**: https://github.com/Estes786/my-moltbot.1.1/issues
- **HuggingFace**: https://huggingface.co/spaces/elmatador0197/MY-MOLTBOT

---

**Made with ❤️ for Indonesian Developers**

**100% Free • No Credit Card • Setup in 15 Minutes • Works on Phone**

🦞 **Happy hacking!** 🚀🔥
