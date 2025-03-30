import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SubmissionWithDetails } from "@shared/schema";

export default function ReviewSubmission() {
  const { id } = useParams<{ id: string }>();
  const submissionId = parseInt(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for teacher adjustments
  const [teacherScore, setTeacherScore] = useState<number | null>(null);
  const [teacherComments, setTeacherComments] = useState("");
  
  // Query submission data
  const { data: submission, isLoading, error } = useQuery<SubmissionWithDetails>({
    queryKey: [`/api/submissions/${submissionId}`],
  });
  
  // Mutation for saving teacher feedback
  const saveFeedbackMutation = useMutation({
    mutationFn: async () => {
      if (!submission?.feedback?.id) {
        throw new Error("Feedback ID not found");
      }
      
      await apiRequest("PUT", `/api/feedback/${submission.feedback.id}`, {
        teacherScore: teacherScore,
        teacherComments: teacherComments,
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback saved",
        description: "Your feedback has been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/submissions/${submissionId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/submissions/pending'] });
    },
    onError: (error) => {
      toast({
        title: "Error saving feedback",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle reset to AI grade
  const handleResetToAI = () => {
    if (submission?.feedback?.aiScore) {
      setTeacherScore(submission.feedback.aiScore);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherScore === null) {
      toast({
        title: "Score required",
        description: "Please provide a score before saving.",
        variant: "destructive"
      });
      return;
    }
    saveFeedbackMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !submission) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          Error loading submission: {error?.message || "Submission not found"}
        </div>
        <div className="mt-4">
          <Link href="/">
            <a className="text-primary-600 hover:underline">
              &larr; Back to Dashboard
            </a>
          </Link>
        </div>
      </div>
    );
  }
  
  // Initialize state with AI feedback if available and not already set
  if (submission.feedback?.aiScore && teacherScore === null) {
    setTeacherScore(submission.feedback.aiScore);
  }
  
  const feedback = submission.feedback || {
    aiScore: 0,
    aiComments: {
      strengths: [],
      improvements: [],
      comments: "No AI feedback available."
    },
    rubricScores: {}
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Submission</h1>
          <p className="mt-1 text-sm text-gray-500">
            {submission.assignmentTitle} - {submission.studentName}
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <i className="ri-arrow-left-line mr-1"></i> Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Student Submission Preview */}
        <div className="lg:col-span-3 bg-white shadow border border-gray-100 rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Student Submission</h3>
            <div>
              <button className="text-sm text-gray-500 hover:text-gray-700 mr-2">
                <i className="ri-download-line mr-1"></i> Download
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                <i className="ri-fullscreen-line mr-1"></i> Full Screen
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 h-[500px] overflow-y-auto">
            <div className="bg-white p-6 rounded-md shadow-sm whitespace-pre-wrap">
              {submission.content}
            </div>
          </div>
        </div>

        {/* AI Feedback and Grading */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Grade Summary */}
          <div className="bg-white shadow border border-gray-100 rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-medium text-gray-900">AI Grading Summary</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                  {feedback.aiScore}%
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Overall Score</h4>
                  <p className="text-sm text-gray-500">
                    AI graded on {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(feedback.rubricScores || {}).map(([criteria, score]) => (
                  <div key={criteria}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {criteria}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="bg-white shadow border border-gray-100 rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-medium text-gray-900">AI Feedback</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-3 py-2 bg-green-50">
                  <h4 className="text-sm font-semibold text-gray-900">Strengths</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 ml-2 mt-1">
                    {feedback.aiComments?.strengths?.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-50">
                  <h4 className="text-sm font-semibold text-gray-900">Areas for Improvement</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 ml-2 mt-1">
                    {feedback.aiComments?.improvements?.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50">
                  <h4 className="text-sm font-semibold text-gray-900">Additional Comments</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    {feedback.aiComments?.comments}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Adjustments */}
          <form onSubmit={handleSubmit} className="bg-white shadow border border-gray-100 rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-medium text-gray-900">Teacher Adjustment</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="adjusted-score" className="block text-sm font-medium text-gray-700">
                    Adjusted Score
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <Input
                      type="number"
                      id="adjusted-score"
                      value={teacherScore ?? ''}
                      min={0}
                      max={100}
                      onChange={(e) => setTeacherScore(parseInt(e.target.value))}
                      className="flex-1 block w-full rounded-l-md"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="teacher-feedback" className="block text-sm font-medium text-gray-700">
                    Additional Feedback
                  </label>
                  <Textarea
                    id="teacher-feedback"
                    value={teacherComments}
                    onChange={(e) => setTeacherComments(e.target.value)}
                    rows={4}
                    placeholder="Add your feedback here"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetToAI}
                    className="mr-2"
                    disabled={saveFeedbackMutation.isPending}
                  >
                    Reset to AI Grade
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveFeedbackMutation.isPending}
                  >
                    {saveFeedbackMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
