import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BarChart2, PieChart, AreaChart, TrendingUp, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart as AreaChartComponent,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as BarChartComponent,
  Bar,
  Legend,
  PieChart as PieChartComponent,
  Pie,
  Cell,
} from "recharts";

// Sample data - in a real implementation, this would come from the API
const studentProgressData = [
  { date: "Week 1", avgScore: 72 },
  { date: "Week 2", avgScore: 75 },
  { date: "Week 3", avgScore: 78 },
  { date: "Week 4", avgScore: 74 },
  { date: "Week 5", avgScore: 80 },
  { date: "Week 6", avgScore: 83 },
  { date: "Week 7", avgScore: 86 },
  { date: "Week 8", avgScore: 85 },
];

const gradeDistributionData = [
  { name: "A (90-100%)", value: 20, color: "#3B82F6" },
  { name: "B (80-89%)", value: 35, color: "#10B981" },
  { name: "C (70-79%)", value: 25, color: "#FBBF24" },
  { name: "D (60-69%)", value: 15, color: "#F97316" },
  { name: "F (0-59%)", value: 5, color: "#EF4444" },
];

const misconceptionsData = [
  { topic: "Newton's Third Law", percentage: 35, color: "#EF4444" },
  { topic: "Kinetic Energy Calculation", percentage: 28, color: "#F97316" },
  { topic: "Conservation of Momentum", percentage: 20, color: "#FBBF24" },
  { topic: "Gravitational Force", percentage: 12, color: "#10B981" },
  { topic: "Circular Motion", percentage: 5, color: "#3B82F6" },
];

