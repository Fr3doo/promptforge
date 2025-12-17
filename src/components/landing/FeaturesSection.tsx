import { motion } from "framer-motion";
import { GitBranch, Variable, Users, BarChart3, Tag, Clock } from "lucide-react";
import { messages } from "@/constants/messages";

const features = [
  {
    icon: GitBranch,
    title: messages.marketing.features.versioning.title,
    description: messages.marketing.features.versioning.description,
  },
  {
    icon: Variable,
    title: messages.marketing.features.variables.title,
    description: messages.marketing.features.variables.description,
  },
  {
    icon: Users,
    title: messages.marketing.features.collaboration.title,
    description: messages.marketing.features.collaboration.description,
  },
  {
    icon: BarChart3,
    title: messages.marketing.features.analysis.title,
    description: messages.marketing.features.analysis.description,
  },
  {
    icon: Tag,
    title: "Tags intelligents",
    description: "Organisez vos prompts avec un système de tags flexible et intuitif.",
  },
  {
    icon: Clock,
    title: "Sauvegarde automatique",
    description: "Ne perdez jamais votre travail grâce à la sauvegarde automatique.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {messages.marketing.features.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {messages.marketing.features.subtitle}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
