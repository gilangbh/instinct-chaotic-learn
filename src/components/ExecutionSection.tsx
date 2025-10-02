import { Code2, Megaphone, Users, Rocket } from "lucide-react";

const steps = [
  {
    icon: Code2,
    title: "Development",
    description: "MVP build, wallet connection, voting loop on Solana devnet"
  },
  {
    icon: Megaphone,
    title: "Social Media Outreach",
    description: "Campaigns on X, Discord, community forums"
  },
  {
    icon: Users,
    title: "Waitlist",
    description: "Beta sign-up system"
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "Onboard waitlist users, weekly cycles, feedback + iteration"
  }
];

const ExecutionSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl md:text-6xl font-black text-center mb-16">
          Execution <span className="text-gradient">Process</span>
        </h2>
        
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary" />
            
            {/* Timeline steps */}
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="relative flex items-start gap-6 group">
                  {/* Icon circle */}
                  <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-3xl font-bold mb-2">{step.title}</h3>
                    <p className="text-lg text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutionSection;
