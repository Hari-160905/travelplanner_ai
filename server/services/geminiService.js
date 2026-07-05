import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const callGemini = async (prompt, maxTokens = 1500) => {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  // Updated to use the faster and smarter gemini-2.5-flash model
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const res = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // Safely extract the generated text from Google's response structure
    const output = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!output) {
      throw new Error('Unexpected empty response structure from Gemini API');
    }

    return String(output);
  } catch (err) {
    const msg = err.response?.data || err.message || 'Unknown Gemini error';
    throw new Error(`Gemini request failed: ${JSON.stringify(msg)}`);
  }
};

const templates = {
  tripPlanner: ({ destination, budget, days, interests }) => `You are an expert travel planner with deep knowledge of global destinations.

Task: Create a professional, day-by-day itinerary for a ${days}-day trip to ${destination}.
Constraints:
- Total budget: ${budget}
- Traveler interests: ${interests}

Deliverables (structured):
1) Summary: brief trip overview and high-level budget estimate.
2) Day-wise itinerary: for each day include morning/afternoon/evening activities, approximate cost per activity, and transit suggestions.
3) Accommodation: 3 recommended hotels with price range and neighborhood notes.
4) Food: recommended dishes, restaurants, typical meal costs.
5) Local transport: how to get around (card/ticket options and approximate fares).
6) Safety tips and cultural notes.
7) Quick packing suggestions specific to this trip.

Return result as clear readable text with headings and bullet lists.`,

  packingList: ({ destination, season }) => `You are an expert travel packing assistant.

Task: Create a comprehensive packing checklist for travel to ${destination} during ${season}.
Include categories: documents, clothing, electronics, toiletries, health, region-specific items, and optional items.
Mark items as MUST/HIGH/LOW priority and add short rationale for each category.`,

  budgetOptimizer: ({ currentExpenses, budget }) => `You are a travel finance advisor.

Task: Given the current expense items: ${JSON.stringify(currentExpenses)}, and a total budget of ${budget}, create a daily spending plan and suggest categories where the user can reduce expenses.
Deliverables:
- Summary of current spend vs budget
- Suggested daily allowance for remaining days
- Category-wise recommendations (specific actions)
- Quick tips to stretch the budget

Return as concise, actionable points with small tables or bullet lists.`,

  chatAssistant: ({ question }) => `You are a knowledgeable travel assistant. Answer the user's question concisely and professionally.

Question: ${question}

Provide a clear answer, suggestions, and references if relevant.`,
};

export const generateTripPlanner = async (payload) => {
  const prompt = templates.tripPlanner(payload);
  return await callGemini(prompt);
};

export const generatePackingList = async (payload) => {
  const prompt = templates.packingList(payload);
  return await callGemini(prompt);
};

export const generateBudgetOptimizer = async (payload) => {
  const prompt = templates.budgetOptimizer(payload);
  return await callGemini(prompt);
};

export const chatAssistant = async (question) => {
  const prompt = templates.chatAssistant({ question });
  return await callGemini(prompt, 1500);
};

export const getPromptForType = (type, payload) => {
  if (!templates[type]) throw new Error('Unknown prompt type');
  return templates[type](payload);
};

export default { generateTripPlanner, generatePackingList, generateBudgetOptimizer, chatAssistant, getPromptForType };