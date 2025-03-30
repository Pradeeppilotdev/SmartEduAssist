import { useQuery } from "@tanstack/react-query";
import { SubmissionWithDetails } from "@shared/schema";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

export default function PendingReviewCard() {
  const { data: pendingReviews, isLoading, error } = useQuery<SubmissionWithDetails[]>({
    queryKey: ['/api/submissions/pending'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        Error loading pending reviews: {error.message}
      </div>
    );
  }

  if (!pendingReviews || pendingReviews.length === 0) {
    return (
      <div className="bg-white shadow border border-gray-100 rounded-lg p-6">
        <p className="text-gray-500 text-center">No submissions pending review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingReviews.map((review) => (
        <div key={review.id} className="bg-white shadow border border-gray-100 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{review.studentName}</h3>
              <p className="text-xs text-gray-500">{review.assignmentTitle}</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              AI Graded
            </span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center">
              <span className="font-medium text-sm text-gray-700">AI Score:</span>
              <span className="ml-2 font-semibold text-sm text-gray-900">
                {review.feedback?.aiScore ? `${review.feedback.aiScore}%` : 'Pending'}
              </span>
            </div>
            <div>
              <Link href={`/submissions/${review.id}`}>
                <a className="text-xs bg-primary-600 hover:bg-primary-700 text-white py-1 px-3 rounded-md">
                  Review
                </a>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
