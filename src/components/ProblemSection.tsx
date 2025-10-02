import { AlertCircle } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="py-24 relative bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-5xl md:text-7xl font-black mb-12 text-center text-gradient">
          Problem
        </h2>
        
        <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed border-l-4 border-secondary pl-8">
          Crypto trading is overwhelming for newcomers and frustrating for casual users. 
          People trade in isolation, follow hype, and rarely learn. Platforms focus on profit, 
          not education or collective learning.
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
