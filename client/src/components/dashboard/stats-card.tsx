import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: "primary" | "secondary" | "orange" | "green";
};

const colorStyles = {
  primary: {
    bg: "bg-primary-100",
    text: "text-primary-600"
  },
  secondary: {
    bg: "bg-secondary-100",
    text: "text-secondary-600"
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600"
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600"
  }
};

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  const { bg, text } = colorStyles[color];
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${bg} ${text}`}>
            {icon}
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
