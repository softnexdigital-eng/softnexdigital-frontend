export type MetaEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export interface MetaPixelConfig {
  enabled: boolean;
  pixelId: string | null;
  serverTrackingEnabled: boolean;
}

export interface MetaEventItem {
  productId: string;
  quantity: number;
}

export interface MetaServerEventPayload {
  tenantSlug: string;
  eventName: Exclude<MetaEventName, "Purchase">;
  eventId: string;
  eventSourceUrl: string;
  consent: true;
  productId?: string;
  quantity?: number;
  items?: MetaEventItem[];
  fbp?: string;
  fbc?: string;
}

interface MetaPixelFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: MetaPixelFunction;
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

const initializedPixelIds = new Set<string>();

export function initializeMetaPixel(pixelId: string): void {
  if (typeof window === "undefined" || initializedPixelIds.has(pixelId)) return;

  if (!window.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }) as MetaPixelFunction;
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;

    if (!document.querySelector('script[data-meta-pixel="true"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.dataset.metaPixel = "true";
      document.head.appendChild(script);
    }
  }

  initializedPixelIds.add(pixelId);
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

export function trackMetaPixelEvent(
  pixelId: string,
  eventName: MetaEventName,
  parameters: Record<string, unknown>,
  eventId: string,
): void {
  if (typeof window === "undefined" || !initializedPixelIds.has(pixelId) || !window.fbq) return;
  window.fbq("track", eventName, parameters, metaPixelEventOptions(eventId));
}

export function shouldInitializeMetaPixel(
  config: MetaPixelConfig | null | undefined,
  consent: boolean,
): config is MetaPixelConfig {
  return Boolean(consent && config?.enabled && config.pixelId);
}

export function shouldSendMetaServerEvent(
  config: MetaPixelConfig | null | undefined,
  consent: boolean,
): boolean {
  return shouldInitializeMetaPixel(config, consent) && config.serverTrackingEnabled;
}

export function createMetaEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `meta_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function readMetaCookies(cookieHeader: string): { fbp?: string; fbc?: string } {
  const cookies = new Map(
    cookieHeader.split(";").map((cookie) => {
      const separator = cookie.indexOf("=");
      if (separator < 0) return [cookie.trim(), ""] as const;
      return [
        cookie.slice(0, separator).trim(),
        cookie.slice(separator + 1).trim(),
      ] as const;
    }),
  );
  const fbp = cookies.get("_fbp");
  const fbc = cookies.get("_fbc");
  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}

export function buildMetaServerEventPayload(input: {
  tenantSlug: string;
  eventName: Exclude<MetaEventName, "Purchase">;
  eventId: string;
  eventSourceUrl: string;
  items: MetaEventItem[];
  cookies?: { fbp?: string; fbc?: string };
}): MetaServerEventPayload {
  const payload: MetaServerEventPayload = {
    tenantSlug: input.tenantSlug,
    eventName: input.eventName,
    eventId: input.eventId,
    eventSourceUrl: input.eventSourceUrl,
    consent: true,
  };

  if (input.items.length === 1) {
    payload.productId = input.items[0].productId;
    payload.quantity = input.items[0].quantity;
  } else {
    payload.items = input.items.map(({ productId, quantity }) => ({
      productId,
      quantity,
    }));
  }
  if (input.cookies?.fbp) payload.fbp = input.cookies.fbp;
  if (input.cookies?.fbc) payload.fbc = input.cookies.fbc;

  return payload;
}

export function metaPixelEventOptions(eventId: string): { eventID: string } {
  return { eventID: eventId };
}
