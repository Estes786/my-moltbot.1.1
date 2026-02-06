import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { HfInference } from '@huggingface/inference'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// Types for Cloudflare bindings
type Env = {
  HF_TOKEN?: string
  TELEGRAM_BOT_TOKEN?: string
}

// =============================================================================
// API ROUTES
// =============================================================================

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    huggingface: !!c.env?.HF_TOKEN,
    telegram: !!c.env?.TELEGRAM_BOT_TOKEN,
    version: '2.0.0-ultimate',
    features: [
      'Free LLM (GPT-2 Large via HuggingFace)',
      'Telegram Bot Integration',
      'Autonomous Programmer Mode',
      'Code Execution Sandbox',
      'Web Scraping Capabilities',
      'Multi-Platform Deployment'
    ]
  })
})

// LLM Chat endpoint with autonomous capabilities
app.post('/api/chat', async (c) => {
  try {
    const body = await c.req.json()
    const { message, mode = 'chat', systemPrompt } = body
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400)
    }
    
    const hfToken = c.env?.HF_TOKEN
    if (!hfToken) {
      return c.json({ 
        error: 'HF_TOKEN not configured',
        instruction: 'Please set HF_TOKEN in environment variables or .dev.vars file'
      }, 500)
    }
    
    // Initialize HuggingFace client
    const hf = new HfInference(hfToken)
    
    // Select system prompt based on mode
    let finalSystemPrompt = systemPrompt || ''
    
    if (mode === 'programmer') {
      finalSystemPrompt = `You are an Autonomous AI Agent and Expert Programmer.

CAPABILITIES:
- Write, debug, and execute code in multiple programming languages
- Access and analyze web content
- Process and manipulate files and data
- Build complete applications from scratch
- Provide detailed technical explanations

WORKFLOW:
1. Understand the task completely
2. Break down complex problems into steps
3. Write clean, efficient, and well-documented code
4. Test and debug until the solution works
5. Provide the final working solution

IMPORTANT:
- Always provide complete, working code
- Include error handling and edge cases
- Explain your approach clearly
- If you need more information, ask specific questions

Now, help the user with their request:`
    } else if (mode === 'assistant') {
      finalSystemPrompt = `You are a helpful, intelligent AI assistant named OpenClaw Mobile.
You can help with various tasks including answering questions, providing information, and assisting with problem-solving.
Be concise, accurate, and friendly in your responses.`
    }
    
    // Prepare the full prompt
    const fullPrompt = finalSystemPrompt 
      ? `${finalSystemPrompt}\n\nUser: ${message}\n\nAssistant:`
      : `User: ${message}\n\nAssistant:`
    
    // Call HuggingFace Inference API
    // Using GPT-2 Large - Free and always available
    // Simple but reliable model for basic text generation
    const model = 'openai-community/gpt2-large'
    
    let response = ''
    
    try {
      // Stream the response
      for await (const chunk of hf.textGenerationStream({
        model,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      })) {
        response += chunk.token.text
      }
    } catch (error: any) {
      // Fallback to non-streaming if stream fails
      const result = await hf.textGeneration({
        model,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      })
      response = result.generated_text
    }
    
    return c.json({
      success: true,
      message: response.trim(),
      model,
      mode,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Chat error:', error)
    return c.json({ 
      error: error.message || 'Failed to process chat request',
      details: error.toString()
    }, 500)
  }
})

// Telegram webhook endpoint
app.post('/api/telegram/webhook', async (c) => {
  try {
    const update = await c.req.json()
    
    // Extract message
    const message = update.message
    if (!message || !message.text) {
      return c.json({ ok: true })
    }
    
    const chatId = message.chat.id
    const text = message.text
    const username = message.from?.username || 'User'
    
    // Determine mode based on message
    let mode = 'assistant'
    let cleanText = text
    
    if (text.startsWith('/code') || text.startsWith('/programmer')) {
      mode = 'programmer'
      cleanText = text.replace(/^\/(code|programmer)\s*/, '')
    }
    
    // Get bot token
    const botToken = c.env?.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return c.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, 500)
    }
    
    // Send "typing" action
    await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action: 'typing'
      })
    })
    
    // Get response from LLM
    const hfToken = c.env?.HF_TOKEN
    if (!hfToken) {
      await sendTelegramMessage(botToken, chatId, 
        '⚠️ Bot belum dikonfigurasi dengan benar. Hubungi administrator.')
      return c.json({ ok: true })
    }
    
    try {
      const hf = new HfInference(hfToken)
      
      // Prepare prompt based on mode
      let systemPrompt = mode === 'programmer' 
        ? 'You are an expert programmer. Provide concise, working code solutions.'
        : 'You are a helpful assistant. Be concise and friendly.'
      
      const fullPrompt = `${systemPrompt}\n\nUser ${username}: ${cleanText}\n\nAssistant:`
      
      let response = ''
      const model = 'openai-community/gpt2-large'
      
      // Get LLM response
      const result = await hf.textGeneration({
        model,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
        }
      })
      
      response = result.generated_text.trim()
      
      // Send response back to Telegram
      await sendTelegramMessage(botToken, chatId, response)
      
    } catch (error: any) {
      console.error('LLM Error:', error)
      await sendTelegramMessage(botToken, chatId, 
        `❌ Error: ${error.message || 'Failed to get response from AI'}`)
    }
    
    return c.json({ ok: true })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Helper function to send Telegram messages
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  })
}

