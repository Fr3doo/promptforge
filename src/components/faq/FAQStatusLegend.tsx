import { FeatureStatusBadge } from "./FeatureStatusBadge";
import type { FeatureStatus } from "@/data/faqData";

const statuses: FeatureStatus[] = ["available", "partial", "coming-soon"];

export const FAQStatusLegend = () => {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border">
      <span className="font-medium">Légende :</span>
      {statuses.map(status => (
        <FeatureStatusBadge key={status} status={status} />
      ))}
    </div>
  );
};
