const { GoogleGenerativeAI } = require('@google/generative-ai');
// const OpenAI = require('openai'); // Comment out or remove OpenAI import

// Initialize Google Generative AI client with API key from environment variables
let gemini;
if (process.env.GEMINI_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn('GEMINI_API_KEY is not configured. AI services will be limited or use fallbacks.');
}

// const openai = new OpenAI({ // Comment out or remove OpenAI client init
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Helper to check if AI is available
const isGeminiAvailable = () => {
  return !!gemini;
};

// --- AI-Powered Text Operations (Summarization & Drafting) ---

/**
 * @function summarizeText
 * @description Uses AI to summarize a given block of text.
 * @param {string} text - The input text to be summarized.
 * @param {string} [promptPrefix='Summarize the following text concisely and professionally:'] - Optional prefix for the AI prompt.
 * @returns {Promise<string>} - The summarized text.
 * @throws {Error} If the Gemini API call fails or API key is missing.
 */
const summarizeText = async (text, promptPrefix = 'Summarize the following text concisely and professionally:') => {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini API Key is not configured. Cannot summarize.');
  }
  if (!text || text.length < 50) {
    throw new Error('Input text must be at least 50 characters for effective summarization.');
  }

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-pro" }); // Use "gemini-pro" for text tasks
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "You are a helpful assistant that excels at summarizing text concisely and accurately." }] },
      ],
      generationConfig: {
        maxOutputTokens: 150, // Max length of the summary
        temperature: 0.5,     // Less creative, more factual
      },
    });

    const result = await chat.sendMessage(`${promptPrefix}\n\nText to summarize:\n${text}`);
    const response = result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error summarizing text with Gemini:', error.message);
    // Gemini error structure might be different from OpenAI, log as much as possible
    if (error.response) {
      console.error('Gemini API Error details:', error.response.data || error.response.statusText);
    }
    throw new Error('Failed to summarize text using AI. Please check server logs and your Gemini API key/usage limits.');
  }
};

/**
 * @function draftMessage
 * @description Uses AI to draft a message based on a given context and instructions.
 * @param {string} instruction - The user's instruction for drafting the message.
 * @param {string} [context=''] - Optional context for the AI (e.g., previous email, meeting notes).
 * @param {string} [tone='professional'] - Optional tone for the draft (e.g., professional, friendly, urgent).
 * @param {string} [format='email'] - Optional format (e.g., email, slack message).
 * @returns {Promise<string>} - The drafted message.
 * @throws {Error} If the Gemini API call fails or API key is missing.
 */
const draftMessage = async (instruction, context = '', tone = 'professional', format = 'email') => {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini API Key is not configured. Cannot draft message.');
  }
  if (!instruction || instruction.length < 20) {
    throw new Error('Please provide a detailed instruction (at least 20 characters) for drafting the message.');
  }

  let userPrompt = `Draft a ${tone} ${format} based on the following instruction: "${instruction}".`;
  if (context) {
    userPrompt += ` Consider this additional context: "${context}".`;
  }
  userPrompt += ` Ensure the draft is in a ${tone} tone and formatted as a ${format}.`;

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "You are a helpful assistant that drafts clear, concise, and appropriate messages." }] },
      ],
      generationConfig: {
        maxOutputTokens: 300, // Max length of the draft
        temperature: 0.7,     // More creative for drafting
      },
    });

    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error drafting message with Gemini:', error.message);
    if (error.response) {
      console.error('Gemini API Error details:', error.response.data || error.response.statusText);
    }
    throw new Error('Failed to draft message using AI. Please check server logs and your Gemini API key/usage limits.');
  }
};

// --- AI-Powered Motivation / Tips (Enhanced) ---

const staticMotivationalTips = [
  "The best way to predict the future is to create it.",
  "Your only limit is your mind.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "The expert in anything was once a beginner.",
  "Don't watch the clock; do what it does. Keep going.",
  "Small daily improvements are the key to staggering long-term results.",
  "Start where you are. Use what you have. Do what you can.",
  "The mind is everything. What you think you become.",
  "The future belongs to those who believe in the beauty of their dreams."
];

/**
 * @function getMotivationalTip
 * @description Provides a personalized motivational tip using AI, based on user context.
 * @param {Object} [userContext={}] - Optional, comprehensive user context including recent activities, goals, etc.
 *   Example: { userName: 'Jane', completedTasksToday: 5, activeGoals: ['Learn Python'], challenges: 'feeling overwhelmed' }
 * @returns {Promise<string>} - A motivational tip.
 * @throws {Error} If the Gemini API call fails or API key is missing.
 */
