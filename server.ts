import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'StudentFlow - Dilshan Jagoda',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// AI Assistant endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(400).json({
      error: 'MISSING_API_KEY',
      message: 'Gemini API key is not configured in the environment. Please configure GEMINI_API_KEY in the environment secrets to enable AI Financial Assistant.',
    });
  }

  const { message, financialContext, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'INVALID_REQUEST', message: 'Message is required.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are the AI Financial Advisor in "StudentFlow - Dilshan Jagoda", an application specifically built for university students living independently in Germany.
Target User Profile: A university student living in Germany on a tight budget.
Context considerations:
- German student specifics: WG (shared flat) / dormitory rent, Deutschlandticket (€49/mo or semester upgrade), Rundfunkbeitrag (GEZ fee ~€18.36/month), Semesterbeitrag (~€250-€400 every 6 months), student health insurance (Krankenversicherung ~€120-€130 if >25 or voluntary), grocery shopping at discount stores (Aldi, Lidl, Penny, Netto) vs supermarkets (Rewe, Edeka), Mensa cafeteria meals (€2.50-€4.50).
- Financial metrics provided to you:
  * Current Available Balance
  * Total Income This Month
  * Total Expenses This Month
  * Monthly Budget Limit & Remaining Budget
  * Safe-to-Spend Amount & Daily Safe-to-Spend allowance
  * Upcoming Bills & Reserved Essential Funds
  * Savings Goals & Emergency Fund Status
  * Grocery Budget & Spending
  * Recent Transactions and Breakdown

Behavioral Guidelines:
1. Always analyze and cite the user's actual numbers provided in the financial context. Do NOT invent fake numbers.
2. If the user asks whether they can afford a purchase (e.g., "Can I afford €50?"), calculate the impact on their Safe-to-Spend allowance and upcoming essential bills.
3. Keep advice realistic and student-friendly: recommend Mensa, student discounts, cooking in bulk, cancel unused subscriptions, but do not suggest unrealistic deprivations.
4. Clearly label projections and estimates as estimates, never guarantees.
5. Provide structured, concise responses with key takeaways, bullet points, and exact euro calculations where appropriate.
6. Support both English and German depending on the user's prompt language.`;

    const contents: any[] = [];

    // Include context summary in the prompt
    let contextPrompt = `CURRENT STUDENT FINANCIAL CONTEXT:\n${JSON.stringify(financialContext || {}, null, 2)}\n\n`;

    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: `${contextPrompt}User Question: ${message}` }],
    });

    let responseText = '';
    let lastError = null;

    // Attempt generation with retry
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }
    }

    if (!responseText) {
      // Deterministic student finance rule-based assessment fallback if upstream model experiences temporary 503 spike
      const liquid = financialContext?.liquidBalance || '0,00 €';
      const safe = financialContext?.safeToSpendAllowance || '0,00 €';
      const daily = financialContext?.dailySafeToSpend || '0,00 €';
      const upcomingBills = financialContext?.upcomingEssentialBillsTotal || '0,00 €';

      const fallbackAdvice = `**Financial Assessment (Live Student Context Analysis):**\n\n` +
        `• **Current Available Liquid Balance:** ${liquid}\n` +
        `• **Safe-to-Spend Allowance:** ${safe} (${daily} / day)\n` +
        `• **Reserved for Upcoming Essential Bills (Rent, Internet, GEZ):** ${upcomingBills}\n\n` +
        `**Recommendation for your inquiry:**\n` +
        `Based on your current recorded data, your daily safe-to-spend allowance is **${daily}**. ` +
        `Before committing to non-essential spending, ensure your reserved funds cover the **${upcomingBills}** in upcoming fixed obligations. ` +
        `If making discretionary purchases, keep individual items below your safe daily allowance to avoid dipping into rent or deposit reserves.\n\n` +
        `*(Note: Live model service experienced a temporary upstream spike; this automated analysis was calculated directly from your stored student financial figures.)*`;

      return res.json({ answer: fallbackAdvice });
    }

    return res.json({ answer: responseText });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return res.status(500).json({
      error: 'AI_GENERATION_FAILED',
      message: error?.message || 'Failed to generate response from Gemini API.',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudentFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
