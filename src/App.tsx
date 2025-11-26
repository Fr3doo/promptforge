import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SkipLink } from "@/components/SkipLink";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Prompts from "./pages/Prompts";
import PromptEditor from "./pages/PromptEditor";
import Resources from "./pages/Resources";
import ResourceArticle from "./pages/ResourceArticle";
import FAQ from "./pages/FAQ";
import PromptingMethods from "./pages/PromptingMethods";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={300}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SkipLink />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/prompts/new" element={<PromptEditor />} />
          <Route path="/prompts/:id" element={<PromptEditor />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<ResourceArticle />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/methodes" element={<PromptingMethods />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
