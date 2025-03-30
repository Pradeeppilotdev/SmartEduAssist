import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (teachers and students)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // 'teacher' or 'student'
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Class model
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  teacherId: integer("teacher_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student-Class relationship (many-to-many)
export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assignment model
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  classId: integer("class_id").notNull(),
  type: text("type").notNull(), // 'essay', 'multiple_choice', 'short_answer'
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").notNull(), // 'open', 'closed', 'graded'
  rubric: json("rubric"),
});

// Submission model
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  studentId: integer("student_id").notNull(),
  content: text("content"), // Text content for submissions
  submittedAt: timestamp("submitted_at").defaultNow(),
  status: text("status").notNull(), // 'submitted', 'ai_graded', 'teacher_reviewed'
});

// Feedback and grading model
export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull(),
  aiScore: integer("ai_score"), // Percentage score (0-100)
  teacherScore: integer("teacher_score"), // Percentage score (0-100)
  aiComments: json("ai_comments"), // JSON structure for strengths, improvements, comments
  teacherComments: text("teacher_comments"),
  rubricScores: json("rubric_scores"), // Detailed scores for each rubric item
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true, createdAt: true });
export const insertClassEnrollmentSchema = createInsertSchema(classEnrollments).omit({ id: true, createdAt: true });
// Custom assignment schema with improved date handling
export const insertAssignmentSchema = createInsertSchema(assignments)
  .omit({ id: true, createdAt: true })
  .transform((data) => {
    // Ensure dueDate is a valid Date object
    if (typeof data.dueDate === 'string') {
      try {
        // Try to convert the string to a Date object
        data.dueDate = new Date(data.dueDate);
      } catch (e) {
        console.error("Error converting dueDate:", e);
      }
    }
    return data;
  });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, submittedAt: true });
export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({ id: true, createdAt: true, updatedAt: true });

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type InsertClassEnrollment = z.infer<typeof insertClassEnrollmentSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// Additional types for form validation and API responses
export type AssignmentWithStats = Assignment & {
  className: string;
  submissionCount: number;
  totalStudents: number;
};

export type SubmissionWithDetails = Submission & {
  studentName: string;
  assignmentTitle: string;
  feedback?: Feedback;
};

export type ClassWithTeacher = Class & {
  teacherName: string;
};

export type UserWithoutPassword = Omit<User, 'password'>;
