import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from '../../lib/prisma';
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

let _genAI: GoogleGenerativeAI | null = null;
const getGenAI = () => {
  if (!_genAI) {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) console.error("[PlanoraBot] CRITICAL: GEMINI_API_KEY is missing!");
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
};

export type TChatMessage = {
  role: 'user' | 'model';
  parts: string;
};

// ── Fetch real-time data from the Planora database ─────────────────────────────────────
const fetchSiteContext = async (): Promise<string> => {
  try {
    // Avoid $transaction for simple counts to prevent P2028 (Transaction API error)
    const [events, categories, totalUsers, totalEvents, totalParticipants] = await Promise.all([
      // Recent and Upcoming events
      prisma.event.findMany({
        where: { date: { gte: new Date() } },
        select: {
          id: true,
          title: true,
          date: true,
          venue: true,
          fee: true,
          eventType: true,
          category: { select: { name: true } },
          organizer: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
        take: 30, // Reduced take to save tokens and time
      }),

      // All categories
      prisma.eventCategory.findMany({
        select: {
          name: true,
          _count: { select: { events: true } },
        },
        orderBy: { name: 'asc' },
      }),

      // Individual counts instead of $transaction
      prisma.user.count(),
      prisma.event.count(),
      prisma.eventParticipant.count(),
    ]);

    // Format events compactly
    const eventsContext = events
      .map(
        (e: any) =>
          `• ${e.title} — ${e.fee > 0 ? `$${e.fee}` : 'FREE'} | ${e.eventType.replace('_', ' ')} | Category: ${e.category?.name || 'General'} | Date: ${new Date(e.date).toLocaleDateString()} | Venue: ${e.venue || 'TBA'} | Organizer: ${e.organizer.name}`
      )
      .join('\n');

    // Format categories
    const categoriesContext = categories
      .map((c: any) => `• ${c.name} (${c._count.events} events)`)
      .join('\n');

    return `
=== PLANORA LIVE DATA ===
PLATFORM STATS: Members: ${totalUsers} | Events: ${totalEvents} | Participants: ${totalParticipants}

EVENT CATEGORIES:
${categoriesContext}

UPCOMING EVENTS:
${eventsContext}
=== END OF LIVE DATA ===
`;
  } catch (error) {
    console.error('[PlanoraBot] Failed to fetch site context:', error);
    return '(Live data temporarily unavailable — answer based on general platform knowledge)';
  }
};

// ── Build the system prompt with live data ─────────────────────────────────────
const buildSystemPrompt = async (): Promise<string> => {
  const liveData = await fetchSiteContext();

  return `You are PlanoraBot, a professional AI concierge for Planora.
Use the REAL platform data below to answer accurately. 
Suggest real events from the data when asked.
Tone: Professional and helpful.

${liveData}`;
};

// Use EXACT models from working FoodHub implementation
const MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest'
];

// ── Main chat function ─────────────────────────────────────────────────────────
export const getChatResponse = async (
  userMessage: string,
  history: TChatMessage[]
): Promise<string> => {
  const systemPrompt = await buildSystemPrompt();

  const contents = [
    {
      role: 'user' as const,
      parts: [{ text: systemPrompt }],
    },
    {
      role: 'model' as const,
      parts: [{ text: "I have synchronized with Planora live data. How can I assist you with events today?" }],
    },
    ...history.map((msg) => ({
      role: msg.role === 'model' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.parts }],
    })),
    {
      role: 'user' as const,
      parts: [{ text: userMessage }],
    },
  ];

  let lastError: any;

  for (const modelName of MODEL_FALLBACKS) {
    try {
      console.log(`[PlanoraBot] Attempting model: ${modelName}`);
      const model = getGenAI().getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.6,
        },
      });
      return result.response.text();
    } catch (err: any) {
      console.error(`[PlanoraBot] Model ${modelName} failed:`, err?.message || err);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("PlanoraBot is currently offline. Please try again later.");
};

export const getEventRecommendations = async (userPreferences: string) => {
    try {
        const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Based on the following user preferences: "${userPreferences}", recommend 3 types of event categories and a brief theme for each. Format as JSON.`;
        
        const result = await model.generateContent(prompt);
        return { recommendations: result.response.text() };
    } catch (error) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "AI recommendation engine failed");
    }
};

export const AiService = {
    getEventRecommendations,
    getChatResponse
};
