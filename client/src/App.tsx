import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "@/pages/dashboard-page";
import AssignmentsPage from "@/pages/assignments-page";
import StudentsPage from "@/pages/students-page";
import AnalyticsPage from "@/pages/analytics-page";
import ReviewSubmissionPage from "@/pages/review-submission-page";
import AppLayout from "@/layouts/app-layout";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import GeminiChatbot from "@/components/chat/gemini-chatbot";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute path="/" component={() => (
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/assignments" component={() => (
        <AppLayout>
          <AssignmentsPage />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/students" component={() => (
        <AppLayout>
          <StudentsPage />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/analytics" component={() => (
        <AppLayout>
          <AnalyticsPage />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/submissions/:id" component={ReviewSubmissionPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

// Wrapper that only shows the chatbot for authenticated users
function GeminiChatbotWrapper() {
  // Wrap in try/catch to handle potential auth provider issues
  try {
    const { user } = useAuth();
    
    if (!user) {
      return null;
    }
    
    return <GeminiChatbot />;
  } catch (error) {
    console.error("Error in GeminiChatbotWrapper:", error);
    return null;
  }
}

function AppContent() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
      <GeminiChatbotWrapper />
    </AuthProvider>
  );
}

function App() {
  const [isMounted, setIsMounted] = useState(false);

  // This ensures we only render once client-side hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Avoid hydration issues by not rendering until client-side
  if (!isMounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
