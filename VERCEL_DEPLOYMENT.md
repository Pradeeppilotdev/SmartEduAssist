# Deploying GradeAssist to Vercel

This document provides instructions for deploying the GradeAssist application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. The Vercel CLI installed globally (optional, but recommended):
   ```
   npm install -g vercel
   ```
3. API keys for external services:
   - OPENAI_API_KEY - For advanced grading and feedback
   - GEMINI_API_KEY - For chatbot functionality

## Setup Environment Variables

Before deploying, you need to set up the following environment variables in Vercel:

1. `SESSION_SECRET` - A random string used for session encryption
2. `OPENAI_API_KEY` - Your OpenAI API key (get one at https://platform.openai.com/)
3. `GEMINI_API_KEY` - Your Google Gemini API key (get one at https://ai.google.dev/)
4. `NODE_ENV` - Set to "production"

## Project Structure for Vercel

The application is structured for optimal deployment on Vercel:

- Frontend (React app): Built with Vite and served as static files
- Backend (API routes): Serverless functions in the `/api` directory
- Database: In-memory storage for demonstration (can be upgraded to PostgreSQL)

## Deployment Steps

### Option 1: Using Vercel Dashboard

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Log in to your Vercel dashboard
3. Click "New Project"
4. Import your repository
5. Configure project settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Add all environment variables mentioned above
7. Click "Deploy"

### Option 2: Using Vercel CLI

1. Open a terminal in your project directory
2. Run `vercel login` and follow the instructions
3. Run `vercel` to deploy
4. When prompted, configure your project:
   - Set the build command to: `npm run build`
   - Set the output directory to: `dist`
   - Add all required environment variables

## API Routes in Serverless Environment

The application uses a special structure for the API routes to work in a serverless environment:

- `/api/_app.js` - Shared Express app configuration 
- `/api/index.js` - Main API entry point with route handlers
- `/api/gemini.js` - Helper functions for Google Gemini AI integration
- `/api/openai.js` - Helper functions for OpenAI integration
- `/api/vercel.json` - API-specific configuration for Vercel

## Database Considerations

For this deployment, we're using an in-memory database for simplicity. If you need persistent storage:

1. Set up a PostgreSQL database (Vercel integrates with Neon, Supabase, etc.)
2. Add the database connection string as `DATABASE_URL` environment variable
3. Uncomment the database configuration in the appropriate files

## Verifying Deployment

After deployment:

1. Visit your deployed application URL
2. Verify that the health check endpoint works (`/api/health`)
3. Test user authentication (register and login)
4. Test the AI chatbot feature
5. Test assignment creation and grading

## Troubleshooting

If you encounter issues:

1. Check Vercel deployment logs for error messages
2. Verify all environment variables are correctly set (especially API keys)
3. Check the application's network requests for API errors
4. Make sure the serverless function has access to all required dependencies
5. For AI-related issues, check API key permissions and usage limits

## Connecting a Custom Domain

To use a custom domain:

1. Go to your project in the Vercel dashboard
2. Click on "Domains"
3. Add your domain and follow the verification steps

## Keeping Secrets Secure

Never commit API keys or secrets to your repository. Always use environment variables for sensitive information. Vercel provides secure environment variable storage for this purpose.

## Required API Keys

### OpenAI API Key

The application uses OpenAI's GPT-4o model for grading assignments. To get an API key:

1. Sign up or log in at https://platform.openai.com/
2. Navigate to the API keys section
3. Create a new secret key
4. Add this key as the `OPENAI_API_KEY` environment variable in Vercel

### Google Gemini API Key

The application uses Google's Gemini 1.5 Pro model for the AI chatbot. To get an API key:

1. Visit https://ai.google.dev/
2. Sign up or log in with your Google account
3. Navigate to the API keys section in Google AI Studio
4. Create a new API key
5. Add this key as the `GEMINI_API_KEY` environment variable in Vercel

## Post-Deployment Maintenance

- Monitor API usage to avoid unexpected charges
- Regularly check for security updates in dependencies
- Consider setting up GitHub Actions for automated deployments
- Implement proper logging for production monitoring