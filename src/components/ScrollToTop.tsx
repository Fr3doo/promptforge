import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '@/lib/scrollUtils';

/**
 * Composant qui gère le scroll automatique lors des changements de route :
 * - Sans hash : scroll en haut de page
 * - Avec hash : scroll vers la section correspondante
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Hash présent : scroll vers la section après un délai pour laisser le DOM se charger
      const sectionId = hash.replace('#', '');
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      // Pas de hash : scroll en haut de page
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
};
