import { useState, useEffect } from 'react';

const SECTION_IDS = ['what-is', 'how-it-works', 'features'];

/**
 * Hook de scroll spy qui détecte la section active dans le viewport
 * Utilise IntersectionObserver pour des performances optimales
 */
export const useActiveSection = (): string | null => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibilityMap = new Map<string, number>();

    const updateActiveSection = () => {
      let maxVisibility = 0;
      let mostVisibleSection: string | null = null;

      visibilityMap.forEach((ratio, sectionId) => {
        if (ratio > maxVisibility) {
          maxVisibility = ratio;
          mostVisibleSection = sectionId;
        }
      });

      // Seuil minimum de visibilité (10%) pour considérer une section comme active
      if (maxVisibility > 0.1) {
        setActiveSection(mostVisibleSection);
      } else {
        setActiveSection(null);
      }
    };

    SECTION_IDS.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visibilityMap.set(sectionId, entry.intersectionRatio);
          });
          updateActiveSection();
        },
        {
          // Observer avec plusieurs seuils pour une détection précise
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
          // Offset négatif pour tenir compte de la navbar
          rootMargin: '-80px 0px -20% 0px'
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return activeSection;
};
