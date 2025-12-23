import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { authSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { IconInput } from "@/components/ui/icon-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Label } from "@/components/ui/label";
import { messages } from "@/constants/messages";

const Auth = () => {
  const authRepository = useAuthRepository();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = authSchema.parse({
        email,
        password,
      });

      await authRepository.signIn(
        validatedData.email,
        validatedData.password
      );
      
      toast.success(messages.auth.loginSuccess);
      navigate("/dashboard");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={messages.auth.loginTitle}
      subtitle={messages.auth.loginSubtitle}
    >
      <form onSubmit={handleAuth} className="space-y-5">
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
            placeholder={messages.placeholders.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" />}
            required
            minLength={6}
            autoComplete="current-password"
          />
        </div>

        <GradientButton
          type="submit"
          isLoading={isLoading}
          loadingText={messages.auth.loginButton}
        >
          {messages.auth.loginButton}
        </GradientButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {messages.auth.noAccount}{" "}
          <Link
            to="/signup"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {messages.auth.createAccount}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Auth;
