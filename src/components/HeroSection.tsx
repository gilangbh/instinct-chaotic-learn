import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VortexLogo = () => (
  <svg width="64" height="64" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
    <defs>
      <linearGradient id="vortex-gradient-hero" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#5B8FF9', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    <path d="M512 512 Q 680 420, 760 380 Q 840 340, 860 260 Q 880 180, 820 120 Q 760 60, 680 80 Q 600 100, 560 180 Q 520 260, 540 340 Q 560 420, 620 460 Q 680 500, 512 512 Z" fill="url(#vortex-gradient-hero)"/>
    <path d="M512 512 Q 420 680, 380 760 Q 340 840, 260 860 Q 180 880, 120 820 Q 60 760, 80 680 Q 100 600, 180 560 Q 260 520, 340 540 Q 420 560, 460 620 Q 500 680, 512 512 Z" fill="url(#vortex-gradient-hero)"/>
    <path d="M512 512 Q 344 604, 264 644 Q 184 684, 164 764 Q 144 844, 204 904 Q 264 964, 344 944 Q 424 924, 464 844 Q 504 764, 484 684 Q 464 604, 404 564 Q 344 524, 512 512 Z" fill="url(#vortex-gradient-hero)"/>
    <path d="M512 512 Q 604 344, 644 264 Q 684 184, 764 164 Q 844 144, 904 204 Q 964 264, 944 344 Q 924 424, 844 464 Q 764 504, 684 484 Q 604 464, 564 404 Q 524 344, 512 512 Z" fill="url(#vortex-gradient-hero)"/>
    
    <circle cx="512" cy="512" r="120" fill="white"/>
    <circle cx="512" cy="512" r="80" fill="url(#vortex-gradient-hero)"/>
  </svg>
);

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
          <VortexLogo />
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
