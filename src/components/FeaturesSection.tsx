import { Users, Gamepad2, Zap, GraduationCap, Brain, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Community Trading Cycles",
    description: "Users collaborate through votes. Every week feels like a new 'run'"
  },
  {
    icon: Gamepad2,
    title: "Gamified Progression",
    description: "XP, streaks, and levels for active participants. Keeps people engaged and learning"
  },
  {
    icon: Zap,
    title: "Chaos-as-a-Feature",
    description: "Randomized strategies and unpredictable outcomes. Embraces volatility as part of the experience"
  },
  {
    icon: GraduationCap,
    title: "Collective Learning",
    description: "Transparent results, leaderboards, and shared insights. Turns market chaos into group education"
  },
  {
    icon: Brain,
    title: "Behavioral Insights",
    description: "Observe crowd psychology in action. Generates data on decision-making under uncertainty"
  },
  {
    icon: Rocket,
    title: "Beyond Trading",
    description: "A model for coordination, governance, and DAOs. Experiment with decision-making at scale"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl md:text-7xl font-black text-center mb-16 text-gradient">
          Core Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-card border-2 border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
            >
              <CardHeader>
                <feature.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl font-bold group-hover:text-gradient transition-all">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