const getMotivationalTip = async (userContext = {}) => {
  if (!isGeminiAvailable()) {
    // Fallback to static tips if AI key is missing
    const randomIndex = Math.floor(Math.random() * staticMotivationalTips.length);
    return staticMotivationalTips[randomIndex];
  }

  let prompt;
  if (Object.keys(userContext).length > 0) {
    prompt = `Given the following user context, provide a single, inspiring, and actionable motivational tip (max 2 sentences) that encourages growth and perseverance. Be empathetic and positive.

User Context:
${JSON.stringify(userContext, null, 2)}

Motivational Tip:`;
  } else {
    // If no context, use a general AI prompt
    prompt = `Provide a single, inspiring, and actionable motivational tip (max 2 sentences) about productivity or personal growth.`;
  }

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "You are an encouraging and wise AI coach, providing concise and impactful motivational tips." }] },
      ],
      generationConfig: {
        maxOutputTokens: 80, // Keep tips very concise
        temperature: 0.9,    // More creative for motivational tips
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error getting AI motivational tip with Gemini:', error.message);
    if (error.response) {
      console.error('Gemini API Error details:', error.response.data || error.response.statusText);
    }
    // Fallback to static tips on AI failure
    const randomIndex = Math.floor(Math.random() * staticMotivationalTips.length);
    return staticMotivationalTips[randomIndex];
  }
};

// --- AI Functions for Omnia Insights (Enhanced) ---

/**
 * @function getPersonalizedProductivityRecommendation
 * @description Generates AI-driven productivity recommendations based on comprehensive user activity data.
 * @param {Object} comprehensiveUserData - An object containing a deep summary of user's tasks, events, goals, recent performance.
 *   Example: { recentTasks: [], upcomingEvents: [], activeGoals: [], completionRate: '70%', challenges: 'too many distractions' }
 * @returns {Promise<string>} - A string containing personalized productivity recommendations.
 * @throws {Error} If the Gemini API call fails or API key is missing.
 */
const getPersonalizedProductivityRecommendation = async (comprehensiveUserData) => {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini API Key is not configured for productivity recommendations.');
  }
  if (!comprehensiveUserData || typeof comprehensiveUserData !== 'object' || Object.keys(comprehensiveUserData).length === 0) {
    throw new Error('Comprehensive user data is required for personalized productivity recommendations.');
  }

  const prompt = `Analyze the following comprehensive user activity and goal data. Provide actionable, intelligent, and empathetic productivity recommendations. Focus on optimizing their workflow, managing time effectively, reducing distractions, and maintaining energy. Suggest specific strategies.

Comprehensive User Data:
${JSON.stringify(comprehensiveUserData, null, 2)}

Actionable Productivity Recommendations:`;

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "You are an AI productivity coach providing intelligent, empathetic, and actionable advice. Structure your advice with clear points." }] },
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error getting productivity recommendations from Gemini:', error.message);
    if (error.response) {
      console.error('Gemini API Error details:', error.response.data || error.response.statusText);
    }
    throw new Error('Failed to get AI productivity recommendations. Please check server logs and Gemini API key/usage limits.');
  }
};

/**
 * @function getPersonalizedGoalRecommendation
 * @description Generates AI-driven recommendations for goal achievement based on detailed user's goal data and progress.
 * @param {Object} detailedGoalData - An object containing a deep summary of a user's specific goal (title, progress, targetDate, related tasks, learning resources, challenges).
 *   Example: { title: 'Learn React', progress: 30, targetDate: '2025-06-01', relatedTasks: [], learningResources: [] }
 * @returns {Promise<string>} - A string containing personalized goal achievement recommendations.
 * @throws {Error} If the Gemini API call fails or API key is missing.
 */
const getPersonalizedGoalRecommendation = async (detailedGoalData) => {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini API Key is not configured for goal recommendations.');
  }
  if (!detailedGoalData || typeof detailedGoalData !== 'object' || Object.keys(detailedGoalData).length === 0) {
    throw new Error('Detailed goal data is required for personalized goal achievement recommendations.');
  }

  const prompt = `Analyze the following detailed goal information. Provide specific, actionable advice and strategies to help the user progress towards this goal. Consider breaking it down further, suggesting relevant learning paths, maintaining motivation, and overcoming potential challenges.

Detailed Goal Data:
${JSON.stringify(detailedGoalData, null, 2)}

Actionable Advice for Goal Achievement:`;

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "You are an AI personal growth coach providing intelligent, empathetic, and actionable advice for achieving goals. Break down complex advice into clear, numbered steps or bullet points." }] },
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error getting goal recommendations from Gemini:', error.message);
    if (error.response) {
      console.error('Gemini API Error details:', error.response.data || error.response.statusText);
    }
    throw new Error('Failed to get AI goal achievement recommendations. Please check server logs and Gemini API key/usage limits.');
  }
};

