const OpenAI = require('openai');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- AI-Powered Text Operations ---

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
    throw new Error('OpenAI API Key is not configured in environment variables.');
  }
  if (!text || text.length < 50) {
    throw new Error('Input text must be at least 50 characters for effective summarization.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or "gpt-4" for higher quality and cost
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
    throw new Error('OpenAI API Key is not configured in environment variables.');
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
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that drafts clear, concise, and appropriate messages." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
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

// --- AI-Powered Motivation / Tips ---

const motivationalTips = [
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
 * @description Provides a motivational tip.
 * @param {string} userId - The ID of the user (for future personalization based on goals/progress).
 * @returns {Promise<string>} - A motivational tip.
 */
const getMotivationalTip = async (userId) => {
  // Enhanced to potentially use AI with user context in the future
  // For now, return a random static tip.
  const randomIndex = Math.floor(Math.random() * motivationalTips.length);
  return motivationalTips[randomIndex];
};

// --- New AI Functions for Omnia Insights ---

/**
 * @function getPersonalizedProductivityRecommendation
 * @description Generates AI-driven productivity recommendations based on user activity summary.
 * @param {Object} userDataSummary - An object summarizing user's tasks, events, and their status.
 * @returns {Promise<string>} - A string containing personalized productivity recommendations.
 * @throws {Error} If the OpenAI API call fails or API key is missing.
 */
const getPersonalizedProductivityRecommendation = async (userDataSummary) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is not configured for productivity recommendations.');
  }
  if (!userDataSummary || typeof userDataSummary !== 'object' || Object.keys(userDataSummary).length === 0) {
    throw new Error('User data summary is required for personalized productivity recommendations.');
  }

  const prompt = `Based on the following user activity summary, provide actionable and encouraging productivity recommendations to help them optimize their day and achieve more. Focus on improvements, time management, and habit formation.

  User Activity Summary:
  ${JSON.stringify(userDataSummary, null, 2)}

  Recommendations:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Consider gpt-4 for more nuanced advice
      messages: [
        { role: "system", content: "You are an AI productivity coach providing intelligent, empathetic, and actionable advice." },
        { role: "user", content: prompt },
      ],
      max_tokens: 250,
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
 * @description Generates AI-driven recommendations for goal achievement based on user's goal data.
 * @param {Object} goalData - An object summarizing a user's specific goal (title, progress, targetDate, etc.).
 * @returns {Promise<string>} - A string containing personalized goal achievement recommendations.
 * @throws {Error} If the OpenAI API call fails or API key is missing.
 */
const getPersonalizedGoalRecommendation = async (goalData) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is not configured for goal recommendations.');
  }
  if (!goalData || typeof goalData !== 'object' || Object.keys(goalData).length === 0) {
    throw new Error('Goal data is required for personalized goal achievement recommendations.');
  }

  const prompt = `Based on the following goal details, provide specific and actionable advice to help the user achieve their goal. Focus on breaking it down, staying motivated, and overcoming challenges.

  Goal Details:
  ${JSON.stringify(goalData, null, 2)}

  Actionable Advice for Goal Achievement:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Consider gpt-4 for more nuanced advice
      messages: [
        { role: "system", content: "You are an AI personal growth coach providing intelligent, empathetic, and actionable advice for achieving goals." },
        { role: "user", content: prompt },
      ],
      max_tokens: 250,
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


module.exports = {
  summarizeText,
  draftMessage,
  getMotivationalTip,
  getPersonalizedProductivityRecommendation, // Export new function
  getPersonalizedGoalRecommendation,          // Export new function
};