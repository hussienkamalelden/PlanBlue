'use client';

import Script from 'next/script';
import { useEffect } from 'react';

import { CRISP_WEBSITE_ID, isCrispEnabled } from '@/lib/crisp';

/** Purple — distinct from WhatsApp green (#25D366) and cart blue (#4389F7). */
const CRISP_THEME_COLOR = '7642EC';

export function CrispChat() {
  useEffect(() => {
    if (!isCrispEnabled()) {
      return;
    }

    (window as any).$crisp = (window as any).$crisp ?? [];
    (window as any).$crisp.push(['config', 'color:theme', CRISP_THEME_COLOR]);
  }, []);

  if (!isCrispEnabled()) {
    return null;
  }

  return (
    <Script
      id="crisp-chat"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.$crisp=[];
          window.CRISP_WEBSITE_ID="${CRISP_WEBSITE_ID}";
          window.$crisp.push(["config", "color:theme", "${CRISP_THEME_COLOR}"]);
          (function(){
            var documentReference=document;
            var scriptElement=documentReference.createElement("script");
            scriptElement.src="https://client.crisp.chat/l.js";
            scriptElement.async=1;
            documentReference.getElementsByTagName("head")[0].appendChild(scriptElement);
          })();
        `,
      }}
    />
  );
}
