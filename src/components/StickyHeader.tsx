import { Button } from "@/components/ui/button";

const StickyHeader = () => {
  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist');
    waitlistSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gradient">Instinct.fi</h2>
        <Button 
          onClick={scrollToWaitlist}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          Join the Waitlist
        </Button>
      </div>
    </header>
  );
};

export default StickyHeader;
