/// <reference types="vite/client" />

interface Window {
  gtag?: (...args: any[]) => void;
  openRdvModal?: () => void;
  Calendly?: {
    initPopupWidget: (options: { url: string }) => void;
  };
}
