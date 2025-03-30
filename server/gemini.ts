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

    // Start a chat
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Get the last message content
    const lastMessage = messages[messages.length - 1].content;

    // Generate a response
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return { success: true, text };
  } catch (error: any) {
    console.error("Error generating chat response:", error);
    return { success: false, error: error.message || "Failed to generate response" };
  }
}

// Grade assignment using Gemini
export async function gradeAssignment(
  submissionText: string,
  assignmentPrompt: string,
  rubric: string,
) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings,
    });

    const prompt = `
      You are an expert grader for educational assignments. Grade the following student submission based on the assignment prompt and rubric.
      
      ASSIGNMENT PROMPT:
      ${assignmentPrompt}
      
      RUBRIC:
      ${rubric}
      
      STUDENT SUBMISSION:
      ${submissionText}
      
      Provide a detailed assessment in the following JSON format:
      {
        "score": (a number between 0-100),
        "feedback": {
          "strengths": [(list of specific strengths in the submission)],
          "areas_for_improvement": [(list of specific areas for improvement)],
          "comments": "(general constructive feedback)"
        },
        "rubric_breakdown": {
          "(rubric_category)": {
            "score": (points earned for this category),
            "max_points": (maximum possible points for this category),
            "comments": "(specific feedback for this category)"
          }
        }
      }
      
      Your assessment should be fair, based solely on the rubric criteria, and provide constructive feedback that helps the student improve.
      Only return the JSON with no additional text or explanations outside the JSON structure.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Try to parse the response as JSON
      const jsonResponse = JSON.parse(text);
      return { success: true, data: jsonResponse };
    } catch (parseError) {
      // If parsing fails, return the raw text
      console.error("Failed to parse Gemini response as JSON:", parseError);
      return { 
        success: false, 
        error: "Failed to parse grading response",
        rawResponse: text 
      };
    }
  } catch (error: any) {
    console.error("Error grading assignment:", error);
    return { success: false, error: error.message || "Failed to grade assignment" };
  }
}

// Generate suggested improvement for a student submission
export async function generateImprovement(
  submissionText: string,
  assignmentPrompt: string,
  feedbackText: string
) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings,
    });

    const prompt = `
      You are an educational AI assistant. Help improve the following student submission based on the assignment prompt and teacher feedback.
      
      ASSIGNMENT PROMPT:
      ${assignmentPrompt}
      
      STUDENT SUBMISSION:
      ${submissionText}
      
      TEACHER FEEDBACK:
      ${feedbackText}
      
      Provide specific suggestions for how the student could improve their submission. Include:
      1. Concrete examples of improvements
      2. Alternative phrasings or approaches
      3. Additional concepts or evidence they could incorporate
      4. Corrected versions of problematic sections
      
      Be supportive, constructive, and specific in your guidance. Focus on helping the student learn and improve.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { success: true, text };
  } catch (error: any) {
    console.error("Error generating improvement suggestions:", error);
    return { success: false, error: error.message || "Failed to generate improvement suggestions" };
  }
}