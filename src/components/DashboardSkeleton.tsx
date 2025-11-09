import { Skeleton } from "@/components/ui/skeleton";
import { messages } from "@/constants/messages";

/**
 * Skeleton de chargement pour la page Dashboard
 */
export const DashboardSkeleton = () => {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold">{messages.dashboard.title}</h1>
      </div>
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </main>
    </div>
  );
};
