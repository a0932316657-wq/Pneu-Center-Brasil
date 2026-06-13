import { getSettings } from './appStore';

/**
 * Handles professional, direct WhatsApp opening logic.
 * Tries opening deep link on mobile devices with an 1000ms fallback,
 * and launches WhatsApp Web on desktop.
 */
export function openWhatsAppChat(message: string) {
  const settings = getSettings();
  // Using the requested number 551195796840, falling back to database setting if customized
  const phone = settings.whatsappRaw || '551195796840';
  const encodedText = encodeURIComponent(message);
  const webUrl = `https://wa.me/${phone}?text=${encodedText}`;

  // Push to GTM dataLayer to ensure 100% reliable tracking on other devices and browsers
  if (typeof window !== 'undefined') {
    // Initialize dataLayer if it doesn't exist
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // 1. Send simulated standard GTM linkClick event so generic wa.me triggers identify it perfectly
    (window as any).dataLayer.push({
      'event': 'gtm.linkClick',
      'gtm.elementUrl': webUrl,
      'gtm.element': document.activeElement || null,
      'gtm.elementClasses': 'whatsapp-btn shadow-teal',
      'gtm.elementId': 'whatsapp-action-btn',
      'click_url': webUrl,
      'clickUrl': webUrl
    });

    // 2. Also send a dedicated custom event for advanced and reliable tag tracking
    (window as any).dataLayer.push({
      'event': 'whatsapp_click',
      'whatsapp_phone': phone,
      'whatsapp_message': message,
      'destination_url': webUrl
    });
  }

  // Universal wa.me links are modern, fast and automatically switch to native app on iOS/Android
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );

  if (isMobile) {
    window.location.href = webUrl;
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
export function getProductMessage(
  productName: string,
  measure: string,
  price?: number,
  priceStatus?: string
): string {
  return `Olá, vim pelo site Pneu Center Brasil e gostaria de tirar dúvidas sobre o ${productName}. Medida: ${measure}. Quero saber mais sobre entrega e condições comerciais.`;
}

/**
 * Standard generic contact message.
 */
export const DEFAULT_WHATSAPP_MESSAGE = 
  'Olá, vim pelo site Pneu Center Brasil e gostaria de tirar dúvidas sobre pneus. Quero saber mais sobre entrega e condições comerciais.';

