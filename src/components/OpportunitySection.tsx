import { TrendingUp } from "lucide-react";

const OpportunitySection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <TrendingUp className="w-10 h-10 text-primary" />
          <h2 className="text-5xl md:text-6xl font-black">Market Opportunity</h2>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          Instinct.fi creates a new category of social-finance experimentation where communities 
          explore markets together, coordinate decisions, and learn from transparent outcomes.
        </p>
      </div>
    </section>
  );
};

export default OpportunitySection;
