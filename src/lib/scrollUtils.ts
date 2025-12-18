// Hauteur de la navbar sticky (incluant padding et marge de sécurité)
export const NAVBAR_HEIGHT = 80;

/**
 * Scroll smooth vers une section avec offset pour la navbar sticky
 */
export const scrollToSection = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const offsetTop = element.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
};
