import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

type NavLinkProps = {
  href: string;
  icon: string;
  text: string;
  active?: boolean;
};

function NavLink({ href, icon, text, active }: NavLinkProps) {
  const baseClasses = "group flex items-center px-2 py-2 text-sm font-medium rounded-md";
  const activeClasses = "bg-primary-50 text-primary-600";
  const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  
  return (
    <Link href={href}>
      <a className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
        <i className={`${icon} mr-3 ${active ? 'text-primary-500' : 'text-gray-400'} text-lg group-hover:text-gray-500`}></i>
        {text}
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  if (!user) return null;
  
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <h1 className="text-xl font-bold text-primary-600">GradeAssist AI</h1>
        </div>
        
        <div className="flex-grow flex flex-col">
          {/* Teacher Profile Summary */}
          <div className="px-4 py-3 mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <span className="text-lg font-semibold">{initials}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{`${user.firstName} ${user.lastName}`}</p>
                <p className="text-xs text-gray-500">{user.department || (user.role === 'teacher' ? 'Teacher' : 'Student')}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="px-2 space-y-1">
            <NavLink 
              href="/" 
              icon="ri-dashboard-line" 
              text="Dashboard" 
              active={location === '/'} 
            />
            <NavLink 
              href="/assignments" 
              icon="ri-book-open-line" 
              text="Assignments" 
              active={location === '/assignments'} 
            />
            {user.role === 'teacher' && (
              <NavLink 
                href="/students" 
                icon="ri-user-follow-line" 
                text="Students" 
                active={location === '/students'} 
              />
            )}
            <NavLink 
              href="/analytics" 
              icon="ri-pie-chart-line" 
              text="Analytics" 
              active={location === '/analytics'} 
            />
          </nav>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200">
          <a 
            href="#" 
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            onClick={(e) => {
              e.preventDefault();
              logoutMutation.mutate();
            }}
          >
            <i className="ri-logout-box-line mr-3 text-gray-400 text-lg group-hover:text-gray-500"></i>
            Logout
          </a>
        </div>
      </div>
    </aside>
  );
}
