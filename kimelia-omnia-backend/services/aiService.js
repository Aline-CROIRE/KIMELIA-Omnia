const OpenAI = require('openai');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  if (!text || text.length < 50) { // Basic check for sufficient text
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
      model: "gpt-3.5-turbo", // Or "gpt-4" for higher quality and cost
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

module.exports = {
  summarizeText,
  draftMessage,
};