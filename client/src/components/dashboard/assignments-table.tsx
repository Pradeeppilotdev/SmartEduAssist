import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Assignment, AssignmentWithStats } from "@shared/schema";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

export default function AssignmentsTable() {
  const { data: assignments, isLoading, error } = useQuery<AssignmentWithStats[]>({
    queryKey: ['/api/assignments/recent'],
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
        Error loading assignments: {error.message}
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="bg-white shadow border border-gray-100 rounded-lg p-6">
        <p className="text-gray-500 text-center">No assignments found. Create your first assignment to get started!</p>
      </div>
    );
  }

  // Helper for displaying assignment status with appropriate color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            Open
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Closed
          </span>
        );
      case 'graded':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Graded
          </span>
        );
      case 'in_progress':
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        );
    }
  };

  // Helper for getting icon based on assignment type
  const getAssignmentIcon = (type: string) => {
    switch(type) {
      case 'multiple_choice':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded bg-green-100 flex items-center justify-center text-green-600">
            <i className="ri-questionnaire-line"></i>
          </div>
        );
      case 'short_answer':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded bg-purple-100 flex items-center justify-center text-purple-600">
            <i className="ri-edit-line"></i>
          </div>
        );
      case 'essay':
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
            <i className="ri-file-text-line"></i>
          </div>
        );
    }
  };

  return (
    <div className="bg-white shadow border border-gray-100 rounded-lg overflow-hidden">
      <div className="sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getAssignmentIcon(assignment.type)}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      <div className="text-sm text-gray-500">{assignment.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{assignment.className}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {assignment.submissionCount}/{assignment.totalStudents}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusDisplay(assignment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/assignments/${assignment.id}`}>
                    <a className="text-primary-600 hover:text-primary-900">
                      {assignment.status === 'graded' ? 'View Results' : 'Review'}
                    </a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
