"use client";

import Script from "next/script";

function getPlausibleDomain() {
  return process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() ?? "";
}

function getPlausibleScriptSrc() {
  return (
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC?.trim() ||
    "https://plausible.io/js/script.js"
  );
}

export function PlausibleAnalytics() {
  const domain = getPlausibleDomain();
  const scriptSrc = getPlausibleScriptSrc();

  if (!domain) {
    return null;
  }

  return (
    <>
      <Script
        async
        data-domain={domain}
        src={scriptSrc}
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`
          window.plausible = window.plausible || function() {
            (window.plausible.q = window.plausible.q || []).push(arguments);
          };
          window.plausible.init = window.plausible.init || function(options) {
            window.plausible.o = options || {};
          };
          window.plausible.init();
        `}
      </Script>
    </>
  );
}
