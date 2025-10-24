import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SolanaWalletProvider } from "@/contexts/WalletProvider";
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
            {/* Landing Page */}
            <Route path="/" element={<Index />} />
            
            {/* App Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/game" element={<ActiveGame />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/results" element={<Results />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            
            {/* Test Route */}
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
