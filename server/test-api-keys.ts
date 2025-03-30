/**
 * This script tests the API keys for Gemini and OpenAI
 * Run it with `npx tsx server/test-api-keys.ts`
 */

import { generateChatResponse } from './gemini';
import { gradeSubmission } from './ai';
import 'dotenv/config';

async function testAPIs() {
  console.log('Testing API Keys...\n');
  
  // Test GEMINI_API_KEY
  console.log('Testing Gemini API...');
  try {
    const geminiPresent = !!process.env.GEMINI_API_KEY;
    console.log('GEMINI_API_KEY present:', geminiPresent);
    
    if (geminiPresent) {
      const testMessages = [{ role: 'user', content: 'Hello, can you respond with a brief greeting?' }];
      const geminiResponse = await generateChatResponse(testMessages);
      console.log('Gemini API test response:', geminiResponse ? 'SUCCESS' : 'FAILED');
      console.log('Sample response:', geminiResponse?.substring(0, 100) + '...');
    } else {
      console.log('Skipping Gemini test - API key not found.');
    }
  } catch (error: any) {
    console.error('Gemini API test failed:', error.message);
  }
  
  console.log('\n----------------------------------------\n');
  
  // Test OPENAI_API_KEY
  console.log('Testing OpenAI API...');
  try {
    const openaiPresent = !!process.env.OPENAI_API_KEY;
    console.log('OPENAI_API_KEY present:', openaiPresent);
    
    if (openaiPresent) {
      const mockSubmission = {
        id: 1,
        assignmentId: 1,
        studentId: 1,
        content: 'This is a test submission.',
        status: 'submitted',
        submittedAt: new Date() // Use actual Date object instead of string
      };
      
      const mockAssignment = {
        id: 1,
        title: 'Test Assignment',
        description: 'This is a test.',
        classId: 1,
        createdAt: new Date(),
        dueDate: new Date(),
        status: 'open',
        type: 'essay',
        rubric: {
          criteria: [
            { name: "Content", weight: 30 },
            { name: "Structure", weight: 20 }
          ]
        }
      };
      
      const gradingResult = await gradeSubmission(mockSubmission, mockAssignment);
      console.log('OpenAI API test response:', gradingResult ? 'SUCCESS' : 'FAILED');
      console.log('Sample score:', gradingResult?.score);
    } else {
      console.log('Skipping OpenAI test - API key not found.');
    }
  } catch (error: any) {
    console.error('OpenAI API test failed:', error.message);
  }
  
  console.log('\n----------------------------------------\n');
  console.log('API Tests complete!');
}

testAPIs().catch(console.error);