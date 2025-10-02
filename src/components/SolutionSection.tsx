import { Lightbulb } from "lucide-react";

const SolutionSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Lightbulb className="w-10 h-10 text-secondary" />
          <h2 className="text-5xl md:text-6xl font-black">Solution</h2>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          Instinct.fi reframes trading as a social roguelike. Users vote on trades, spin randomized 
          strategies, and face unpredictable outcomes in weekly 'runs,' making each cycle chaotic yet educational.
        </p>
      </div>
    </section>
  );
};

export default SolutionSection;
