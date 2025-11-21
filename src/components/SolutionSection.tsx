import { Lightbulb } from "lucide-react";

const SolutionSection = () => {
  return (
    <section className="py-24 relative bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-5xl md:text-7xl font-black mb-12 text-center text-gradient">
          Solution
        </h2>
        
        <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed border-l-4 border-primary pl-8">
          instinctfi.xyz reframes trading as a social roguelike. Users vote on trades, spin randomized 
          strategies, and face unpredictable outcomes in weekly 'runs,' making each cycle chaotic yet educational.
        </p>
      </div>
    </section>
  );
};

export default SolutionSection;
