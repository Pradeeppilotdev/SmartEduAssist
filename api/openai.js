// OpenAI integration for serverless functions
const OpenAI = require('openai');

/**
 * Grade a student submission using OpenAI
 * @param {Object} submission The student submission to grade
 * @param {Object} assignment The assignment details and requirements
 * @returns {Promise<Object>} Grading results and feedback
 */
async function gradeSubmission(submission, assignment) {
  try {
    // Initialize OpenAI client
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Build the prompt for the grading task
    const prompt = `
    You are an expert educator grading the following student submission for an assignment.
    
    Assignment details:
    Title: ${assignment.title}
    Type: ${assignment.type}
    Description: ${assignment.description}
    
    Student Submission:
    """
    ${submission.content}
    """
    
    Please evaluate this submission and provide:
    1. An overall score (0-100)
    2. Strengths (list 2-3 points)
    3. Areas for improvement (list 2-3 points)
    4. General comments explaining the grade
    5. Detailed scores for each rubric category:
       - Content knowledge (1-5)
       - Organization (1-5)
       - Grammar and language (1-5)
       - Creativity/critical thinking (1-5)
    
    Format your response as a JSON object with the following structure:
    {
      "score": number,
      "feedback": {
        "strengths": [string, string, ...],
        "improvements": [string, string, ...],
        "comments": string
      },
      "rubricScores": {
        "content": number,
        "organization": number,
        "grammar": number,
        "creativity": number
      }
    }
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an expert educator providing detailed, constructive feedback on student work." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1024,
    });
    
    // Parse the result
    const result = JSON.parse(response.choices[0].message.content);
    
    return result;
  } catch (error) {
    console.error('OpenAI grading error:', error);
    return { 
      error: error.message || 'Failed to grade submission',
      success: false 
    };
  }
}

module.exports = {
  gradeSubmission
};