const OpenAI = require('openai');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- AI-Powered Text Operations (Summarization & Drafting) ---

/**
 * @function summarizeText
 * @description Uses AI to summarize a given block of text.
 * @param {string} text - The input text to be summarized.
 * @param {string} [promptPrefix='Summarize the following text concisely and professionally:'] - Optional prefix for the AI prompt.
 * @returns {Promise<string>} - The summarized text.
 * @throws {Error} If the OpenAI API call fails or API key is missing.
 */
const summarizeText = async (text, promptPrefix = 'Summarize the following text concisely and professionally:') => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is not configured in environment variables. Cannot summarize.');
  }
  if (!text || text.length < 50) {
    throw new Error('Input text must be at least 50 characters for effective summarization.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Consider "gpt-4" for higher quality and cost
      messages: [
        { role: "system", content: "You are a helpful assistant that excels at summarizing text concisely and accurately." },
        { role: "user", content: `${promptPrefix}\n\nText to summarize:\n${text}` },
      ],
      max_tokens: 150, // Max length of the summary in tokens
      temperature: 0.5, // Less creative, more factual for summarization
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error summarizing text with OpenAI:', error.message);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('OpenAI API Error details:', error.response.data.error);
    }
    throw new Error('Failed to summarize text using AI. Please check server logs and your OpenAI API key/usage limits.');
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
 * @throws {Error} If the OpenAI API call fails or API key is missing.
 */
const draftMessage = async (instruction, context = '', tone = 'professional', format = 'email') => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is not configured in environment variables. Cannot draft message.');
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
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Consider "gpt-4" for higher quality and cost
      messages: [
        { role: "system", content: "You are a helpful assistant that drafts clear, concise, and appropriate messages." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300, // Max length of the draft in tokens
      temperature: 0.7, // More creative for drafting
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error drafting message with OpenAI:', error.message);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('OpenAI API Error details:', error.response.data.error);
    }
    throw new Error('Failed to draft message using AI. Please check server logs and your OpenAI API key/usage limits.');
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
 * @throws {Error} If the OpenAI API call fails or API key is missing.
 */
const getMotivationalTip = async (userContext = {}) => {
  if (!process.env.OPENAI_API_KEY) {
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
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an encouraging and wise AI coach, providing concise and impactful motivational tips." },
        { role: "user", content: prompt },
      ],
      max_tokens: 80, // Keep tips very concise
      temperature: 0.9, // More creative for motivational tips
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting AI motivational tip:', error.message);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('OpenAI API Error details:', error.response.data.error);
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
 * @throws {Error} If the OpenAI API call fails or API key is missing.
 */
const getPersonalizedProductivityRecommendation = async (comprehensiveUserData) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is not configured for productivity recommendations.');
  }
  if (!comprehensiveUserData || typeof comprehensiveUserData !== 'object' || Object.keys(comprehensiveUserData).length === 0) {
    throw new Error('Comprehensive user data is required for personalized productivity recommendations.');
  }

  const prompt = `Analyze the following comprehensive user activity and goal data. Provide actionable, intelligent, and empathetic productivity recommendations. Focus on optimizing their workflow, managing time effectively, reducing distractions, and maintaining energy. Suggest specific strategies.

Comprehensive User Data:
${JSON.stringify(comprehensiveUserData, null, 2)}

Actionable Productivity Recommendations:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Consider gpt-4 for more nuanced advice
      messages: [
        { role: "system", content: "You are an AI productivity coach providing intelligent, empathetic, and actionable advice. Structure your advice with clear points." },
        { role: "user", content: prompt },
      ],
      max_tokens: 300, // Allow more detail for comprehensive recommendations
      temperature: 0.7,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting productivity recommendations from OpenAI:', error.message);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('OpenAI API Error details:', error.response.data.error);
    }
    throw new Error('Failed to get AI productivity recommendations. Please check server logs and OpenAI API key/usage limits.');
  }
};

/**
 * @function getPersonalizedGoalRecommendation
 * @description Generates AI-driven recommendations for goal achievement based on detailed user's goal data and progress.
 * @param {Object} detailedGoalData - An object containing a deep summary of a user's specific goal (title, progress, targetDate, related tasks, learning resources, challenges).
 *   Example: { title: 'Learn React', progress: 30, targetDate: '2025-06-01', relatedTasks: [], learningResources: [] }
 * @returns {Promise<string>} - A string containing personalized goal achievement recommendations.
 * @throws {Error} If the OpenAI API call fails or API key is missing.
 */
const getPersonalizedGoalRecommendation = async (detailedGoalData) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is not configured for goal recommendations.');
  }
  if (!detailedGoalData || typeof detailedGoalData !== 'object' || Object.keys(detailedGoalData).length === 0) {
    throw new Error('Detailed goal data is required for personalized goal achievement recommendations.');
  }

  const prompt = `Analyze the following detailed goal information. Provide specific, actionable advice and strategies to help the user progress towards this goal. Consider breaking it down further, suggesting relevant learning paths, maintaining motivation, and overcoming potential challenges.

Detailed Goal Data:
${JSON.stringify(detailedGoalData, null, 2)}

Actionable Advice for Goal Achievement:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Consider gpt-4 for more nuanced advice
      messages: [
        { role: "system", content: "You are an AI personal growth coach providing intelligent, empathetic, and actionable advice for achieving goals. Break down complex advice into clear, numbered steps or bullet points." },
        { role: "user", content: prompt },
      ],
      max_tokens: 300, // Allow more detail for comprehensive recommendations
      temperature: 0.7,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting goal recommendations from OpenAI:', error.message);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('OpenAI API Error details:', error.response.data.error);
    }
    throw new Error('Failed to get AI goal achievement recommendations. Please check server logs and OpenAI API key/usage limits.');
  }
};

