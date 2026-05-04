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
      // Recent and Upcoming events with enriched data
      prisma.event.findMany({
        where: { date: { gte: new Date() } },
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          venue: true,
          fee: true,
          eventType: true,
          isFeatured: true,
          category: { select: { name: true } },
          organizer: { select: { name: true } },
          _count: { select: { participants: true, reviews: true } },
          reviews: { select: { rating: true }, take: 10 },
        },
        orderBy: [{ isFeatured: 'desc' }, { date: 'asc' }],
        take: 20, // Focus on the most relevant 20 events to keep prompt concise
      }),

      // All categories
      prisma.eventCategory.findMany({
        select: {
          name: true,
          _count: { select: { events: true } },
        },
        orderBy: { name: 'asc' },
      }),

      // Stats
      prisma.user.count(),
      prisma.event.count(),
      prisma.eventParticipant.count(),
    ]);

    // Format events with richness
    const eventsContext = events
      .map((e: any) => {
        const avgRating = e.reviews.length > 0 
          ? (e.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / e.reviews.length).toFixed(1)
          : 'No reviews yet';
        
        const featuredTag = e.isFeatured ? '[FEATURED] ' : '';
        const desc = e.description || "No description provided.";
        const shortDesc = desc.length > 100 ? desc.substring(0, 97) + '...' : desc;

        return `${featuredTag}• ${e.title}
  - Price: ${e.fee > 0 ? `$${e.fee}` : 'FREE'} | Type: ${e.eventType.replace('_', ' ')}
  - Category: ${e.category?.name || 'General'} | Date: ${new Date(e.date).toLocaleDateString()}
  - Venue: ${e.venue || 'TBA'} | Organizer: ${e.organizer.name}
  - Popularity: ${e._count.participants} participants | Rating: ${avgRating}
  - About: ${shortDesc}`;
      })
      .join('\n\n');

    // Format categories
    const categoriesContext = categories
      .map((c: any) => `• ${c.name} (${c._count.events} events)`)
      .join('\n');

    return `
=== PLANORA LIVE INTELLIGENCE ===
PLATFORM STATS:
- Members: ${totalUsers}
- Total Events Hosted: ${totalEvents}
- Community Participation: ${totalParticipants}

EVENT CATEGORIES:
${categoriesContext}

TOP UPCOMING & FEATURED EXPERIENCES:
${eventsContext}

PLATFORM MISSION:
Planora is a premium event ecosystem connecting elite organizers with passionate attendees. 
We prioritize quality, security, and seamless experiences.
=== END OF INTELLIGENCE ===
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
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest'
];

const generateWithFallback = async (prompt: string, contents?: any[]) => {
  let lastError: any;
  for (const modelName of MODEL_FALLBACKS) {
    try {
      const model = getGenAI().getGenerativeModel({ model: modelName });
      if (contents) {
        const result = await model.generateContent({
          contents,
          generationConfig: { maxOutputTokens: 2000, temperature: 0.6 },
        });
        return result.response.text();
      } else {
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    } catch (err: any) {
      console.error(`[AiService] Model ${modelName} failed:`, err?.message || err);
      lastError = err;
      continue;
    }
  }
  throw lastError || new Error("AI service is currently offline.");
};

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

  return await generateWithFallback("", contents);
};

export const getEventRecommendations = async (userPreferences: string) => {
    try {
        const prompt = `Based on the following user preferences: "${userPreferences}", recommend 3 types of event categories and a brief theme for each. Format as JSON.`;
        const text = await generateWithFallback(prompt);
        return { recommendations: text };
    } catch (error) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "AI recommendation engine failed");
    }
};

export const architectEvent = async (bullets: string) => {
    try {
        const prompt = `Convert the following bullet points into a professional, premium, and engaging event description for Planora (an elite event platform). 
        Keep the tone sophisticated and luxury-focused. Use a mix of storytelling and functional details.
        
        CRITICAL: Do NOT use bullet points in the output. Use cohesive, well-structured paragraphs only.
        
        BULLETS:
        ${bullets}
        
        DESCRIPTION:`;
        
        const text = await generateWithFallback(prompt);
        return { description: text };
    } catch (error) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "AI Architect failed to generate description");
    }
};

export const suggestTags = async (description: string) => {
    try {
        const prompt = `Based on the following event description, suggest 5-8 SEO-friendly hashtags or tags. 
        Format them as a comma-separated list of tags without the # symbol. Only output the tags.
        
        DESCRIPTION:
        ${description}
        
        TAGS:`;
        
        const text = await generateWithFallback(prompt);
        return { tags: text.trim() };
    } catch (error) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "AI Tagging engine failed");
    }
};

export const AiService = {
    getEventRecommendations,
    getChatResponse,
    architectEvent,
    suggestTags
};
