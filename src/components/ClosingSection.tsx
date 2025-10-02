import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const ClosingSection = () => {
  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist');
    waitlistSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="waitlist" className="py-24 relative">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <Heart className="w-16 h-16 text-primary mx-auto mb-8 animate-pulse" />
        
        <h2 className="text-5xl md:text-7xl font-black mb-8">
          Thank you
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12">
          Built in collaboration with <span className="text-gradient font-bold">Superteam Indonesia</span>
        </p>
        
        <Button 
          onClick={scrollToWaitlist}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-lg px-12 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Join the Waitlist
        </Button>
      </div>
      
      {/* Footer */}
      <div className="mt-24 text-center text-muted-foreground text-sm">
        <p>© 2025 Instinct.fi. All rights reserved.</p>
      </div>
    </section>
  );
};

export default ClosingSection;
