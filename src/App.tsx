import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import HowToUse from "./pages/HowToUse";
import OnboardingWizard from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import NotificationHistory from "./pages/NotificationHistory";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("planos-user");
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  try {
    const parsed = JSON.parse(user);
    if (!parsed.loggedIn) return <Navigate to="/welcome" replace />;
  } catch {
    return <Navigate to="/welcome" replace />;
  }
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("planos-user");
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.loggedIn) return <Navigate to="/" replace />;
    } catch {}
  }
  return <>{children}</>;
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationHistory /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
