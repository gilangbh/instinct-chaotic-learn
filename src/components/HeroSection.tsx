import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const HeroSection = () => {
  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist');
    waitlistSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <Sparkles className="w-16 h-16 text-primary animate-pulse" />
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black mb-6 glow-cyan">
          Instinct.fi
        </h1>
        
        <p className="text-2xl md:text-4xl font-semibold mb-12 text-muted-foreground max-w-4xl mx-auto">
          An intentionally chaotic social trading experiment
        </p>
        
        <Button 
          onClick={scrollToWaitlist}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-lg px-12 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Join the Waitlist
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
