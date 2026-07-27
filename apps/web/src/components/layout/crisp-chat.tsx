'use client';

import Script from 'next/script';
import { useEffect } from 'react';

import {
  configureCrispChatbox,
  CRISP_WEBSITE_ID,
  isCrispEnabled,
} from '@/lib/crisp';

export function CrispChat() {
  useEffect(() => {
    if (!isCrispEnabled()) {
      return;
    }

    configureCrispChatbox();
    window.$crisp?.push(['on', 'session:loaded', configureCrispChatbox]);
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
