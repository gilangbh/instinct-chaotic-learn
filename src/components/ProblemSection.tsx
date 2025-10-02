import { AlertCircle } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <h2 className="text-5xl md:text-6xl font-black">Problem</h2>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          Crypto trading is overwhelming for newcomers and frustrating for casual users. 
          People trade in isolation, follow hype, and rarely learn. Platforms focus on profit, 
          not education or collective learning.
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
