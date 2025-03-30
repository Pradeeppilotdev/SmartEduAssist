import OpenAI from "openai";
import { Submission, Assignment } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder" // Placeholder for development
});

// Interface for AI grading results
interface AIGradingResult {
  score: number; // Overall score (0-100)
  feedback: {
    strengths: string[]; // List of strengths
    improvements: string[]; // List of areas for improvement
    comments: string; // General comments
  };
  rubricScores: Record<string, number>; // Detailed scores for rubric categories
}

/**
 * Grade a student submission using AI
 * @param submission The student submission to grade
 * @param assignment The assignment being graded
 * @returns AI-generated grading and feedback
 */
export async function gradeSubmission(
  submission: Submission,
  assignment: Assignment
): Promise<AIGradingResult> {
  try {
    // Default rubric if not provided
    const rubric = assignment.rubric || {
      criteria: [
        { name: "Content", weight: 30 },
        { name: "Structure", weight: 20 },
        { name: "Analysis", weight: 30 },
        { name: "Grammar", weight: 10 },
        { name: "References", weight: 10 }
      ]
    };

    // Create prompt for the AI model
    const prompt = `
    You are an expert teacher assistant tasked with grading a student's ${assignment.type} submission.
    
    ASSIGNMENT: ${assignment.title}
    ASSIGNMENT DESCRIPTION: ${assignment.description}
    
    STUDENT SUBMISSION:
    ${submission.content}
    
    GRADING RUBRIC:
    ${rubric.criteria.map(c => `${c.name} (${c.weight}%)`).join("\n")}
    
    Please grade this submission and provide detailed feedback. Consider the assignment requirements and rubric criteria.
    
    Respond in JSON format with the following structure:
    {
      "overallScore": number between 0-100,
      "rubricScores": {
        [criteriaName: string]: number between 0-100
      },
      "feedback": {
        "strengths": [list of 2-3 specific strengths],
        "improvements": [list of 2-3 specific areas for improvement],
        "comments": "general comments and suggestions"
      }
    }
    `;

    // Call OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert teacher assistant with expertise in grading and providing constructive feedback."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the AI response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(content);

    // Format the result to match our expected interface
    return {
      score: Math.round(result.overallScore),
      feedback: {
        strengths: result.feedback.strengths,
        improvements: result.feedback.improvements,
        comments: result.feedback.comments
      },
      rubricScores: result.rubricScores
    };
  } catch (error) {
    console.error("Error during AI grading:", error);
    
    // Return a fallback result in case of error
    return {
      score: 0,
      feedback: {
        strengths: ["Unable to analyze strengths due to processing error"],
        improvements: ["Unable to analyze areas for improvement due to processing error"],
        comments: "The AI grading system encountered an error while processing this submission. Please wait for manual review by your teacher."
      },
      rubricScores: {}
    };
  }
}
