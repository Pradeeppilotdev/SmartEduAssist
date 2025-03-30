import { 
  users, 
  classes, 
  classEnrollments, 
  assignments, 
  submissions, 
  feedbacks,
  type User, 
  type InsertUser,
  type Class,
  type InsertClass,
  type ClassEnrollment,
  type InsertClassEnrollment,
  type Assignment,
  type InsertAssignment,
  type Submission,
  type InsertSubmission,
  type Feedback,
  type InsertFeedback,
  type AssignmentWithStats,
  type SubmissionWithDetails
} from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersForClass(classId: number): Promise<User[]>;
  
  // Class operations
  getClass(id: number): Promise<Class | undefined>;
  getClassesByTeacher(teacherId: number): Promise<Class[]>;
  createClass(cls: InsertClass): Promise<Class>;
  
  // Class enrollment operations
  enrollStudent(enrollment: InsertClassEnrollment): Promise<ClassEnrollment>;
  getStudentsInClass(classId: number): Promise<User[]>;
  getClassesForStudent(studentId: number): Promise<Class[]>;
  
  // Assignment operations
  getAssignment(id: number): Promise<Assignment | undefined>;
  getAssignmentsForClass(classId: number): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, assignment: Partial<Assignment>): Promise<Assignment | undefined>;
  getRecentAssignments(teacherId: number, limit?: number): Promise<AssignmentWithStats[]>;
  
  // Submission operations
  getSubmission(id: number): Promise<Submission | undefined>;
  getSubmissionsByAssignment(assignmentId: number): Promise<SubmissionWithDetails[]>;
  getSubmissionsByStudent(studentId: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: number, submission: Partial<Submission>): Promise<Submission | undefined>;
  getPendingReviews(teacherId: number): Promise<SubmissionWithDetails[]>;
  
  // Feedback operations
  getFeedback(id: number): Promise<Feedback | undefined>;
  getFeedbackBySubmission(submissionId: number): Promise<Feedback | undefined>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: number, feedback: Partial<Feedback>): Promise<Feedback | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private classesMap: Map<number, Class>;
  private enrollmentsMap: Map<number, ClassEnrollment>;
  private assignmentsMap: Map<number, Assignment>;
  private submissionsMap: Map<number, Submission>;
  private feedbacksMap: Map<number, Feedback>;
  
  private nextUserId: number;
  private nextClassId: number;
  private nextEnrollmentId: number;
  private nextAssignmentId: number;
  private nextSubmissionId: number;
  private nextFeedbackId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.usersMap = new Map();
    this.classesMap = new Map();
    this.enrollmentsMap = new Map();
    this.assignmentsMap = new Map();
    this.submissionsMap = new Map();
    this.feedbacksMap = new Map();
    
    this.nextUserId = 1;
    this.nextClassId = 1;
    this.nextEnrollmentId = 1;
    this.nextAssignmentId = 1;
    this.nextSubmissionId = 1;
    this.nextFeedbackId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });

    // Initialize with some sample data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      user => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const timestamp = new Date();
    const newUser: User = { ...user, id, createdAt: timestamp };
    this.usersMap.set(id, newUser);
    return newUser;
  }

  async getUsersForClass(classId: number): Promise<User[]> {
    // Get student IDs enrolled in the class
    const enrollments = Array.from(this.enrollmentsMap.values())
      .filter(enrollment => enrollment.classId === classId);
    
    // Get user objects for those students
    const studentIds = enrollments.map(enrollment => enrollment.studentId);
    return Array.from(this.usersMap.values())
      .filter(user => studentIds.includes(user.id));
  }

  // Class operations
  async getClass(id: number): Promise<Class | undefined> {
    return this.classesMap.get(id);
  }

  async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    return Array.from(this.classesMap.values())
      .filter(cls => cls.teacherId === teacherId);
  }

  async createClass(cls: InsertClass): Promise<Class> {
    const id = this.nextClassId++;
    const timestamp = new Date();
    const newClass: Class = { ...cls, id, createdAt: timestamp };
    this.classesMap.set(id, newClass);
    return newClass;
  }

  // Class enrollment operations
  async enrollStudent(enrollment: InsertClassEnrollment): Promise<ClassEnrollment> {
    const id = this.nextEnrollmentId++;
    const timestamp = new Date();
    const newEnrollment: ClassEnrollment = { ...enrollment, id, createdAt: timestamp };
    this.enrollmentsMap.set(id, newEnrollment);
    return newEnrollment;
  }

  async getStudentsInClass(classId: number): Promise<User[]> {
    const studentIds = Array.from(this.enrollmentsMap.values())
      .filter(enrollment => enrollment.classId === classId)
      .map(enrollment => enrollment.studentId);
    
    return Array.from(this.usersMap.values())
      .filter(user => studentIds.includes(user.id) && user.role === 'student');
  }

  async getClassesForStudent(studentId: number): Promise<Class[]> {
    const classIds = Array.from(this.enrollmentsMap.values())
      .filter(enrollment => enrollment.studentId === studentId)
      .map(enrollment => enrollment.classId);
    
    return Array.from(this.classesMap.values())
      .filter(cls => classIds.includes(cls.id));
  }

  // Assignment operations
  async getAssignment(id: number): Promise<Assignment | undefined> {
    return this.assignmentsMap.get(id);
  }

  async getAssignmentsForClass(classId: number): Promise<Assignment[]> {
    return Array.from(this.assignmentsMap.values())
      .filter(assignment => assignment.classId === classId);
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const id = this.nextAssignmentId++;
    const timestamp = new Date();
    const newAssignment: Assignment = { ...assignment, id, createdAt: timestamp };
    this.assignmentsMap.set(id, newAssignment);
    return newAssignment;
  }

  async updateAssignment(id: number, assignment: Partial<Assignment>): Promise<Assignment | undefined> {
    const existingAssignment = this.assignmentsMap.get(id);
    if (!existingAssignment) return undefined;
    
    const updatedAssignment = { ...existingAssignment, ...assignment };
    this.assignmentsMap.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async getRecentAssignments(teacherId: number, limit: number = 5): Promise<AssignmentWithStats[]> {
    // Get classes taught by this teacher
    const teacherClasses = await this.getClassesByTeacher(teacherId);
    const teacherClassIds = teacherClasses.map(cls => cls.id);
    
    // Get assignments in those classes, sorted by creation date (newest first)
    const assignments = Array.from(this.assignmentsMap.values())
      .filter(assignment => teacherClassIds.includes(assignment.classId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    // Enhance with class name and submission counts
    return Promise.all(assignments.map(async assignment => {
      const cls = this.classesMap.get(assignment.classId);
      const students = await this.getStudentsInClass(assignment.classId);
      const submissions = Array.from(this.submissionsMap.values())
        .filter(sub => sub.assignmentId === assignment.id);
      
      return {
        ...assignment,
        className: cls?.name || "Unknown Class",
        submissionCount: submissions.length,
        totalStudents: students.length
      };
    }));
  }

  // Submission operations
  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissionsMap.get(id);
  }

  async getSubmissionsByAssignment(assignmentId: number): Promise<SubmissionWithDetails[]> {
    const submissions = Array.from(this.submissionsMap.values())
      .filter(submission => submission.assignmentId === assignmentId);
    
    return Promise.all(submissions.map(async submission => {
      const student = this.usersMap.get(submission.studentId);
      const assignment = this.assignmentsMap.get(submission.assignmentId);
      const feedback = await this.getFeedbackBySubmission(submission.id);
      
      return {
        ...submission,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown Student",
        assignmentTitle: assignment?.title || "Unknown Assignment",
        feedback
      };
    }));
  }

  async getSubmissionsByStudent(studentId: number): Promise<Submission[]> {
    return Array.from(this.submissionsMap.values())
      .filter(submission => submission.studentId === studentId);
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const id = this.nextSubmissionId++;
    const timestamp = new Date();
    const newSubmission: Submission = { ...submission, id, submittedAt: timestamp };
    this.submissionsMap.set(id, newSubmission);
    return newSubmission;
  }

  async updateSubmission(id: number, submission: Partial<Submission>): Promise<Submission | undefined> {
    const existingSubmission = this.submissionsMap.get(id);
    if (!existingSubmission) return undefined;
    
    const updatedSubmission = { ...existingSubmission, ...submission };
    this.submissionsMap.set(id, updatedSubmission);
    return updatedSubmission;
  }

  async getPendingReviews(teacherId: number): Promise<SubmissionWithDetails[]> {
    // Get classes taught by this teacher
    const teacherClasses = await this.getClassesByTeacher(teacherId);
    const teacherClassIds = teacherClasses.map(cls => cls.id);
    
    // Get assignments for those classes
    const assignments = Array.from(this.assignmentsMap.values())
      .filter(assignment => teacherClassIds.includes(assignment.classId));
    const assignmentIds = assignments.map(assignment => assignment.id);
    
    // Get AI-graded submissions for those assignments
    const pendingSubmissions = Array.from(this.submissionsMap.values())
      .filter(submission => 
        assignmentIds.includes(submission.assignmentId) && 
        submission.status === 'ai_graded'
      );
    
    // Enhance with student name, assignment title, and feedback
    return Promise.all(pendingSubmissions.map(async submission => {
      const student = this.usersMap.get(submission.studentId);
      const assignment = this.assignmentsMap.get(submission.assignmentId);
      const feedback = await this.getFeedbackBySubmission(submission.id);
      
      return {
        ...submission,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown Student",
        assignmentTitle: assignment?.title || "Unknown Assignment",
        feedback
      };
    }));
  }

  // Feedback operations
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedbacksMap.get(id);
  }

  async getFeedbackBySubmission(submissionId: number): Promise<Feedback | undefined> {
    return Array.from(this.feedbacksMap.values())
      .find(feedback => feedback.submissionId === submissionId);
  }

  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const id = this.nextFeedbackId++;
    const timestamp = new Date();
    const newFeedback: Feedback = { ...feedback, id, createdAt: timestamp, updatedAt: timestamp };
    this.feedbacksMap.set(id, newFeedback);
    return newFeedback;
  }

  async updateFeedback(id: number, feedback: Partial<Feedback>): Promise<Feedback | undefined> {
    const existingFeedback = this.feedbacksMap.get(id);
    if (!existingFeedback) return undefined;
    
    const updatedFeedback = { 
      ...existingFeedback, 
      ...feedback,
      updatedAt: new Date()
    };
    this.feedbacksMap.set(id, updatedFeedback);
    return updatedFeedback;
  }

  // Helper method to initialize some sample data
  private async initializeData() {
    // We'll add some initial data in the storage for testing
    // This would be replaced by real user-created data in production
  }
}

// Export a singleton instance
export const storage = new MemStorage();
