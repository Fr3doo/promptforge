import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";
import { usePasswordCheckRepository } from "@/contexts/PasswordCheckRepositoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Code2, ShieldCheck } from "lucide-react";
import { authSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { messages } from "@/constants/messages";
import { SECURITY } from "@/constants/application-config";

const SignUp = () => {
  const authRepository = useAuthRepository();
  const passwordCheckRepository = usePasswordCheckRepository();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [checkingStep, setCheckingStep] = useState<'strength' | 'breach' | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Validation Zod (client)
      const validatedData = authSchema.parse({
        email,
        password,
        name: pseudo || undefined,
      });

      setIsCheckingPassword(true);

      // 2. Validation force du mot de passe (serveur)
      setCheckingStep('strength');
      try {
        const strengthResult = await passwordCheckRepository.validateStrength(validatedData.password);
        if (!strengthResult.isValid) {
          toast.error(messages.errors.auth.passwordTooWeak);
          // Afficher les feedbacks spécifiques
          strengthResult.feedback.forEach(feedbackKey => {
            const feedbackMessage = messages.feedback[feedbackKey as keyof typeof messages.feedback];
            if (feedbackMessage) {
              toast.info(feedbackMessage);
            }
          });
          setIsLoading(false);
          setIsCheckingPassword(false);
          setCheckingStep(null);
          return;
        }
      } catch (strengthError) {
        // Fail-open pour la validation de force (moins critique que HIBP)
        console.warn('[SignUp] Strength check failed, continuing:', strengthError);
      }

      // 3. Vérification HIBP (mot de passe compromis)
      setCheckingStep('breach');
      try {
        const { isBreached } = await passwordCheckRepository.checkBreach(validatedData.password);
        if (isBreached) {
          toast.error(messages.errors.auth.passwordBreached);
          setIsLoading(false);
          setIsCheckingPassword(false);
          setCheckingStep(null);
          return; // Stop signup
        }
      } catch (checkError) {
        // Mode fail-open ou fail-close selon configuration
        console.warn('[SignUp] Password breach check failed:', checkError);
        
        if (SECURITY.HIBP_FAILURE_MODE === 'fail-close') {
          toast.error(messages.errors.auth.passwordCheckUnavailable);
          setIsLoading(false);
          setIsCheckingPassword(false);
          setCheckingStep(null);
          return; // BLOQUER le signup
        } else {
          // Fail-open : continuer avec un warning
          toast.warning(messages.errors.auth.passwordCheckFailed);
        }
      } finally {
        setIsCheckingPassword(false);
        setCheckingStep(null);
      }

      // 4. Signup normal
      await authRepository.signUp(
        validatedData.email,
        validatedData.password,
        {
          pseudo: validatedData.name || undefined,
          emailRedirectTo: `${window.location.origin}/`,
        }
      );
      
      toast.success(messages.auth.signupSuccess);
      navigate("/dashboard");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsCheckingPassword(false);
      setCheckingStep(null);
    }
  };

  const getButtonContent = () => {
    if (isCheckingPassword) {
      const stepMessage = checkingStep === 'strength' 
        ? messages.security.checkingStrength 
        : messages.security.checkingPassword;
      return (
        <>
          <ShieldCheck className="mr-2 h-4 w-4 animate-pulse" />
          {stepMessage}
        </>
      );
    }
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {messages.auth.signupButton}
        </>
      );
    }
    return messages.auth.signupButton;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-4">
        <PageBreadcrumb items={[{ label: messages.breadcrumb.signup }]} />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {messages.auth.signupTitle}
            </CardTitle>
            <CardDescription className="text-center">
              {messages.auth.signupSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pseudo">{messages.labels.pseudo}</Label>
                <Input
                  id="pseudo"
                  type="text"
                  placeholder={messages.placeholders.pseudoPlaceholder}
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{messages.labels.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={messages.placeholders.emailExample}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{messages.labels.password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={messages.placeholders.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {getButtonContent()}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link
                to="/auth"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {messages.auth.alreadyHaveAccount} {messages.auth.signIn}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default SignUp;
