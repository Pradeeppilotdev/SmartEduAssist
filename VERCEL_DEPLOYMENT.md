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
2. `OPENAI_API_KEY` - Your OpenAI API key
3. `GEMINI_API_KEY` - Your Google Gemini API key
4. `NODE_ENV` - Set to "production"

## Deployment Steps

### Option 1: Using Vercel Dashboard

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Log in to your Vercel dashboard
3. Click "New Project"
4. Import your repository
5. Configure project settings:
   - Build Command: `node build.js`
   - Output Directory: `client/dist`
   - Install Command: `npm install`
6. Add all environment variables mentioned above
7. Click "Deploy"

### Option 2: Using Vercel CLI

1. Open a terminal in your project directory
2. Run `vercel login` and follow the instructions
3. Run `vercel` to deploy
4. When prompted, configure your project:
   - Set the build command to: `node build.js`
   - Set the output directory to: `client/dist`
   - Add all required environment variables

## Verifying Deployment

After deployment:

1. Visit your deployed application URL
2. Test user authentication functionality
3. Test the AI chatbot feature
4. Test assignment creation and grading

## Troubleshooting

If you encounter issues:

1. Check Vercel deployment logs for error messages
2. Verify all environment variables are correctly set
3. Make sure API keys are valid and have appropriate permissions
4. Check the application's network requests for API errors

## Connecting a Custom Domain

To use a custom domain:

1. Go to your project in the Vercel dashboard
2. Click on "Domains"
3. Add your domain and follow the verification steps

## Keeping Secrets Secure

Never commit API keys or secrets to your repository. Always use environment variables for sensitive information. Vercel provides secure environment variable storage for this purpose.