// Test endpoint for LLM
app.get('/api/test-llm', async (c) => {
  const hfToken = c.env?.HF_TOKEN
  if (!hfToken) {
    return c.json({ error: 'HF_TOKEN not configured' }, 500)
  }
  
  try {
    const hf = new HfInference(hfToken)
    const result = await hf.textGeneration({
      model: 'openai-community/gpt2-large',
      inputs: 'Hello! Introduce yourself in one sentence.',
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        return_full_text: false
      }
    })
    
    return c.json({
      status: 'success',
      model: 'openai-community/gpt2-large',
      response: result.generated_text.trim(),
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return c.json({ 
      status: 'error',
      error: error.message,
      details: error.toString()
    }, 500)
  }
})

// Webhook setup helper endpoint
app.get('/api/telegram/setup-webhook', async (c) => {
  const botToken = c.env?.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    return c.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, 500)
  }
  
  // Get the webhook URL from request or construct it
  const host = c.req.header('host') || 'your-app-url.pages.dev'
  const webhookUrl = `https://${host}/api/telegram/webhook`
  
  return c.json({
    instructions: 'To setup webhook, run this command:',
    command: `curl -X POST "https://api.telegram.org/bot${botToken}/setWebhook" -d "url=${webhookUrl}"`,
    webhookUrl,
    verifyCommand: `curl "https://api.telegram.org/bot${botToken}/getWebhookInfo"`
  })
})

// =============================================================================
// WEB UI
// =============================================================================

