import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Generate response for chat messages
export async function generateChatResponse(messages: { role: string; content: string }[]) {
  try {
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings,
    });

    // For Gemini, we need to use a simpler approach since it doesn't support chat history like OpenAI
    // Convert the conversation to a single prompt
    const formattedMessages = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    // Create the full prompt with context
    const prompt = `
The following is a conversation between a student/teacher and an AI teaching assistant.
The AI assistant provides helpful, accurate, and educational information.

${formattedMessages}

User: `;

    // Generate the completion
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Return the generated response
    return text.replace(/^Assistant: /, '').trim();
  } catch (error: any) {
    console.error("Error generating chat response:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

// Improve feedback for submissions
export async function generateImprovement(studentWork: string, initialFeedback: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings,
    });

    const prompt = `
You are an educational assistant helping teachers provide better feedback to their students.

Original student work:
"""
${studentWork}
"""

Initial feedback from teacher:
"""
${initialFeedback}
"""

Please improve this feedback to make it more:
1. Specific and actionable
2. Encouraging and supportive
3. Focused on learning goals
4. Balanced between strengths and areas for improvement

Provide the improved feedback:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error: any) {
    console.error("Error improving feedback:", error);
    throw new Error(`Failed to improve feedback: ${error.message}`);
  }
}

// Grade an assignment - using rubric
export async function gradeAssignment(submission: string, assignmentDetails: any): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings,
    });

    // Construct the rubric information
    const rubricInfo = assignmentDetails.rubric
      ? `Grading Rubric:
${assignmentDetails.rubric}`
      : 'Use a standard academic grading approach.';

    const prompt = `
You are an AI assistant helping a teacher grade student assignments.

Assignment Details:
"""
${assignmentDetails.title}
${assignmentDetails.description}
"""

${rubricInfo}

Student Submission:
"""
${submission}
"""

Please evaluate this submission and provide:
1. A numerical score (0-100)
2. Strengths (list 2-3 bullet points)
3. Areas for improvement (list 2-3 bullet points)
4. Brief comments explaining the evaluation

Format your response as plain text with clear sections.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Parse the response
    // This is a simplified parsing approach - in a real app you might want more robust parsing
    const scoreMatch = text.match(/score:?\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    return {
      text,
      score,
      generatedBy: 'gemini'
    };
  } catch (error: any) {
    console.error("Error grading assignment:", error);
    throw new Error(`Failed to grade assignment: ${error.message}`);
  }
}