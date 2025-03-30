import { Loader2 } from "lucide-react";

// This component would normally be connected to real analytics data
// For now we'll create a static version that matches the design
export default function AnalyticsPreview() {
  // Simulated data for the chart
  const gradeDistribution = [
    { grade: 'F', percentage: 10, color: 'bg-red-200' },
    { grade: 'D', percentage: 15, color: 'bg-orange-200' },
    { grade: 'C', percentage: 20, color: 'bg-yellow-200' },
    { grade: 'B', percentage: 35, color: 'bg-green-200' },
    { grade: 'A', percentage: 20, color: 'bg-primary-200' },
  ];

  // Simulated data for misconceptions
  const commonMisconceptions = [
    { issue: "Newton's Third Law application", percentage: 35, color: 'bg-red-500' },
    { issue: "Calculation of kinetic energy", percentage: 28, color: 'bg-orange-500' },
    { issue: "Understanding conservation of momentum", percentage: 20, color: 'bg-yellow-500' },
  ];

  return (
    <div className="bg-white shadow border border-gray-100 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Physics 101: Grade Distribution</h3>
        <div className="h-40 bg-gray-50 rounded p-2 flex items-end space-x-2">
          {gradeDistribution.map((item) => (
            <div 
              key={item.grade}
              className={`flex-1 ${item.color} rounded-t`} 
              style={{ height: `${item.percentage}%` }}
              title={`${item.grade}: ${item.percentage}%`}
            ></div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Common Misconceptions</h3>
        <ul className="space-y-2 text-sm">
          {commonMisconceptions.map((item) => (
            <li key={item.issue} className="flex items-center">
              <span className={`w-1.5 h-1.5 ${item.color} rounded-full mr-2`}></span>
              <span className="text-gray-700">{item.issue} ({item.percentage}% of students)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
