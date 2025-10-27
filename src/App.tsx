import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SolanaWalletProvider } from "@/contexts/WalletProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/PublicOnlyRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ActiveGame from "./pages/ActiveGame";
import Lobby from "./pages/Lobby";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import ApiTest from "./components/ApiTest";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SolanaWalletProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public Only Routes - Redirect to dashboard if logged in */}
            <Route 
              path="/" 
              element={
                <PublicOnlyRoute>
                  <Index />
                </PublicOnlyRoute>
              } 
            />
            
            {/* Protected Routes - Require authentication */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <ActiveGame />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lobby" 
              element={
                <ProtectedRoute>
                  <Lobby />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/results" 
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />
            
            {/* Test Route - Publicly accessible for development */}
            <Route path="/test" element={<ApiTest />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </SolanaWalletProvider>
  </QueryClientProvider>
);

export default App;
