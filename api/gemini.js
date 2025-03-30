// Gemini API integration for serverless functions
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generate chat response using Google's Gemini AI
 * @param {Array} messages Array of message objects with role and content
 * @returns {Promise<Object>} Response from Gemini API
 */
async function generateChatResponse(messages) {
  try {
    // Initialize Gemini API
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Prepare chat history in Gemini format
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Create chat session
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1),
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
    
    // Get response from last message
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response.text();
    
    return { response, success: true };
  } catch (error) {
    console.error('Gemini API error:', error);
    return { 
      error: error.message || 'Failed to generate response', 
      success: false 
    };
  }
}

/**
 * Generate improvement suggestions for student work
 * @param {string} studentWork The original work to improve
 * @param {string} initialFeedback Initial feedback to build upon
 * @returns {Promise<Object>} Improvement suggestions
 */
async function generateImprovement(studentWork, initialFeedback) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
    As an educational AI assistant, your task is to provide constructive suggestions to improve the following student work.
    
    Original student work:
    """
    ${studentWork}
    """
    
    Initial feedback:
    """
    ${initialFeedback}
    """
    
    Please provide specific, actionable suggestions to help the student improve their work. 
    Focus on content, organization, clarity, and depth of analysis. 
    Be encouraging but honest about areas for improvement.
    Format your response as a list of 3-5 specific suggestions.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return { improvements: response, success: true };
  } catch (error) {
    console.error('Gemini improvement error:', error);
    return { 
      error: error.message || 'Failed to generate improvement suggestions', 
      success: false 
    };
  }
}

module.exports = {
  generateChatResponse,
  generateImprovement
};