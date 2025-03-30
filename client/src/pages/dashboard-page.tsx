import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { FileText, User, BarChart2, PieChart } from "lucide-react";
import StatCard from "@/components/dashboard/stats-card";
import AssignmentsTable from "@/components/dashboard/assignments-table";
import PendingReviewCard from "@/components/dashboard/pending-review-card";
import AnalyticsPreview from "@/components/dashboard/analytics-preview";
import CreateAssignmentModal from "@/components/assignments/create-assignment-modal";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Only fetch these queries if user is a teacher
  const isTeacher = user?.role === 'teacher';
  
  const { data: pendingReviews } = useQuery({
    queryKey: ['/api/submissions/pending'],
    enabled: isTeacher,
  });
  
  const { data: recentAssignments } = useQuery({
    queryKey: ['/api/assignments/recent'],
  });
  
  // Student specific queries
  const { data: studentStats } = useQuery({
    queryKey: ['/api/student/stats'],
    enabled: !isTeacher,
  });

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isTeacher ? "Teacher Dashboard" : "Student Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isTeacher 
              ? "Manage assignments, review submissions, and track student progress" 
              : "View assignments, submit work, and track your progress"}
          </p>
        </div>
        
        {isTeacher && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isTeacher ? (
          <>
            <StatCard 
              label="Pending Reviews" 
              value={pendingReviews?.length || 0}
              icon={<FileText className="text-xl" />}
              color="primary"
            />
            <StatCard 
              label="Active Students" 
              value={128}
              icon={<User className="text-xl" />}
              color="secondary"
            />
            <StatCard 
              label="Active Assignments" 
              value={recentAssignments?.length || 0}
              icon={<FileText className="text-xl" />}
              color="orange"
            />
            <StatCard 
              label="Avg. Grade" 
              value="85%"
              icon={<BarChart2 className="text-xl" />}
              color="green"
            />
          </>
        ) : (
          <>
            <StatCard 
              label="Pending Assignments" 
              value={studentStats?.pendingAssignments || 0}
              icon={<FileText className="text-xl" />}
              color="primary"
            />
            <StatCard 
              label="Completed Assignments" 
              value={studentStats?.completedAssignments || 0}
              icon={<FileText className="text-xl" />}
              color="green"
            />
            <StatCard 
              label="Your Average" 
              value={studentStats?.averageScore ? `${studentStats.averageScore}%` : "N/A"}
              icon={<BarChart2 className="text-xl" />}
              color="secondary"
            />
            <StatCard 
              label="Class Rank" 
              value={studentStats?.classRank || "N/A"}
              icon={<PieChart className="text-xl" />}
              color="orange"
            />
          </>
        )}
      </div>

      {/* Recent Assignments Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
          <Button variant="link" className="text-primary-600 hover:text-primary-700 p-0">
            View All
          </Button>
        </div>
        
        <AssignmentsTable />
      </div>

      {/* Pending Reviews & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reviews Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Reviews</h2>
            <Button variant="link" className="text-primary-600 hover:text-primary-700 p-0">
              View All
            </Button>
          </div>
          <PendingReviewCard />
        </div>

        {/* Analytics Preview Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Performance</h2>
            <Button variant="link" className="text-primary-600 hover:text-primary-700 p-0">
              View Analytics
            </Button>
          </div>
          <AnalyticsPreview />
        </div>
      </div>
      
      {/* Create Assignment Modal */}
      <CreateAssignmentModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
