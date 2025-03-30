import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PlusCircle, Loader2, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Assignment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import CreateAssignmentModal from "@/components/assignments/create-assignment-modal";
import { format } from "date-fns";

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  // Helper for displaying status badge with appropriate color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Open</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Closed</Badge>;
      case 'graded':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Graded</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
    }
  };

  // Helper for getting icon based on assignment type
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'multiple_choice':
        return <div className="flex-shrink-0 h-12 w-12 rounded bg-green-100 flex items-center justify-center text-green-600">
          <i className="ri-questionnaire-line text-xl"></i>
        </div>;
      case 'short_answer':
        return <div className="flex-shrink-0 h-12 w-12 rounded bg-purple-100 flex items-center justify-center text-purple-600">
          <i className="ri-edit-line text-xl"></i>
        </div>;
      case 'essay':
      default:
        return <div className="flex-shrink-0 h-12 w-12 rounded bg-blue-100 flex items-center justify-center text-blue-600">
          <i className="ri-file-text-line text-xl"></i>
        </div>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start">
          {getTypeIcon(assignment.type)}
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}</p>
              </div>
              {getStatusBadge(assignment.status)}
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{assignment.description}</p>
            <div className="mt-4 flex justify-end">
              <Link href={`/assignments/${assignment.id}`}>
                <a className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  {assignment.status === 'graded' ? 'View Results' : 'View Details'}
                </a>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: assignments, isLoading, error } = useQuery<Assignment[]>({
    queryKey: ['/api/assignments'],
  });

  const filteredAssignments = assignments?.filter(assignment => {
    // Filter by status
    if (filter !== "all" && assignment.status !== filter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !assignment.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Group assignments by status for the tabs
  const openAssignments = filteredAssignments?.filter(a => a.status === 'open') || [];
  const inProgressAssignments = filteredAssignments?.filter(a => a.status === 'in_progress') || [];
  const gradedAssignments = filteredAssignments?.filter(a => a.status === 'graded') || [];
  const allAssignments = filteredAssignments || [];

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500">
            {isTeacher 
              ? "Create, manage, and review student assignments" 
              : "View and submit your assignments"}
          </p>
        </div>
        
        {isTeacher && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <i className="ri-search-line"></i>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select defaultValue="all" onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center text-red-500">
            <p>Failed to load assignments: {error.message}</p>
          </div>
        </Card>
      ) : filteredAssignments?.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery 
                ? "Try adjusting your search or filters" 
                : isTeacher 
                  ? "Create your first assignment to get started" 
                  : "You don't have any assignments yet"}
            </p>
            {isTeacher && (
              <div className="mt-6">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({allAssignments.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({openAssignments.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressAssignments.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {allAssignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="open" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {openAssignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="in_progress" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressAssignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="graded" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {gradedAssignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <CreateAssignmentModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
