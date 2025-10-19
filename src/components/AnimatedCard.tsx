import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ComponentProps } from "react";

interface AnimatedCardProps extends ComponentProps<typeof Card> {
  delay?: number;
}

export function AnimatedCard({ children, delay = 0, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  );
}
