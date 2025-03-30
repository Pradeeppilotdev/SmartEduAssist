import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertAssignmentSchema, 
  insertSubmissionSchema, 
  insertFeedbackSchema,
  insertClassSchema,
  insertClassEnrollmentSchema,
  Assignment
} from "@shared/schema";
import { gradeSubmission } from "./ai";
import { generateChatResponse, gradeAssignment, generateImprovement } from "./gemini";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes first
  setupAuth(app);

  // Class routes
  app.get("/api/classes", async (req, res) => {
    // Check for demo mode first
    if (process.env.DEMO_MODE === 'true') {
      // Return sample classes for demonstration
      return res.json([
        {
          id: 1,
          name: 'Introduction to Computer Science',
          description: 'Fundamentals of computer science and programming',
          teacherId: 999,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Data Structures and Algorithms',
          description: 'Advanced data structures and algorithm analysis',
          teacherId: 999,
          createdAt: new Date().toISOString()
        }
      ]);
    }
    
    // Regular authentication check for non-demo mode
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (req.user.role === 'teacher') {
        const classes = await storage.getClassesByTeacher(req.user.id);
        return res.json(classes);
      } else {
        const classes = await storage.getClassesForStudent(req.user.id);
        return res.json(classes);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      return res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post("/api/classes", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'teacher') {
      return res.status(401).json({ message: "Only teachers can create classes" });
    }
    
    try {
      const validatedData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(validatedData);
      return res.status(201).json(newClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid class data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create class" });
    }
  });

  app.get("/api/classes/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const classId = parseInt(req.params.id);
      const cls = await storage.getClass(classId);
      
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      // Check permission: user should be teacher of this class or a student enrolled in it
      if (req.user.role === 'teacher' && cls.teacherId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to view this class" });
      }
      
      if (req.user.role === 'student') {
        const studentClasses = await storage.getClassesForStudent(req.user.id);
        if (!studentClasses.find(c => c.id === classId)) {
          return res.status(403).json({ message: "You are not enrolled in this class" });
        }
      }
      
      return res.json(cls);
    } catch (error) {
      console.error("Error fetching class:", error);
      return res.status(500).json({ message: "Failed to fetch class" });
    }
  });

  app.post("/api/classes/:id/enroll", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'teacher') {
      return res.status(401).json({ message: "Only teachers can enroll students" });
    }
    
    try {
      const classId = parseInt(req.params.id);
      const cls = await storage.getClass(classId);
      
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      // Ensure the teacher owns this class
      if (cls.teacherId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to modify this class" });
      }
      
      const validatedData = insertClassEnrollmentSchema.parse({
        classId,
        studentId: req.body.studentId
      });
      
      const enrollment = await storage.enrollStudent(validatedData);
      return res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid enrollment data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to enroll student" });
    }
  });

  // Assignment routes
  app.get("/api/assignments", async (req, res) => {
    // Check for demo mode first
    if (process.env.DEMO_MODE === 'true') {
      // Return sample assignments for demonstration
      return res.json([
        {
          id: 1,
          title: 'Programming Basics',
          description: 'Create a simple program demonstrating variables and control flow',
          classId: 1,
          type: 'essay',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'open'
        },
        {
          id: 2,
          title: 'Data Structure Implementation',
          description: 'Implement a binary search tree with insertion and traversal methods',
          classId: 2,
          type: 'code',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'open'
        }
      ]);
    }
    
    // Regular authentication check for non-demo mode
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (req.user.role === 'teacher') {
        // For teachers, show assignments for their classes
        const classes = await storage.getClassesByTeacher(req.user.id);
        const classIds = classes.map(cls => cls.id);
        
        let assignments: Assignment[] = [];
        for (const classId of classIds) {
          const classAssignments = await storage.getAssignmentsForClass(classId);
          assignments = assignments.concat(classAssignments);
        }
        
        return res.json(assignments);
      } else {
        // For students, show assignments from enrolled classes
        const classes = await storage.getClassesForStudent(req.user.id);
        const classIds = classes.map(cls => cls.id);
        
        let assignments: Assignment[] = [];
        for (const classId of classIds) {
          const classAssignments = await storage.getAssignmentsForClass(classId);
          assignments = assignments.concat(classAssignments);
        }
        
        return res.json(assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get("/api/assignments/recent", async (req, res) => {
    // Check for demo mode first
    if (process.env.DEMO_MODE === 'true') {
      // Return sample recent assignments with stats for demonstration
      return res.json([
        {
          id: 1,
          title: 'Programming Basics',
          description: 'Create a simple program demonstrating variables and control flow',
          classId: 1,
          type: 'essay',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'open',
          className: 'Introduction to Computer Science',
          submissionCount: 5,
          totalStudents: 15
        },
        {
          id: 2,
          title: 'Data Structure Implementation',
          description: 'Implement a binary search tree with insertion and traversal methods',
          classId: 2,
          type: 'code',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'open',
          className: 'Data Structures and Algorithms',
          submissionCount: 3,
          totalStudents: 12
        }
      ]);
    }
    
    // Regular authentication check for non-demo mode
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (req.user.role === 'teacher') {
        const recentAssignments = await storage.getRecentAssignments(req.user.id, limit);
        return res.json(recentAssignments);
      } else {
        // For students, return their assignments
        const classes = await storage.getClassesForStudent(req.user.id);
        const classIds = classes.map(cls => cls.id);
        
        let assignments: Assignment[] = [];
        for (const classId of classIds) {
          const classAssignments = await storage.getAssignmentsForClass(classId);
          assignments = assignments.concat(classAssignments);
        }
        
        // Sort by most recent and limit
        assignments.sort((a, b) => {
          const dateA = new Date(b.createdAt).getTime();
          const dateB = new Date(a.createdAt).getTime();
          return dateA - dateB;
        });
        return res.json(assignments.slice(0, limit));
      }
    } catch (error) {
      console.error("Error fetching recent assignments:", error);
      return res.status(500).json({ message: "Failed to fetch recent assignments" });
    }
  });

  app.post("/api/assignments", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'teacher') {
      return res.status(401).json({ message: "Only teachers can create assignments" });
    }
    
    try {
      console.log("Assignment data received:", JSON.stringify(req.body));
      
      const validatedData = insertAssignmentSchema.parse(req.body);
      console.log("Validated assignment data:", JSON.stringify(validatedData));
      
      // Verify teacher owns the class
      const cls = await storage.getClass(validatedData.classId);
      if (!cls || cls.teacherId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to add assignments to this class" });
      }
      
      const newAssignment = await storage.createAssignment(validatedData);
      return res.status(201).json(newAssignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", JSON.stringify(error.errors));
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      console.error("Assignment creation error:", error);
      return res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  app.get("/api/assignments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const assignmentId = parseInt(req.params.id);
      const assignment = await storage.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if the user has access to this assignment
      const cls = await storage.getClass(assignment.classId);
      
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      if (req.user.role === 'teacher' && cls.teacherId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to view this assignment" });
      }
      
      if (req.user.role === 'student') {
        const studentClasses = await storage.getClassesForStudent(req.user.id);
        if (!studentClasses.find(c => c.id === assignment.classId)) {
          return res.status(403).json({ message: "You are not enrolled in this class" });
        }
      }
      
      return res.json(assignment);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      return res.status(500).json({ message: "Failed to fetch assignment" });
    }
  });

  // Submission routes
  app.get("/api/submissions/pending", async (req, res) => {
    // Check for demo mode first
    if (process.env.DEMO_MODE === 'true') {
      // Return empty array for demo (no pending submissions)
      // In a real application, there would be actual submissions pending teacher review here
      return res.json([]);
    }
    
    // Regular authentication check for non-demo mode
    if (!req.isAuthenticated() || req.user.role !== 'teacher') {
      return res.status(401).json({ message: "Only teachers can view pending reviews" });
    }
    
    try {
      const pendingReviews = await storage.getPendingReviews(req.user.id);
      return res.json(pendingReviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      return res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  app.get("/api/assignments/:id/submissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const assignmentId = parseInt(req.params.id);
      const assignment = await storage.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Verify permission
      const cls = await storage.getClass(assignment.classId);
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      if (req.user.role === 'teacher') {
        // Teachers can only view submissions for their own classes
        if (cls.teacherId !== req.user.id) {
          return res.status(403).json({ message: "You do not have permission to view these submissions" });
        }
        
        const submissions = await storage.getSubmissionsByAssignment(assignmentId);
        return res.json(submissions);
      } else {
        // Students can only view their own submissions
        const studentClasses = await storage.getClassesForStudent(req.user.id);
        if (!studentClasses.find(c => c.id === assignment.classId)) {
          return res.status(403).json({ message: "You are not enrolled in this class" });
        }
        
        const allSubmissions = await storage.getSubmissionsByAssignment(assignmentId);
        const studentSubmissions = allSubmissions.filter(sub => sub.studentId === req.user.id);
        return res.json(studentSubmissions);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/assignments/:id/submit", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'student') {
      return res.status(401).json({ message: "Only students can submit assignments" });
    }
    
    try {
      const assignmentId = parseInt(req.params.id);
      const assignment = await storage.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if student is enrolled in the class
      const cls = await storage.getClass(assignment.classId);
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      const studentClasses = await storage.getClassesForStudent(req.user.id);
      if (!studentClasses.find(c => c.id === assignment.classId)) {
        return res.status(403).json({ message: "You are not enrolled in this class" });
      }
      
      // Create the submission
      const submissionData = {
        assignmentId,
        studentId: req.user.id,
        content: req.body.content,
        status: 'submitted'
      };
      
      const validatedData = insertSubmissionSchema.parse(submissionData);
      const submission = await storage.createSubmission(validatedData);
      
      // Call AI service to grade the submission
      try {
        const aiGradingResult = await gradeSubmission(submission, assignment);
        
        // Create feedback with AI grading
        const feedbackData = {
          submissionId: submission.id,
          aiScore: aiGradingResult.score,
          aiComments: aiGradingResult.feedback,
          rubricScores: aiGradingResult.rubricScores
        };
        
        await storage.createFeedback(feedbackData);
        
        // Update submission status
        await storage.updateSubmission(submission.id, { status: 'ai_graded' });
        
        // Return the submission
        return res.status(201).json(submission);
      } catch (error) {
        console.error("Error during AI grading:", error);
        // Still save the submission even if AI grading fails
        return res.status(201).json(submission);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      console.error("Error creating submission:", error);
      return res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.get("/api/submissions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      // Get the assignment and class to check permissions
      const assignment = await storage.getAssignment(submission.assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      const cls = await storage.getClass(assignment.classId);
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      // Verify permission
      if (req.user.role === 'teacher') {
        // Teachers can only view submissions for their own classes
        if (cls.teacherId !== req.user.id) {
          return res.status(403).json({ message: "You do not have permission to view this submission" });
        }
      } else {
        // Students can only view their own submissions
        if (submission.studentId !== req.user.id) {
          return res.status(403).json({ message: "You can only view your own submissions" });
        }
      }
      
      // Get feedback
      const feedback = await storage.getFeedbackBySubmission(submissionId);
      
      // Get student info
      const student = await storage.getUser(submission.studentId);
      
      // Return enriched submission
      const enrichedSubmission = {
        ...submission,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown Student",
        assignmentTitle: assignment.title,
        feedback
      };
      
      return res.json(enrichedSubmission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      return res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  // Feedback routes
  app.put("/api/feedback/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'teacher') {
      return res.status(401).json({ message: "Only teachers can update feedback" });
    }
    
    try {
      const feedbackId = parseInt(req.params.id);
      const feedback = await storage.getFeedback(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      
      // Verify the teacher has permission to update this feedback
      const submission = await storage.getSubmission(feedback.submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      const assignment = await storage.getAssignment(submission.assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      const cls = await storage.getClass(assignment.classId);
      if (!cls || cls.teacherId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to update this feedback" });
      }
      
      // Update the feedback
      const updateData = {
        teacherScore: req.body.teacherScore,
        teacherComments: req.body.teacherComments,
        rubricScores: req.body.rubricScores || feedback.rubricScores
      };
      
      const updatedFeedback = await storage.updateFeedback(feedbackId, updateData);
      
      // Also update the submission status
      await storage.updateSubmission(submission.id, { status: 'teacher_reviewed' });
      
      return res.json(updatedFeedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      return res.status(500).json({ message: "Failed to update feedback" });
    }
  });
  
  // Student-specific routes
  app.get("/api/student/assignments", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'student') {
      return res.status(401).json({ message: "Only students can access this endpoint" });
    }
    
    try {
      const classes = await storage.getClassesForStudent(req.user.id);
      const classIds = classes.map(cls => cls.id);
      
      let assignments = [];
      for (const classId of classIds) {
        const classAssignments = await storage.getAssignmentsForClass(classId);
        assignments = assignments.concat(classAssignments);
      }
      
      return res.json(assignments);
    } catch (error) {
      console.error("Error fetching student assignments:", error);
      return res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  
  // Get student stats for dashboard
  app.get("/api/student/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'student') {
      return res.status(401).json({ message: "Only students can access this endpoint" });
    }
    
    try {
      // Get all assignments for this student
      const classes = await storage.getClassesForStudent(req.user.id);
      const classIds = classes.map(cls => cls.id);
      
      let assignments = [];
      for (const classId of classIds) {
        const classAssignments = await storage.getAssignmentsForClass(classId);
        assignments = assignments.concat(classAssignments);
      }
      
      // Get all submissions for this student
      const submissions = await storage.getSubmissionsByStudent(req.user.id);
      
      // Calculate pending assignments (assigned but not submitted)
      const submittedAssignmentIds = submissions.map(sub => sub.assignmentId);
      const pendingAssignments = assignments.filter(
        assignment => !submittedAssignmentIds.includes(assignment.id)
      );
      
      // Calculate completed assignments (submitted and graded)
      const completedSubmissions = submissions.filter(
        submission => submission.status === 'ai_graded' || submission.status === 'teacher_reviewed'
      );
      
      // Get feedback for graded submissions to calculate average
      let totalScore = 0;
      let gradedCount = 0;
      
      for (const submission of completedSubmissions) {
        const feedback = await storage.getFeedbackBySubmission(submission.id);
        if (feedback) {
          // Use teacher score if available, otherwise AI score
          const score = feedback.teacherScore !== null ? feedback.teacherScore : feedback.aiScore;
          if (score !== null) {
            totalScore += score;
            gradedCount++;
          }
        }
      }
      
      const averageScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : null;
      
      // Mock data for class rank (would require more complex calculations in a real app)
      const classRank = "5th";
      
      return res.json({
        pendingAssignments: pendingAssignments.length,
        completedAssignments: completedSubmissions.length,
        averageScore,
        classRank
      });
    } catch (error) {
      console.error("Error fetching student stats:", error);
      return res.status(500).json({ message: "Failed to fetch student statistics" });
    }
  });

  // Google Gemini AI endpoints
  app.post("/api/ai/chat", async (req, res) => {
    // Check for demo mode - in demo mode we don't require authentication
    if (process.env.DEMO_MODE !== 'true' && !req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid request format. 'messages' array is required." });
      }
      
      const responseText = await generateChatResponse(messages);
      return res.json({ response: responseText });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/ai/grade", async (req, res) => {
    // Check for demo mode - in demo mode we don't require authentication
    if (process.env.DEMO_MODE !== 'true' && (!req.isAuthenticated() || req.user.role !== 'teacher')) {
      return res.status(401).json({ message: "Only teachers can access this endpoint" });
    }
    
    try {
      const { submissionText, assignmentDetails } = req.body;
      
      if (!submissionText || !assignmentDetails) {
        return res.status(400).json({ 
          message: "Missing required fields. 'submissionText' and 'assignmentDetails' are required." 
        });
      }
      
      const result = await gradeAssignment(submissionText, assignmentDetails);
      return res.json(result);
    } catch (error) {
      console.error("Error in grading endpoint:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/ai/improve", async (req, res) => {
    // Check for demo mode - in demo mode we don't require authentication
    if (process.env.DEMO_MODE !== 'true' && !req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { studentWork, initialFeedback } = req.body;
      
      if (!studentWork || !initialFeedback) {
        return res.status(400).json({ 
          message: "Missing required fields. 'studentWork' and 'initialFeedback' are required." 
        });
      }
      
      const improvedFeedback = await generateImprovement(studentWork, initialFeedback);
      return res.json({ suggestions: improvedFeedback });
    } catch (error) {
      console.error("Error in improvement endpoint:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Health check endpoint for API status
  app.get("/api/health", (req, res) => {
    // Force content type to be JSON to ensure the browser doesn't treat this as HTML
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Get API key status
    const geminiKeyExists = typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.length > 0;
    const openAIKeyExists = typeof process.env.OPENAI_API_KEY === 'string' && process.env.OPENAI_API_KEY.length > 0;
    
    // Send the health status
    res.send(JSON.stringify({
      status: "ok",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      demo_mode: process.env.DEMO_MODE === "true",
      api_status: {
        gemini: geminiKeyExists,
        openai: openAIKeyExists
      }
    }));
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
