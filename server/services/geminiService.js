import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const callGemini = async (prompt, maxTokens = 4000) => {
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
    temperature: 0.4,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: maxTokens
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
  tripPlanner: ({ destination, budget, days, interests }) => `
You are an AI Travel Planner.

IMPORTANT RULES

- Never introduce yourself.
- Never write paragraphs.
- Never write sentences like "As an expert travel planner..."
- Reply ONLY using headings and bullet points.
- Never use currency symbols like $, ₹, €, £.
- Treat all expenses as plain numbers.
- Plan the trip strictly within the budget.
- The total estimated expense must never exceed ${budget}.
- Complete every section.
- Give meaningful and practical suggestions.

Destination: ${destination}

Duration: ${days} Days

Budget: ${budget}

Traveler Interests: ${interests}

====================================
TRIP SUMMARY
====================================
• Destination
• Duration
• Total Budget
• Estimated Total Expense
• Remaining Budget
====================================
DAY-WISE ITINERARY
====================================

Create the itinerary for ALL ${days} days.
For EVERY day include:
Morning
• Place
• Activity
• Approximate Expense
Afternoon
• Place
• Lunch Recommendation
• Approximate Expense
Evening
• Place
• Activity
• Dinner Recommendation
• Approximate Expense

Night
• Optional Activity
• Approximate Expense
Daily Total
====================================
HOTEL RECOMMENDATIONS
====================================

Recommend exactly 3 hotels.

For each hotel include
• Hotel Name
• Area
• Rating
• Cost Per Night
• Best For

====================================
FOOD RECOMMENDATIONS
====================================

Recommend
• Breakfast
• Lunch
• Dinner
• Local Special Foods

Mention approximate expense for every item.

====================================
LOCAL TRANSPORT
====================================

Mention

• Metro
• Bus
• Taxi
• Auto
• Rental Vehicle (if available)

Mention approximate expense.

====================================
TOP ATTRACTIONS
====================================

Recommend 10 places.

For every place include

• Name
• Why Visit
• Approximate Expense

====================================
BUDGET BREAKDOWN
====================================

Accommodation

Food
Transport
Activities
Shopping
Emergency
Grand Total

====================================
SAFETY TIPS
====================================

Give 10 bullet points.

====================================
LOCAL CULTURE
====================================
Give 10 bullet points.
====================================
PACKING SUGGESTIONS
====================================

Documents
Clothes
Electronics
Medicines
Accessories
Optional Items
====================================
IMPORTANT
====================================

Return ONLY bullet points.
Do NOT use paragraphs.
Do NOT skip any section.
Do NOT exceed the budget.
Do NOT use any currency symbol.
`,

  packingList: ({ destination, season }) => `
You are an AI Packing Assistant.

Destination: ${destination}

Season: ${season}

Rules

- Reply ONLY using bullet points.
- Never write paragraphs.
- Complete every category.

Generate the following:

DOCUMENTS
CLOTHES
FOOTWEAR
ELECTRONICS
TOILETRIES
MEDICINES
ACCESSORIES
REGION SPECIFIC ITEMS
OPTIONAL ITEMS
For every item include
• Item
• Priority (Must / High / Low)
• Reason
`,

  budgetOptimizer: ({ currentExpenses, budget }) => `
You are an AI Budget Optimizer.
Budget: ${budget}
Current Expenses:
${JSON.stringify(currentExpenses)}

Rules

- Never write paragraphs.
- Never use currency symbols.
- Reply only in bullet points.
- Keep every expense as a number only.
Generate
CURRENT EXPENSE SUMMARY
• Total Budget
• Total Spent
• Remaining Budget
CATEGORY ANALYSIS
• Accommodation
• Food
• Transport
• Activities
• Shopping
WAYS TO SAVE MONEY
DAILY SPENDING LIMIT
FINAL RECOMMENDATIONS
`,

  chatAssistant: ({ question }) => `
You are an AI Travel Assistant.

Question:

${question}

Rules
- Never write paragraphs.
- Reply only using bullet points.
- Give clear and practical answers.
- Give multiple recommendations whenever possible.

Structure your answer as:
ANSWER
KEY POINTS
RECOMMENDATIONS
TRAVEL TIPS (if applicable)
`,
};

export const generateTripPlanner = async (payload) => {
  const prompt = templates.tripPlanner(payload);
  return await callGemini(prompt, 4000);
};

export const generatePackingList = async (payload) => {
  const prompt = templates.packingList(payload);
  return await callGemini(prompt, 2500);
};

export const generateBudgetOptimizer = async (payload) => {
  const prompt = templates.budgetOptimizer(payload);
  return await callGemini(prompt, 2500);
};

export const chatAssistant = async (question) => {
  const prompt = templates.chatAssistant({ question });
  return await callGemini(prompt, 2000);
};

export const getPromptForType = (type, payload) => {
  if (!templates[type]) throw new Error('Unknown prompt type');
  return templates[type](payload);
};

export default {
  generateTripPlanner,
  generatePackingList,
  generateBudgetOptimizer,
  chatAssistant,
  getPromptForType,
};