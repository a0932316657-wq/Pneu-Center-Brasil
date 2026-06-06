import { getSettings } from './appStore';

/**
 * Handles professional, direct WhatsApp opening logic.
 * Tries opening deep link on mobile devices with an 1000ms fallback,
 * and launches WhatsApp Web on desktop.
 */
export function openWhatsAppChat(message: string) {
  const settings = getSettings();
  // Using the requested number 5511995946993, falling back to database setting if customized
  const phone = settings.whatsappRaw || '5511995946993';
  const encodedText = encodeURIComponent(message);
  const deepLink = `whatsapp://send?phone=${phone}&text=${encodedText}`;
  const webUrl = `https://wa.me/${phone}?text=${encodedText}`;

  // Check if mobile device
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );

  if (isMobile) {
    let windowBlurred = false;

    // Listener to check if the browser window lost focus (indicating the app opened)
    const handleBlur = () => {
      windowBlurred = true;
    };

    window.addEventListener('blur', handleBlur);

    // Try deep link directly for native application
    window.location.href = deepLink;

    // Wait 1000ms, if window did not blur (app didn't launch), fall back to HTTPS wa.me
    setTimeout(() => {
      window.removeEventListener('blur', handleBlur);
      if (!windowBlurred) {
        window.location.href = webUrl;
      }
    }, 1000);
  } else {
    // Desktop: Open in new window/tab
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Generates a polite, clear starting message for tire products catalog inquiries.
 * Matches exactly the user's requested template:
 * Olá, vim pelo site Pneu Center Brasil e gostaria de tirar dúvidas sobre o [NOME DO PRODUTO]. Medida: [MEDIDA]. Quero saber mais sobre entrega e condições comerciais.
 */
export function getProductMessage(productName: string, measure: string): string {
  return `Olá, vim pelo site Pneu Center Brasil e gostaria de tirar dúvidas sobre o ${productName}. Medida: ${measure}. Quero saber mais sobre entrega e condições comerciais.`;
}

/**
 * Standard generic contact message.
 */
export const DEFAULT_WHATSAPP_MESSAGE = 
  'Olá, vim pelo site Pneu Center Brasil e gostaria de tirar dúvidas sobre pneus. Quero saber mais sobre entrega e condições comerciais.';

