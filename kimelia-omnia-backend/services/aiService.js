const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI client with API key from environment variables
let gemini;
if (process.env.GEMINI_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn('GEMINI_API_KEY is not configured. AI services will be limited or use fallbacks.');
}

// Helper to check if AI is available
const isGeminiAvailable = () => {
  return !!gemini;
};

// ... (keep summarizeText, draftMessage, getMotivationalTip,
// getPersonalizedProductivityRecommendation, getPersonalizedGoalRecommendation,
// getWellnessSuggestion functions as they were in the last full aiService.js file) ...

// --- NEW: AI-Powered Learning Resource Generation (IMPROVED JSON PARSING) ---

/**
 * @function generateLearningResources
 * @description Generates a list of AI-curated learning resources (titles, descriptions, and mock URLs) based on a given topic or goal.
 * @param {string} topic - The topic or goal for which to generate learning resources.
 * @param {string} [typeHint='any'] - A hint for the type of resources (e.g., 'articles', 'videos', 'courses').
 * @param {string} [difficulty='beginner'] - The desired difficulty level.
 * @returns {Promise<Array<Object>>} - An array of suggested learning resource objects.
 *   Example: [{ title, description, url, type, category, source: 'AI_suggested' }]
 * @throws {Error} If the Gemini API call fails or API key is missing.
 */
const generateLearningResources = async (topic, typeHint = 'any', difficulty = 'beginner') => {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini API Key is not configured for generating learning resources.');
  }
  if (!topic || topic.length < 10) {
    throw new Error('Please provide a specific topic or goal (at least 10 characters) for generating learning resources.');
  }

  const systemMessage = `You are an AI learning assistant. Your task is to suggest relevant learning resources for a given topic. For each suggestion, provide a concise title, a brief description, a plausible URL (it doesn't have to be real, but should look like a real, helpful resource link), the resource type, and a category. Aim for 3-5 diverse resources. Always output valid JSON.`;

  // Refined prompt to be more insistent on JSON format and provide a concrete example
  const userPrompt = `Generate 3-5 learning resources for the topic: "${topic}".
  Desired resource types: ${typeHint}.
  Difficulty level: ${difficulty}.

  Provide the response as a JSON object with a single key "resources", which contains an array of objects.
  Each object in the "resources" array must have the following keys:
  - "title": string (concise title for the resource)
  - "description": string (brief explanation)
  - "url": string (a realistic-looking URL, e.g., "https://example.com/learn-topic")
  - "type": string (must be one of "article", "video", "course", "book", "podcast", "tool", "other")
  - "category": string (must be one of "programming", "marketing", "finance", "design", "self-improvement", "other")

  Example of expected JSON output:
  {
    "resources": [
      {
        "title": "Introduction to AI",
        "description": "A beginner-friendly article covering the basics of artificial intelligence.",
        "url": "https://www.freecodecamp.org/news/what-is-artificial-intelligence-ai-meaning/",
        "type": "article",
        "category": "programming"
      }
    ]
  }
  `;

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemMessage }] },
      ],
      generationConfig: {
        maxOutputTokens: 700,
        temperature: 0.7,
        // Removed response_format: { type: "json_object" } for now if it causes issues,
        // relying on prompt engineering. If it works for you, you can re-add it.
      },
    });

    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    let responseText = response.text().trim();

    // --- IMPROVED JSON EXTRACTION ---
    // Attempt to extract JSON from markdown code block if present
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      responseText = jsonMatch[1].trim();
      console.log("[Gemini AI Service] Extracted JSON from markdown block.");
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON (attempted extraction):', responseText, parseError);
      throw new Error("AI did not return valid JSON. Raw response fragment: " + responseText.substring(0, 500));
    }

    const resourceArray = parsedResponse.resources; // Still expecting a "resources" key

    if (!Array.isArray(resourceArray) || resourceArray.length === 0) {
        console.error('Gemini response did not contain a valid "resources" array or it was empty:', parsedResponse);
        throw new Error("AI did not return a valid list of resources in the expected JSON 'resources' array. Raw response fragment: " + responseText.substring(0, 500));
    }

    return resourceArray.map(res => ({
        title: res.title || "Untitled Resource",
        description: res.description || "No description provided.",
        url: res.url || "https://example.com/no-link", // Provide a default or empty string
        type: res.type && ['article', 'video', 'course', 'book', 'podcast', 'tool', 'other'].includes(res.type) ? res.type : 'other',
        category: res.category && ['programming', 'marketing', 'finance', 'design', 'self-improvement', 'other'].includes(res.category) ? res.category : 'other',
        source: 'AI_suggested',
    }));

  } catch (error) {
    console.error('Error generating learning resources with Gemini:', error.message);
    if (error.response) {
      // Gemini's errors are in error.message, not always error.response.data
      console.error('Gemini API Error details:', error); // Log the full error object for more context
    }
    throw new Error('Failed to generate AI learning resources. Please check server logs and Gemini API key/usage limits.');
  }
};


module.exports = {
  summarizeText,
  draftMessage,
  getMotivationalTip,
  getPersonalizedProductivityRecommendation,
  getPersonalizedGoalRecommendation,
  getWellnessSuggestion,
  generateLearningResources,
};
