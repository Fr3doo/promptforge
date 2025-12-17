import { motion } from "framer-motion";
import { PenLine, FolderOpen, Rocket } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "Créez",
    description: "Rédigez vos prompts avec des variables dynamiques comme {{nom}} ou {{contexte}}.",
  },
  {
    icon: FolderOpen,
    step: "02",
    title: "Organisez",
    description: "Classez vos prompts par tags, ajoutez-les en favoris et retrouvez-les facilement.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Optimisez",
    description: "Analysez la qualité de vos prompts et améliorez-les grâce aux suggestions.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trois étapes simples pour gérer vos prompts comme un professionnel.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="bg-card border border-border rounded-xl p-6 relative z-10 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-4xl font-bold text-primary/20">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
