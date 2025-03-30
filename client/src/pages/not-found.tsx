import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, LogIn, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [isClient, setIsClient] = useState(false);
  
  // Prevents hydration errors on initial render
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get the current environment
  const isProduction = process.env.NODE_ENV === 'production' || 
    (isClient && window.location.hostname.includes('vercel.app'));
  
  if (!isClient) {
    return (
      <div className="error-page">
        <Loader2 className="loading-spinner" />
        <p className="mt-4">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-lg border-primary/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 mb-6 text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/">
              <Button className="w-full flex gap-2 items-center">
                <Home size={16} />
                <span>Go to Dashboard</span>
              </Button>
            </Link>
            
            <Link href="/auth">
              <Button variant="outline" className="w-full flex gap-2 items-center">
                <LogIn size={16} />
                <span>Log In</span>
              </Button>
            </Link>
          </div>
          
          {isProduction && (
            <div className="mt-8 text-center text-xs text-gray-400">
              <p>GradeAssist AI • Running on Vercel</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
