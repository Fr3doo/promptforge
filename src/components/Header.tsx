import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicNavigation, AuthenticatedNavigation } from "@/components/navigation";

export const Header = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-6 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return user ? <AuthenticatedNavigation /> : <PublicNavigation />;
};
