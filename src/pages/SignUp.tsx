import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";
import { usePasswordCheckRepository } from "@/contexts/PasswordCheckRepositoryContext";
import { toast } from "sonner";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import { authSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { safeRedirectPath } from "@/lib/urlSecurity";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { IconInput } from "@/components/ui/icon-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Label } from "@/components/ui/label";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { messages } from "@/constants/messages";
import { SECURITY } from "@/constants/application-config";

const SignUp = () => {
  const authRepository = useAuthRepository();
  const passwordCheckRepository = usePasswordCheckRepository();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [checkingStep, setCheckingStep] = useState<'strength' | 'breach' | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const redirectTo = searchParams.get("redirectTo");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password confirmation first
    if (password !== confirmPassword) {
      setConfirmPasswordError(messages.auth.passwordMismatch);
      toast.error(messages.auth.passwordMismatch);
      return;
    }
    setConfirmPasswordError(null);
    
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
          return;
        }
      } catch (checkError) {
        console.warn('[SignUp] Password breach check failed:', checkError);
        
        if (SECURITY.HIBP_FAILURE_MODE === 'fail-close') {
          toast.error(messages.errors.auth.passwordCheckUnavailable);
          setIsLoading(false);
          setIsCheckingPassword(false);
          setCheckingStep(null);
          return;
        } else {
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
      navigate(safeRedirectPath(redirectTo, "/dashboard"));
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
        <span className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 animate-pulse" />
          {stepMessage}
        </span>
      );
    }
    return messages.auth.signupButton;
  };

  return (
    <AuthLayout
      title={messages.auth.signupTitle}
      subtitle={messages.auth.signupSubtitle}
    >
      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pseudo" className="text-sm font-medium">
            {messages.labels.pseudo}
          </Label>
          <IconInput
            id="pseudo"
            type="text"
            placeholder={messages.placeholders.enterFullName}
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            icon={<User className="h-5 w-5" />}
            required
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {messages.labels.email}
          </Label>
          <IconInput
            id="email"
            type="email"
            placeholder={messages.placeholders.enterEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-5 w-5" />}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            {messages.labels.password}
          </Label>
          <IconInput
            id="password"
            type="password"
            placeholder={messages.placeholders.createPassword}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" />}
            required
            minLength={6}
            autoComplete="new-password"
          />
          {password.length > 0 && (
            <PasswordStrengthIndicator password={password} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            {messages.auth.confirmPassword}
          </Label>
          <IconInput
            id="confirmPassword"
            type="password"
            placeholder={messages.placeholders.confirmYourPassword}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmPasswordError) setConfirmPasswordError(null);
            }}
            icon={<Lock className="h-5 w-5" />}
            required
            minLength={6}
            autoComplete="new-password"
            className={confirmPasswordError ? "border-destructive" : ""}
          />
          {confirmPasswordError && (
            <p className="text-sm text-destructive">{confirmPasswordError}</p>
          )}
        </div>

        <GradientButton
          type="submit"
          isLoading={isLoading || isCheckingPassword}
        >
          {getButtonContent()}
        </GradientButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {messages.auth.alreadyHaveAccount}{" "}
          <Link
            to={redirectTo ? `/auth?redirectTo=${encodeURIComponent(redirectTo)}` : "/auth"}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {messages.auth.signIn}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
