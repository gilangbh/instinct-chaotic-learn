import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  
  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist');
    waitlistSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <img 
            src="/instinctfi spiky logo.png?v=2" 
            alt="InstinctFi Logo" 
            className="w-32 h-32 md:w-40 md:h-40"
          />
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black mb-6 glow-cyan">
          Instinct.fi
        </h1>
        
        <p className="text-2xl md:text-4xl font-semibold mb-12 text-muted-foreground max-w-4xl mx-auto">
          An intentionally chaotic social trading experiment
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-lg px-12 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            Try Demo
          </Button>
          
          <Button 
            onClick={scrollToWaitlist}
            size="lg"
            variant="outline"
            className="border-2 font-bold text-lg px-12 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Join the Waitlist
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
