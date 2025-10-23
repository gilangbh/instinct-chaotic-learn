import { TrendingUp } from "lucide-react";

const OpportunitySection = () => {
  return (
    <section className="py-24 relative bg-gradient-to-b from-secondary/5 to-primary/5">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-5xl md:text-7xl font-black mb-12 text-center text-gradient">
          Market Opportunity
        </h2>
        
        <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed border-l-4 border-primary pl-8">
          Instinct.fi creates a new category of social-finance experimentation where communities 
          explore markets together, coordinate decisions, and learn from transparent outcomes.
        </p>
      </div>
    </section>
  );
};

export default OpportunitySection;
