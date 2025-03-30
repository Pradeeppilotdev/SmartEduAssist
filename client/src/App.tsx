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

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
      <GeminiChatbotWrapper />
    </AuthProvider>
  );
}

// Wrapper that only shows the chatbot for authenticated users
function GeminiChatbotWrapper() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
  return <GeminiChatbot />;
}

export default App;
