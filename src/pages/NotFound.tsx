import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { logWarn } from "@/lib/logger";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { messages } from "@/constants/messages";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logWarn("404 Error: User attempted to access non-existent route", { 
      pathname: location.pathname 
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-4">
        <PageBreadcrumb items={[{ label: messages.breadcrumb.notFound }]} />
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
          <p className="mb-6 text-xl text-muted-foreground">
            Oups ! Cette page n'existe pas
          </p>
          <a 
            href="/" 
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            Retourner à l'accueil
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