/**
 * @function getWellnessSuggestion
 * @description Generates AI-driven wellness suggestions based on detailed user wellness context.
 * @param {Object} detailedWellnessContext - An object containing user's recent wellness activities, schedule, current mood/stress, and requested suggestion type.
 *   Example: { currentMood: 'stressed', recentActivity: 'worked 5 hours without break', suggestionType: 'break', timezone: 'UTC' }
 * @param {string} [suggestionType='general'] - Type of suggestion needed (e.g., 'break', 'meal', 'exercise', 'mindfulness', 'hydration', 'sleep_aid').
 * @returns {Promise<string>} - A string containing a personalized wellness suggestion.
 * @throws {Error} If the OpenAI API call fails or API key is missing.
 */
const getWellnessSuggestion = async (detailedWellnessContext, suggestionType = 'general') => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is not configured for wellness suggestions.');
  }
  if (!detailedWellnessContext || typeof detailedWellnessContext !== 'object' || Object.keys(detailedWellnessContext).length === 0) {
    throw new Error('Detailed user wellness context is required for personalized wellness suggestions.');
  }

  let prompt = `Based on the following detailed user wellness context, provide a specific, actionable, and encouraging wellness suggestion related to "${suggestionType}". Make it empathetic, positive, and easy to implement. Include timing or duration if relevant.

Detailed User Wellness Context:
${JSON.stringify(detailedWellnessContext, null, 2)}

Wellness Suggestion:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI wellness assistant providing intelligent, empathetic, and actionable suggestions for health and mental balance. Focus on practical, short tips." },
        { role: "user", content: prompt },
      ],
      max_tokens: 120, // Allow slightly more detail for wellness suggestions
      temperature: 0.8, // A bit more creative for suggestions
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting wellness suggestion from OpenAI:', error.message);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('OpenAI API Error details:', error.response.data.error);
    }
    throw new Error('Failed to get AI wellness suggestion. Please check server logs and OpenAI API key/usage limits.');
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
 * @throws {Error} If the OpenAI API call fails or API key is missing.
 */
const generateLearningResources = async (topic, typeHint = 'any', difficulty = 'beginner') => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is not configured for generating learning resources.');
  }
  if (!topic || topic.length < 10) {
    throw new Error('Please provide a specific topic or goal (at least 10 characters) for generating learning resources.');
  }

  const systemMessage = `You are an AI learning assistant. Your task is to suggest relevant learning resources for a given topic. For each suggestion, provide a concise title, a brief description, a plausible URL (it doesn't have to be real, but should look like a real, helpful resource link), the resource type, and a category. Aim for 3-5 diverse resources. Format your output as a JSON array of objects.`;

  const userPrompt = `Generate 3-5 learning resources for the topic: "${topic}".
  Desired resource types: ${typeHint}.
  Difficulty level: ${difficulty}.

  Format your response as a JSON array, where each object has:
  - "title": string
  - "description": string
  - "url": string (a realistic-looking URL, not necessarily functional)
  - "type": string (e.g., "article", "video", "course", "book", "podcast", "tool", "other")
  - "category": string (e.g., "programming", "marketing", "finance", "design", "self-improvement", "other")
  - "source": "AI_suggested"
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // gpt-3.5-turbo-1106 or gpt-4 for better JSON mode support
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 700, // Sufficient for 3-5 resources
      temperature: 0.7,
      response_format: { type: "json_object" }, // Request JSON object output
    });

    const responseContent = completion.choices[0].message.content.trim();
    // Assuming the AI responds with a JSON object containing a key, e.g., "resources": [...]
    const parsedResponse = JSON.parse(responseContent);

    // Look for a key that contains the array of resources, e.g., 'resources', 'learning_resources'
    const resourceArray = parsedResponse.resources || parsedResponse.learning_resources || Object.values(parsedResponse).find(Array.isArray);

    if (!resourceArray || resourceArray.length === 0) {
        throw new Error("AI did not return a valid list of resources in JSON format.");
    }

    // Add source and validate types/categories
    return resourceArray.map(res => ({
        title: res.title,
        description: res.description,
        url: res.url,
        type: res.type || 'other', // Default if AI misses
        category: res.category || 'other', // Default if AI misses
        source: 'AI_suggested',
    }));

  } catch (error) {
    console.error('Error generating learning resources with OpenAI:', error.message);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('OpenAI API Error details:', error.response.data.error);
    }
    throw new Error('Failed to generate AI learning resources. Please check server logs and OpenAI API key/usage limits. Ensure the AI output is valid JSON.');
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