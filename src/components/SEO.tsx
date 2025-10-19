import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
}

export const SEO = ({ 
  title = "PromptForge - Gestion et optimisation de prompts IA",
  description = "Créez, versionnez, partagez vos prompts IA et mesurez leur efficacité. La bibliothèque de prompts professionnelle pour le prompt engineering.",
  keywords = "prompt engineering, bibliothèque prompts IA, gestion prompts, versioning prompts, templates IA, optimisation prompts, ChatGPT prompts, Claude prompts",
  canonicalUrl
}: SEOProps) => {
  const location = useLocation();

  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Meta description
    updateMetaTag('description', description);
    
    // Meta keywords
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', window.location.href, true);

    // Twitter tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);

    // Canonical URL
    const canonical = canonicalUrl || window.location.origin + location.pathname;
    let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.rel = 'canonical';
      document.head.appendChild(linkElement);
    }
    
    linkElement.href = canonical;
  }, [title, description, keywords, canonicalUrl, location]);

  return null;
};