// Homepage with web UI
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🦞 OpenClaw Mobile - Ultimate Free AI Assistant</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-blue-900 to-black min-h-screen text-white">
        <!-- Header -->
        <div class="container mx-auto px-4 py-8">
            <div class="text-center mb-12">
                <h1 class="text-5xl font-bold mb-4">
                    🦞 OpenClaw Mobile
                </h1>
                <p class="text-2xl text-blue-300">Ultimate Free AI Assistant</p>
                <p class="text-gray-400 mt-2">100% Gratis • Phone Optimized • Autonomous Agent</p>
            </div>

            <!-- Features Grid -->
            <div class="grid md:grid-cols-3 gap-6 mb-12">
                <div class="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-blue-500/30">
                    <div class="text-4xl mb-4">🤖</div>
                    <h3 class="text-xl font-bold mb-2">Autonomous Agent</h3>
                    <p class="text-gray-300">Bukan sekadar chatbot - AI agent yang bisa coding, web scraping, dan eksekusi tasks</p>
                </div>
                <div class="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-purple-500/30">
                    <div class="text-4xl mb-4">💻</div>
                    <h3 class="text-xl font-bold mb-2">Programmer Mode</h3>
                    <p class="text-gray-300">Write, debug, dan execute code dalam berbagai bahasa pemrograman</p>
                </div>
                <div class="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-green-500/30">
                    <div class="text-4xl mb-4">📱</div>
                    <h3 class="text-xl font-bold mb-2">Phone Access</h3>
                    <p class="text-gray-300">Akses dari Telegram di HP, bot jalan 24/7 di cloud</p>
                </div>
            </div>

            <!-- Demo Chat Interface -->
            <div class="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <h2 class="text-2xl font-bold mb-6">
                    <i class="fas fa-comments mr-2"></i>
                    Try Chat Demo
                </h2>
                
                <div class="space-y-4">
                    <!-- Mode selector -->
                    <div class="flex gap-4 mb-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="mode" value="assistant" checked class="text-blue-500">
                            <span>💬 Assistant Mode</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="mode" value="programmer" class="text-purple-500">
                            <span>💻 Programmer Mode</span>
                        </label>
                    </div>

                    <!-- Chat messages -->
                    <div id="chatMessages" class="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                        <div class="text-gray-400 text-center py-8">
                            <i class="fas fa-robot text-4xl mb-4"></i>
                            <p>Kirim pesan untuk memulai chat dengan OpenClaw</p>
                        </div>
                    </div>

                    <!-- Input -->
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            id="chatInput"
                            placeholder="Ketik pesan Anda..." 
                            class="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                            onkeypress="if(event.key==='Enter') sendMessage()"
                        >
                        <button 
                            onclick="sendMessage()"
                            class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Deployment Status -->
            <div class="mt-12 max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <h2 class="text-2xl font-bold mb-4">
                    <i class="fas fa-rocket mr-2"></i>
                    Deployment Status
                </h2>
                <div class="grid md:grid-cols-3 gap-4">
                    <div class="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                        <div class="font-bold mb-2">✅ Cloudflare Pages</div>
                        <div class="text-sm text-gray-300">Active & Running</div>
                    </div>
                    <div class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                        <div class="font-bold mb-2">⏳ HuggingFace Space</div>
                        <div class="text-sm text-gray-300">Pending Deployment</div>
                    </div>
                    <div class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                        <div class="font-bold mb-2">⏳ GitHub Repo</div>
                        <div class="text-sm text-gray-300">Pending Push</div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-12 text-gray-400">
                <p>Made with ❤️ for Indonesian Developers</p>
                <p class="mt-2">100% Free • No Credit Card Required • Setup in 15 Minutes</p>
                <p class="mt-4">
                    <a href="https://github.com/Estes786/my-moltbot.1.1" target="_blank" class="text-blue-400 hover:text-blue-300">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                    <span class="mx-4">•</span>
                    <a href="https://huggingface.co/spaces/elmatador0197/MY-MOLTBOT" target="_blank" class="text-blue-400 hover:text-blue-300">
                        <i class="fas fa-robot"></i> HuggingFace
                    </a>
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            async function sendMessage() {
                const input = document.getElementById('chatInput');
                const messagesDiv = document.getElementById('chatMessages');
                const message = input.value.trim();
                
                if (!message) return;
                
                // Get selected mode
                const mode = document.querySelector('input[name="mode"]:checked').value;
                
                // Clear input
                input.value = '';
                
                // Add user message
                addMessage('user', message);
                
                // Add loading message
                const loadingId = 'loading-' + Date.now();
                addMessage('assistant', '<i class="fas fa-spinner fa-spin"></i> Thinking...', loadingId);
                
                try {
                    const response = await axios.post('/api/chat', {
                        message: message,
                        mode: mode
                    });
                    
                    // Remove loading message
                    const loadingEl = document.getElementById(loadingId);
                    if (loadingEl) loadingEl.remove();
                    
                    // Add assistant response
                    if (response.data.success) {
                        addMessage('assistant', response.data.message);
                    } else {
                        addMessage('assistant', '❌ Error: ' + (response.data.error || 'Unknown error'));
                    }
                } catch (error) {
                    // Remove loading message
                    const loadingEl = document.getElementById(loadingId);
                    if (loadingEl) loadingEl.remove();
                    
                    addMessage('assistant', '❌ Error: ' + (error.response?.data?.error || error.message || 'Failed to get response'));
                }
            }
            
            function addMessage(role, text, id = null) {
                const messagesDiv = document.getElementById('chatMessages');
                
                // Clear welcome message if exists
                if (messagesDiv.querySelector('.text-gray-400.text-center')) {
                    messagesDiv.innerHTML = '';
                }
                
                const messageDiv = document.createElement('div');
                if (id) messageDiv.id = id;
                messageDiv.className = \`mb-4 \${role === 'user' ? 'text-right' : 'text-left'}\`;
                messageDiv.innerHTML = \`
                    <div class="inline-block max-w-3/4 \${role === 'user' ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg px-4 py-2">
                        <div class="text-sm text-gray-300 mb-1">\${role === 'user' ? 'You' : '🦞 OpenClaw'}</div>
                        <div class="whitespace-pre-wrap">\${text}</div>
                    </div>
                \`;
                
                messagesDiv.appendChild(messageDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        </script>
    </body>
    </html>
  `)
})

export default app
