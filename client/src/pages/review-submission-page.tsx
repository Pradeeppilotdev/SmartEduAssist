import ReviewSubmission from "@/components/assignments/review-submission";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function ReviewSubmissionPage() {
  const { user } = useAuth();
  
  // Only teachers can access this page
  if (user?.role !== 'teacher') {
    return <Redirect to="/" />;
  }
  
  return <ReviewSubmission />;
}
