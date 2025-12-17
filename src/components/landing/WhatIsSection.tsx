import { motion } from "framer-motion";
import { Code2, Layers, Shield } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Centralisation",
    description: "Tous vos prompts IA réunis dans un seul espace organisé et accessible.",
  },
  {
    icon: Layers,
    title: "Versioning",
    description: "Gardez un historique complet de chaque modification de vos prompts.",
  },
  {
    icon: Shield,
    title: "Sécurité",
    description: "Vos prompts sont privés par défaut et partagés uniquement sur votre décision.",
  },
];

export const WhatIsSection = () => {
  return (
    <section id="what-is" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Qu'est-ce que PromptForge ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            PromptForge est votre outil de gestion de prompts IA professionnel. 
            Créez, organisez et optimisez vos prompts avec des variables dynamiques, 
            un système de versioning complet et des fonctionnalités de collaboration.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