const assignmentComparisonData = [
  { name: "Lab Report 1", classAvg: 78, studentAvg: 82 },
  { name: "Quiz 1", classAvg: 75, studentAvg: 70 },
  { name: "Midterm", classAvg: 72, studentAvg: 85 },
  { name: "Lab Report 2", classAvg: 80, studentAvg: 78 },
  { name: "Quiz 2", classAvg: 82, studentAvg: 80 },
  { name: "Final Project", classAvg: 85, studentAvg: 88 },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [selectedTimeframe, setSelectedTimeframe] = useState("semester");

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/classes'],
  });

  // In a real implementation, you would fetch analytics data based on the selected class
  // const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
  //   queryKey: ['/api/analytics', selectedClass, selectedTimeframe],
  //   enabled: !!selectedClass,
  // });

  const isTeacher = user?.role === 'teacher';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">
            {isTeacher ? "Track student performance and identify learning gaps" : "View your progress and performance"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
            disabled={classesLoading}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="semester">Semester</SelectItem>
              <SelectItem value="year">Academic Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {!selectedClass ? (
        <Card className="p-12">
          <div className="text-center">
            <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Select a class to view analytics</h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose a class from the dropdown above to see performance data
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Class Average</p>
                    <h3 className="text-2xl font-bold text-gray-900">82%</h3>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+2.5%</span>
                  <span className="text-gray-500 ml-1">from previous {selectedTimeframe}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submission Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900">94%</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <i className="ri-file-list-3-line text-xl"></i>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+1.2%</span>
                  <span className="text-gray-500 ml-1">from previous {selectedTimeframe}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">At-Risk Students</p>
                    <h3 className="text-2xl font-bold text-gray-900">5</h3>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                    <i className="ri-user-warning-line text-xl"></i>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-red-500 mr-1 rotate-180" />
                  <span className="text-red-500 font-medium">+2</span>
                  <span className="text-gray-500 ml-1">from previous {selectedTimeframe}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Top Score</p>
                    <h3 className="text-2xl font-bold text-gray-900">98%</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <i className="ri-award-line text-xl"></i>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <span className="text-gray-500">Emma Thompson</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different analytics views */}
          <Tabs defaultValue="performance">
            <TabsList>
              <TabsTrigger value="performance">Performance Trends</TabsTrigger>
              <TabsTrigger value="distribution">Grade Distribution</TabsTrigger>
              <TabsTrigger value="misconceptions">Common Misconceptions</TabsTrigger>
              {!isTeacher && <TabsTrigger value="personal">Your Performance</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="performance" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class Performance Over Time</CardTitle>
                  <CardDescription>Average scores for all assignments in the selected timeframe</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChartComponent
                        data={studentProgressData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickLine={{ stroke: '#E5E7EB' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickLine={{ stroke: '#E5E7EB' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          domain={[0, 100]}
                          label={{ 
                            value: 'Score (%)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fill: '#6B7280', fontSize: 12 }
                          }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFF', 
                            border: '1px solid #E5E7EB',
                            borderRadius: '0.375rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="avgScore" 
                          name="Average Score" 
                          stroke="#3B82F6" 
                          fillOpacity={1} 
                          fill="url(#colorScore)" 
                        />
                      </AreaChartComponent>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="distribution" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                    <CardDescription>Overall class performance breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChartComponent
                          data={gradeDistributionData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            axisLine={{ stroke: '#E5E7EB' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            label={{ 
                              value: 'Students (%)', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fill: '#6B7280', fontSize: 12 }
                            }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#FFF', 
                              border: '1px solid #E5E7EB',
                              borderRadius: '0.375rem',
                              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${value}%`, 'Students']}
                          />
                          <Bar dataKey="value" name="Students">
                            {gradeDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChartComponent>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grade Breakdown</CardTitle>
                    <CardDescription>Percentage of students by grade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChartComponent>
                          <Pie
                            data={gradeDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.name}: ${entry.value}%`}
                            labelLine={false}
                          >
                            {gradeDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: '#FFF', 
                              border: '1px solid #E5E7EB',
                              borderRadius: '0.375rem',
                              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${value}%`, 'Students']}
                          />
                        </PieChartComponent>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {gradeDistributionData.map((item) => (
                        <div key={item.name} className="flex items-center">
                          <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                          <span className="text-sm text-gray-700">{item.name}: {item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="misconceptions" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Common Misconceptions</CardTitle>
                  <CardDescription>Topics where students commonly struggle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChartComponent
                        data={misconceptionsData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} />
                        <XAxis 
                          type="number"
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickLine={{ stroke: '#E5E7EB' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          label={{ 
                            value: 'Students (%)', 
                            position: 'insideBottom',
                            offset: -5,
                            style: { fill: '#6B7280', fontSize: 12 }
                          }}
                        />
                        <YAxis 
                          dataKey="topic" 
                          type="category"
                          width={100}
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickLine={{ stroke: '#E5E7EB' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFF', 
                            border: '1px solid #E5E7EB',
                            borderRadius: '0.375rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value) => [`${value}%`, 'Students']}
                        />
                        <Bar dataKey="percentage" name="Students">
                          {misconceptionsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChartComponent>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Recommended Actions:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 mt-0.5">
                          <i className="ri-focus-3-line text-xs"></i>
                        </div>
                        <div className="ml-2">
                          <p className="text-sm text-gray-700">Review Newton's Third Law with practical examples</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mt-0.5">
                          <i className="ri-focus-3-line text-xs"></i>
                        </div>
                        <div className="ml-2">
                          <p className="text-sm text-gray-700">Provide additional practice problems on kinetic energy calculations</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mt-0.5">
                          <i className="ri-focus-3-line text-xs"></i>
                        </div>
                        <div className="ml-2">
                          <p className="text-sm text-gray-700">Schedule a lab demonstration on conservation of momentum</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {!isTeacher && (
              <TabsContent value="personal" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Performance vs. Class Average</CardTitle>
                    <CardDescription>Comparison of your scores with the class average</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChartComponent
                          data={assignmentComparisonData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            axisLine={{ stroke: '#E5E7EB' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            domain={[0, 100]}
                            label={{ 
                              value: 'Score (%)', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fill: '#6B7280', fontSize: 12 }
                            }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#FFF', 
                              border: '1px solid #E5E7EB',
                              borderRadius: '0.375rem',
                              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${value}%`, '']}
                          />
                          <Legend />
                          <Bar dataKey="classAvg" name="Class Average" fill="#94A3B8" />
                          <Bar dataKey="studentAvg" name="Your Score" fill="#3B82F6" />
                        </BarChartComponent>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance Insights:</h4>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Great work on the Midterm!</span> You scored 13% higher than the class average. 
                          Continue to focus on quiz preparation, as Quiz 1 was slightly below average.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
}
