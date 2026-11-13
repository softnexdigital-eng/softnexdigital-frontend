import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMetaServerEventPayload,
  createMetaEventId,
  metaPixelEventOptions,
  readMetaCookies,
  shouldInitializeMetaPixel,
  shouldSendMetaServerEvent,
} from "../lib/metaTracking.ts";

test("disabled config and missing consent block browser and server tracking", () => {
  const enabledConfig = {
    enabled: true,
    pixelId: "123456789",
    serverTrackingEnabled: true,
  };

  assert.equal(shouldInitializeMetaPixel(enabledConfig, false), false);
  assert.equal(shouldSendMetaServerEvent(enabledConfig, false), false);
  assert.equal(shouldInitializeMetaPixel({ ...enabledConfig, enabled: false }, true), false);
  assert.equal(shouldSendMetaServerEvent({ ...enabledConfig, enabled: false }, true), false);
});

test("pixel and server event options use the same event ID", () => {
  const eventId = createMetaEventId();
  const serverPayload = buildMetaServerEventPayload({
    tenantSlug: "published-store",
    eventName: "AddToCart",
    eventId,
    eventSourceUrl: "https://shop.example/products/item",
    items: [{ productId: "product-1", quantity: 1 }],
  });

  assert.ok(eventId.length > 0 && eventId.length <= 100);
  assert.notEqual(createMetaEventId(), eventId);
  assert.deepEqual(metaPixelEventOptions(eventId), { eventID: eventId });
  assert.equal(serverPayload.eventId, eventId);
});

test("single product payload carries contract IDs, quantity, URL, consent, and cookies", () => {
  const payload = buildMetaServerEventPayload({
    tenantSlug: "published-store",
    eventName: "ViewContent",
    eventId: "event-1",
    eventSourceUrl: "https://shop.example/products/item",
    items: [{ productId: "product-1", quantity: 2 }],
    cookies: { fbp: "fb.1.123", fbc: "fb.2.456" },
  });

  assert.deepEqual(payload, {
    tenantSlug: "published-store",
    eventName: "ViewContent",
    eventId: "event-1",
    eventSourceUrl: "https://shop.example/products/item",
    consent: true,
    productId: "product-1",
    quantity: 2,
    fbp: "fb.1.123",
    fbc: "fb.2.456",
  });
});

test("multi-product payload sends only product IDs and quantities", () => {
  const payload = buildMetaServerEventPayload({
    tenantSlug: "published-store",
    eventName: "InitiateCheckout",
    eventId: "event-2",
    eventSourceUrl: "https://shop.example/checkout",
    items: [
      { productId: "product-1", quantity: 1 },
      { productId: "product-2", quantity: 3 },
    ],
  });

  assert.deepEqual(payload.items, [
    { productId: "product-1", quantity: 1 },
    { productId: "product-2", quantity: 3 },
  ]);
  assert.equal("price" in payload, false);
  assert.equal("currency" in payload, false);
  assert.equal("fbp" in payload, false);
});

test("server tracking requires the backend to report it is configured", () => {
  const config = { enabled: true, pixelId: "123456789", serverTrackingEnabled: false };

  assert.equal(shouldInitializeMetaPixel(config, true), true);
  assert.equal(shouldSendMetaServerEvent(config, true), false);
});

test("Meta cookies are read by exact cookie name", () => {
  assert.deepEqual(readMetaCookies("other=1; _fbp=fb.1.123; _fbc=fb.2.456"), {
    fbp: "fb.1.123",
    fbc: "fb.2.456",
  });
  assert.deepEqual(readMetaCookies("other=1"), {});
});