/**
 * @function getWellnessSuggestion
 * @description Generates AI-driven wellness suggestions based on detailed user wellness context.
 * @param {Object} detailedWellnessContext - An object containing user's recent wellness activities, schedule, current mood/stress, and requested suggestion type.
 *   Example: { currentMood: 'stressed', recentActivity: 'worked 5 hours without break', suggestionType: 'break', timezone: 'UTC' }
 * @param {string} [suggestionType='general'] - Type of suggestion needed (e.g., 'break', 'meal', 'exercise', 'mindfulness', 'hydration', 'sleep_aid').
 * @returns {Promise<string>} - A string containing a personalized wellness suggestion.
 * @throws {Error} If the Gemini API call fails or API key is missing.
 */
const getWellnessSuggestion = async (detailedWellnessContext, suggestionType = 'general') => {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini API Key is not configured for wellness suggestions.');
  }
  if (!detailedWellnessContext || typeof detailedWellnessContext !== 'object' || Object.keys(detailedWellnessContext).length === 0) {
    throw new Error('Detailed user wellness context is required for personalized wellness suggestions.');
  }

  let prompt = `Based on the following detailed user wellness context, provide a specific, actionable, and encouraging wellness suggestion related to "${suggestionType}". Make it empathetic, positive, and easy to implement. Include timing or duration if relevant.

Detailed User Wellness Context:
${JSON.stringify(detailedWellnessContext, null, 2)}

Wellness Suggestion:`;

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "You are an AI wellness assistant providing intelligent, empathetic, and actionable suggestions for health and mental balance. Focus on practical, short tips." }] },
      ],
      generationConfig: {
        maxOutputTokens: 120,
        temperature: 0.8,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error getting wellness suggestion from Gemini:', error.message);
    if (error.response) {
      console.error('Gemini API Error details:', error.response.data || error.response.statusText);
    }
    throw new Error('Failed to get AI wellness suggestion. Please check server logs and Gemini API key/usage limits.');
  }
};


// --- NEW: AI-Powered Learning Resource Generation ---

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

  const systemMessage = `You are an AI learning assistant. Your task is to suggest relevant learning resources for a given topic. For each suggestion, provide a concise title, a brief description, a plausible URL (it doesn't have to be real, but should look like a real, helpful resource link), the resource type, and a category. Aim for 3-5 diverse resources. Format your output as a JSON array of objects.`;

  const userPrompt = `Generate 3-5 learning resources for the topic: "${topic}".
  Desired resource types: ${typeHint}.
  Difficulty level: ${difficulty}.

  Format your response as a JSON object with a single key "resources" which contains an array of objects. Each object in the array should have:
  - "title": string
  - "description": string
  - "url": string (a realistic-looking URL, not necessarily functional, e.g., "https://example.com/learn-topic")
  - "type": string (e.g., "article", "video", "course", "book", "podcast", "tool", "other")
  - "category": string (e.g., "programming", "marketing", "finance", "design", "self-improvement", "other")
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
      },
    });

    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    const responseText = response.text().trim();

    // --- IMPORTANT: Robust JSON parsing and validation for Gemini's output ---
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', responseText, parseError);
      throw new Error("AI did not return a valid JSON format. Raw response: " + responseText.substring(0, 200));
    }

    const resourceArray = parsedResponse.resources; // Expecting a "resources" key

    if (!Array.isArray(resourceArray) || resourceArray.length === 0) {
        console.error('Gemini response did not contain a valid "resources" array:', parsedResponse);
        throw new Error("AI did not return a valid list of resources in the expected JSON 'resources' array. Raw response: " + responseText.substring(0, 200));
    }

    return resourceArray.map(res => ({
        title: res.title,
        description: res.description,
        url: res.url,
        type: res.type || 'other', // Default if AI misses
        category: res.category || 'other', // Default if AI misses
        source: 'AI_suggested',
    }));

  } catch (error) {
    console.error('Error generating learning resources with Gemini:', error.message);
    if (error.response) {
      console.error('Gemini API Error details:', error.response.data || error.response.statusText);
    }
    throw new Error('Failed to generate AI learning resources. Please check server logs and Gemini API key/usage limits. Ensure the AI output is valid JSON.');
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
