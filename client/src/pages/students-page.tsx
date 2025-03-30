import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, UserPlus, Search, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { User, Class } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";

export default function StudentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // Fetch classes taught by the teacher
  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: user?.role === 'teacher'
  });

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery<User[]>({
    queryKey: ['/api/classes', selectedClass, 'students'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!selectedClass,
  });

  // Fetch all students for enrollment
  const { data: allStudents = [], isLoading: allStudentsLoading } = useQuery<User[]>({
    queryKey: ['/api/users/students'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: isEnrollDialogOpen,
  });

  // Mutation for enrolling students
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass || !selectedStudent) return;
      
      await apiRequest("POST", `/api/classes/${selectedClass}/enroll`, {
        studentId: selectedStudent
      });
    },
    onSuccess: () => {
      toast({
        title: "Student enrolled",
        description: "The student has been successfully enrolled in the class."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/classes', selectedClass, 'students'] });
      setIsEnrollDialogOpen(false);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to enroll student",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Filter students by search query
  const filteredStudents = students?.filter(student => 
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredAllStudents = allStudents?.filter(student => 
    student.role === 'student' && 
    !students?.some(s => s.id === student.id) && 
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle enrollment
  const handleEnroll = () => {
    enrollMutation.mutate();
  };

  if (user?.role !== 'teacher') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Users className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Students Page</h2>
        <p className="text-gray-500 mt-2">
          This page is only accessible to teachers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-sm text-gray-500">
          Manage your students and track their progress
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Students by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="w-full md:w-64">
              <Select 
                value={selectedClass} 
                onValueChange={setSelectedClass}
                disabled={classesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: Class) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={!selectedClass}
                />
              </div>
              <Button 
                onClick={() => setIsEnrollDialogOpen(true)}
                disabled={!selectedClass}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll
              </Button>
            </div>
          </div>

          {!selectedClass ? (
            <div className="text-center py-12 bg-gray-50 rounded-md">
              <Users className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-4 text-gray-500">Select a class to view enrolled students</p>
            </div>
          ) : studentsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-md">
              <Users className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-4 text-gray-500">
                {searchQuery ? "No students match your search" : "No students enrolled in this class yet"}
              </p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => setIsEnrollDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll Students
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.department || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="link" size="sm" className="h-8 px-2">
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-sm text-gray-500">
            {selectedClass && students ? `Showing ${filteredStudents.length} of ${students.length} students` : ""}
          </div>
        </CardFooter>
      </Card>

      {/* Enroll Student Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>
              Add a student to this class.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {allStudentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredAllStudents.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <p className="text-gray-500">No students available for enrollment</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {filteredAllStudents.map((student) => (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer
                      ${selectedStudent === student.id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <span className="text-sm font-medium">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-500">{student.username}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`h-5 w-5 border rounded-full flex items-center justify-center
                        ${selectedStudent === student.id ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                        {selectedStudent === student.id && (
                          <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEnrollDialogOpen(false)}
              disabled={enrollMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEnroll} 
              disabled={!selectedStudent || enrollMutation.isPending}
            >
              {enrollMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : "Enroll Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
