import { useLocation, Link } from "wouter";

type MobileNavProps = {
  onMenuToggle?: () => void;
};

export default function MobileNav({ onMenuToggle }: MobileNavProps) {
  const [location] = useLocation();
  
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Link href="/">
              <a className="text-lg font-bold text-primary-600">GradeAssist AI</a>
            </Link>
          </div>
          <div>
            <button 
              type="button" 
              className="p-1 rounded-full text-gray-500 hover:text-gray-600"
              aria-label="Open notifications"
            >
              <i className="ri-notification-3-line text-xl"></i>
            </button>
            <button 
              type="button" 
              className="ml-3 p-1 rounded-full text-gray-500 hover:text-gray-600"
              onClick={onMenuToggle}
              aria-label="Open menu"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 w-full border-t border-gray-200 bg-white">
        <div className="flex justify-around">
          <Link href="/">
            <a className={`flex-1 flex flex-col items-center py-3 ${location === '/' 
              ? 'text-primary-600 border-t-2 border-primary-500' 
              : 'text-gray-500'}`}>
              <i className="ri-dashboard-line text-xl"></i>
              <span className="text-xs mt-1">Dashboard</span>
            </a>
          </Link>
          <Link href="/classes">
            <a className={`flex-1 flex flex-col items-center py-3 ${location === '/classes' 
              ? 'text-primary-600 border-t-2 border-primary-500' 
              : 'text-gray-500'}`}>
              <i className="ri-folders-line text-xl"></i>
              <span className="text-xs mt-1">Classes</span>
            </a>
          </Link>
          <Link href="/assignments">
            <a className={`flex-1 flex flex-col items-center py-3 ${location === '/assignments' 
              ? 'text-primary-600 border-t-2 border-primary-500' 
              : 'text-gray-500'}`}>
              <i className="ri-book-open-line text-xl"></i>
              <span className="text-xs mt-1">Assignments</span>
            </a>
          </Link>
          <Link href="/students">
            <a className={`flex-1 flex flex-col items-center py-3 ${location === '/students' 
              ? 'text-primary-600 border-t-2 border-primary-500' 
              : 'text-gray-500'}`}>
              <i className="ri-user-follow-line text-xl"></i>
              <span className="text-xs mt-1">Students</span>
            </a>
          </Link>
        </div>
      </div>
    </>
  );
}
