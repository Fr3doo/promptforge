import { usePasswordStrength } from '@/hooks/usePasswordStrength';
import { Progress } from '@/components/ui/progress';
import { Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { messages } from '@/constants/messages';

interface PasswordStrengthIndicatorProps {
  password: string;
  showCriteria?: boolean;
  className?: string;
}

/**
 * Indicateur visuel de force du mot de passe
 * Affiche une barre de progression colorée et une checklist de critères
 */
export function PasswordStrengthIndicator({
  password,
  showCriteria = true,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = usePasswordStrength(password);

  if (!password) return null;

  // Couleurs selon le niveau
  const getColorClasses = () => {
    switch (strength.level) {
      case 'weak':
        return {
          bar: 'bg-destructive',
          text: 'text-destructive',
        };
      case 'fair':
        return {
          bar: 'bg-orange-500',
          text: 'text-orange-500',
        };
      case 'good':
        return {
          bar: 'bg-yellow-500',
          text: 'text-yellow-500',
        };
      case 'strong':
        return {
          bar: 'bg-green-500',
          text: 'text-green-500',
        };
    }
  };

  const colors = getColorClasses();
  const strengthLabels = messages.strength;

  const criteriaItems = [
    {
      key: 'minLength',
      met: strength.criteria.hasMinLength,
      label: messages.feedback.addLength,
    },
    {
      key: 'strongLength',
      met: strength.criteria.hasStrongLength,
      label: messages.feedback.addMoreLength,
      isBonus: true,
    },
    {
      key: 'uppercase',
      met: strength.criteria.hasUppercase,
      label: messages.feedback.addUppercase,
    },
    {
      key: 'lowercase',
      met: strength.criteria.hasLowercase,
      label: messages.feedback.addLowercase,
    },
    {
      key: 'number',
      met: strength.criteria.hasNumber,
      label: messages.feedback.addNumber,
    },
    {
      key: 'special',
      met: strength.criteria.hasSpecial,
      label: messages.feedback.addSpecial,
    },
    {
      key: 'common',
      met: strength.criteria.hasNoCommonPattern,
      label: messages.feedback.avoidCommon,
      isWarning: true,
    },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Barre de progression + Label */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{strengthLabels.title}</span>
          <span className={cn('font-medium', colors.text)}>
            {strengthLabels[strength.level]}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              colors.bar
            )}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      {/* Checklist des critères */}
      {showCriteria && (
        <ul className="grid gap-1 text-xs">
          {criteriaItems.map((item) => (
            <li
              key={item.key}
              className={cn(
                'flex items-center gap-2 transition-colors',
                item.met ? 'text-muted-foreground' : 'text-foreground'
              )}
            >
              {item.met ? (
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
              ) : item.isWarning && !item.met ? (
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-destructive shrink-0" />
              )}
              <span className={cn(item.met && 'line-through opacity-60')}>
                {item.label}
                {item.isBonus && !item.met && (
                  <span className="ml-1 text-muted-foreground">(bonus)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
