import { getSettings } from './appStore';

/**
 * Handles professional, direct WhatsApp opening logic.
 * Tries opening deep link on mobile devices with an 800ms fallback,
 * and launches WhatsApp Web on desktop.
 */
export function openWhatsAppChat(message: string) {
  const settings = getSettings();
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

    // Try deep link
    window.location.href = deepLink;

    // Wait 800ms, if window did not blur, fall back to web link
    setTimeout(() => {
      window.removeEventListener('blur', handleBlur);
      if (!windowBlurred) {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
    }, 800);
  } else {
    // Desktop: Open in new tab
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Generates a polite, clear starting message for tire products catalog inquiries.
 * Supports products with or without prices.
 */
export function getProductMessage(productName: string, measure: string, price?: number, priceStatus?: 'exibir' | 'sob_consulta'): string {
  const settings = getSettings();
  const siteName = settings.commercialName || 'Pneu Center Brasil';
  
  if (priceStatus === 'exibir' && price !== undefined) {
    const formattedPrice = price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `Olá, vim pelo site ${siteName} e gostaria de tirar dúvidas sobre o ${productName} no valor de R$ ${formattedPrice}. Quero consultar disponibilidade, entrega e condições de pagamento.`;
  }
  return `Olá, vim pelo site ${siteName} e gostaria de tirar dúvidas sobre o ${productName}. Quero consultar disponibilidade, entrega e condições de pagamento.`;
}

/**
 * Standard generic contact message.
 */
export const DEFAULT_WHATSAPP_MESSAGE = 
  'Olá, gostaria de falar com a equipe de atendimento da Pneu Center Brasil para consultar disponibilidade, tirar dúvidas sobre medidas de pneus e condições de entrega.';

