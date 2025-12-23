import { HelpCircle } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FeatureStatusBadge } from "./FeatureStatusBadge";
import type { FAQItem as FAQItemType } from "@/data/faqData";

interface FAQItemProps {
  item: FAQItemType;
  index: number;
}

export const FAQItem = ({ item, index }: FAQItemProps) => {
  return (
    <AccordionItem
      value={`item-${index}`}
      className="border border-border rounded-lg bg-card overflow-hidden data-[state=open]:ring-2 data-[state=open]:ring-primary/20 transition-shadow"
    >
      <AccordionTrigger className="px-4 sm:px-6 hover:no-underline hover:bg-muted/50 transition-colors">
        <div className="flex items-start gap-3 text-left flex-1">
          <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <span className="font-semibold block leading-relaxed">{item.question}</span>
            {item.featureStatus && (
              <FeatureStatusBadge status={item.featureStatus} />
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 sm:px-6 pb-4 pl-12 sm:pl-14 text-muted-foreground leading-relaxed">
        {item.answer}
      </AccordionContent>
    </AccordionItem>
  );
};
