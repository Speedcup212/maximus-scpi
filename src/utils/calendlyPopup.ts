declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
      closePopupWidget?: () => void;
    };
  }
}

const CALENDLY_SCRIPT_ID = 'maximus-calendly-widget-script';
const CALENDLY_CSS_ID = 'maximus-calendly-widget-css';
const CALENDLY_SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';
const CALENDLY_CSS_URL = 'https://assets.calendly.com/assets/external/widget.css';

function ensureCalendlyCss() {
  if (document.getElementById(CALENDLY_CSS_ID)) return;

  const link = document.createElement('link');
  link.id = CALENDLY_CSS_ID;
  link.rel = 'stylesheet';
  link.href = CALENDLY_CSS_URL;
  document.head.appendChild(link);
}

export function loadCalendlyWidget(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Calendly indisponible hors navigateur'));
  }

  if (window.Calendly?.initPopupWidget) {
    ensureCalendlyCss();
    return Promise.resolve();
  }

  ensureCalendlyCss();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(CALENDLY_SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Chargement Calendly impossible')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = CALENDLY_SCRIPT_ID;
    script.src = CALENDLY_SCRIPT_URL;
    script.async = true;
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Chargement Calendly impossible')), { once: true });
    document.head.appendChild(script);
  });
}

export async function openCalendlyPopup(url: string): Promise<void> {
  await loadCalendlyWidget();

  if (!window.Calendly?.initPopupWidget) {
    throw new Error('Widget Calendly indisponible');
  }

  window.Calendly.initPopupWidget({ url });
}
