import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "./LoginDialog";
import { LogIn } from "lucide-react";

const StickyHeader = () => {
  const { isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist');
    waitlistSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gradient">Instinct.fi</h2>
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Button 
                onClick={() => setShowLoginDialog(true)}
                variant="outline"
                className="font-semibold"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
            <Button 
              onClick={scrollToWaitlist}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Join the Waitlist
            </Button>
          </div>
        </div>
      </header>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  );
};

export default StickyHeader;
