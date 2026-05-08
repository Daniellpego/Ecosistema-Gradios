/**
 * Meta Pixel tracking utilities
 * Use these helpers to track events throughout the site
 */

declare global {
  interface Window {
    fbq?: (
      action: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Track standard Meta Pixel events
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  try {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", eventName, params);
    }
  } catch (error) {
    console.error("Meta Pixel tracking error:", error);
  }
}

/**
 * Track custom Meta Pixel events
 */
export function trackCustomEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  try {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", eventName, params);
    }
  } catch (error) {
    console.error("Meta Pixel custom event error:", error);
  }
}

/**
 * Track CTA clicks with source context
 */
export function trackCTAClick(
  ctaLocation: string,
  ctaText: string,
  destination: string
) {
  trackCustomEvent("CTAClick", {
    cta_location: ctaLocation,
    cta_text: ctaText,
    destination,
  });
}

/**
 * Track outbound link clicks
 */
export function trackOutboundLink(url: string, linkText: string) {
  trackCustomEvent("OutboundClick", {
    url,
    link_text: linkText,
  });
}

/**
 * Track WhatsApp clicks
 */
export function trackWhatsAppClick(source: string) {
  trackMetaEvent("Contact", {
    contact_method: "whatsapp",
    source,
  });
}

/**
 * Track form interactions
 */
export function trackFormStart(formName: string) {
  trackCustomEvent("FormStart", {
    form_name: formName,
  });
}

export function trackFormSubmit(formName: string, formData?: Record<string, unknown>) {
  trackMetaEvent("SubmitApplication", {
    form_name: formName,
    ...formData,
  });
}

/**
 * Track page sections viewed (scroll depth)
 */
export function trackSectionView(sectionName: string) {
  trackCustomEvent("SectionView", {
    section_name: sectionName,
  });
}

/**
 * Track video engagement
 */
export function trackVideoPlay(videoName: string) {
  trackCustomEvent("VideoPlay", {
    video_name: videoName,
  });
}

export function trackVideoComplete(videoName: string) {
  trackCustomEvent("VideoComplete", {
    video_name: videoName,
  });
}

/**
 * Track search on site
 */
export function trackSearch(searchTerm: string) {
  trackMetaEvent("Search", {
    search_string: searchTerm,
  });
}

/**
 * Track add to cart (if applicable for future e-commerce features)
 */
export function trackAddToCart(
  contentName: string,
  contentId: string,
  value: number,
  currency = "BRL"
) {
  trackMetaEvent("AddToCart", {
    content_name: contentName,
    content_ids: [contentId],
    value,
    currency,
  });
}

/**
 * Track purchase (if applicable)
 */
export function trackPurchase(
  value: number,
  currency = "BRL",
  contentIds: string[] = [],
  contentNames: string[] = []
) {
  trackMetaEvent("Purchase", {
    value,
    currency,
    content_ids: contentIds,
    contents: contentNames.map((name, i) => ({
      id: contentIds[i],
      name,
    })),
  });
}
