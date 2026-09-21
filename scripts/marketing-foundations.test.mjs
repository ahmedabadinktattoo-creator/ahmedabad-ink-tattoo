import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const storage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
};
const consentKey = 'ait_tracking_consent_v1';
test('WhatsApp numbers include India prefix without corrupting explicit international numbers', () => {
  const { whatsappNumber } = loadModule('../src/lib/phone.ts', {});
  for (const value of ['8866848681', '08866848681', '+91 88668 48681', '00918866848681']) {
    assert.equal(whatsappNumber(value), '918866848681');
  }
  assert.equal(whatsappNumber('+44 7700 900123'), '447700900123');
  assert.equal(whatsappNumber('+1 202 555 0123'), '12025550123');
});
const attributionKey = 'ait_marketing_attribution_v1';
function loadModule(path, context, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { ...context, exports, require: (name) => dependencies[name] ?? require(name) });
  return exports;
}
function browser(consent = 'all', href = 'https://www.ahmedabadinktattoo.com/portfolio?utm_source=google&utm_medium=cpc&utm_campaign=tattoos&gclid=test-click') {
  const window = { location: { href }, localStorage: storage(), sessionStorage: storage() };
  if (consent) window.localStorage.setItem(consentKey, consent);
  const document = { referrer: '' };
  const attribution = loadModule('../src/lib/attribution.ts', { window, document, URL });
  return { window, document, attribution };
}

test('campaign and original landing page survive internal navigation', () => {
  const { window, attribution } = browser();
  const original = attribution.captureMarketingAttribution(true);
  window.location.href = 'https://www.ahmedabadinktattoo.com/book';
  assert.deepEqual(attribution.captureMarketingAttribution(true), original);
  assert.equal(original.landingPage, 'https://www.ahmedabadinktattoo.com/portfolio');
  assert.equal(original.gclid, 'test-click');
});

test('a new explicit campaign replaces the prior campaign', () => {
  const { window, attribution } = browser();
  attribution.captureMarketingAttribution(true);
  window.location.href = 'https://www.ahmedabadinktattoo.com/book?utm_source=instagram&utm_medium=paid_social&utm_campaign=portraits';
  const next = attribution.captureMarketingAttribution(true);
  assert.equal(next.source, 'instagram');
  assert.equal(next.campaign, 'portraits');
  assert.equal(next.gclid, '');
});

test('no optional consent means no attribution storage or click IDs', () => {
  const { window, attribution } = browser('essential');
  window.localStorage.setItem(attributionKey, '{"gclid":"old"}');
  assert.equal(attribution.captureMarketingAttribution(false).gclid, '');
  assert.equal(window.localStorage.getItem(attributionKey), null);
  assert.equal(window.sessionStorage.getItem(attributionKey), null);
});

test('analytics-only consent strips previously saved advertising identifiers', () => {
  const { window, attribution } = browser();
  attribution.captureMarketingAttribution(true);
  window.localStorage.setItem(consentKey, 'analytics');
  const next = attribution.captureMarketingAttribution(false);
  assert.equal(next.gclid, '');
  assert.equal(JSON.parse(window.sessionStorage.getItem(attributionKey)).gclid, '');
});

test('Facebook click IDs alone do not claim paid traffic', () => {
  const { attribution } = browser('all', 'https://www.ahmedabadinktattoo.com/?fbclid=example');
  assert.equal(attribution.captureMarketingAttribution(true).medium, 'social');
});

test('internal referrers do not become acquisition sources', () => {
  const { attribution, document } = browser('all', 'https://www.ahmedabadinktattoo.com/book');
  document.referrer = 'https://ahmedabadinktattoo.com/portfolio';
  assert.equal(attribution.captureMarketingAttribution(true).source, 'direct');
});

test('tracking helpers respect consent even if scripts remain loaded', () => {
  const { window, attribution } = browser('essential');
  const analytics = [], meta = [];
  window.gtag = (...args) => analytics.push(args);
  window.fbq = (...args) => meta.push(args);
  const tracking = loadModule('../src/lib/tracking.ts', { window }, { './attribution': attribution });
  tracking.trackEnquiryLead('AIT-TEST', 'same-event-id');
  assert.equal(analytics.length, 0);
  assert.equal(meta.length, 0);
  window.localStorage.setItem(consentKey, 'analytics');
  tracking.trackEnquiryLead('AIT-TEST', 'same-event-id');
  assert.equal(analytics[0][1], 'generate_lead');
  assert.equal(meta.length, 0);
  window.localStorage.setItem(consentKey, 'all');
  tracking.trackEnquiryLead('AIT-TEST', 'same-event-id');
  assert.equal(meta[0][3].eventID, 'same-event-id');
});

test('CRM retries preserve owner, stages, notes and all existing cells', () => {
  let writes = 0;
  let ids = [['AIT-TEST']];
  let written;
  const sheet = { getRange: () => ({ getDisplayValues: () => ids, setValues: (rows) => { writes++; written = rows[0]; } }) };
  const context = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: (name) => name === 'CRM_WEBHOOK_SECRET' ? 'test-secret' : 'test-sheet' }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }) },
    console,
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(new URL('../google-apps-script/marketing-crm-webhook.gs', import.meta.url), 'utf8'), context);
  const request = { postData: { contents: JSON.stringify({ secret: 'test-secret', operation: 'upsert', lead: { reference: 'AIT-TEST', name: '=IMPORTXML("example")', source: 'google', medium: 'cpc' } }) } };
  assert.equal(context.doPost(request).duplicate, true);
  assert.equal(writes, 0);
  ids = [['']];
  assert.equal(context.doPost(request).ok, true);
  assert.equal(written[17], 'Studio owner');
  assert.equal(written[18], 'New');
  assert.equal(written[6], 'Google Ads');
  assert.ok(written[2].startsWith("'="));
});

function deliveryHarness(previous, responses = [{ ok: true, json: async () => ({ ok: true }) }]) {
  const sent = [], updates = [];
  const builder = {
    update(value) { updates.push(value); return this; },
    eq() { return this; }, or() { return this; }, select() { return this; },
    maybeSingle: async () => ({ data: { marketing_delivery: previous }, error: null }),
    then(resolve) { return Promise.resolve({ error: null }).then(resolve); },
  };
  const modules = { '@/lib/attribution': { emptyAttribution: () => ({}) }, '@/lib/supabase-admin': { getSupabaseAdmin: () => ({ from: () => builder }) } };
  const delivery = loadModule('../src/lib/marketing-integrations.ts', {
    URL, Date, AbortSignal, console: { error() {} }, process: { env: { MARKETING_CRM_WEBHOOK_URL: 'https://example.com/crm', MARKETING_CRM_WEBHOOK_SECRET: 'test-secret', META_CAPI_ACCESS_TOKEN: 'test-token', META_PIXEL_ID: 'test-pixel' } },
    fetch: async (url, init) => { sent.push({ url: String(url), ...init }); return responses.shift(); },
  }, modules);
  const lead = { reference: 'AIT-E-TEST1234', eventId: 'stable-event-id', createdAt: new Date(Date.now() - 60000).toISOString(), name: 'Test', phone: '0000000000', email: 'test@example.invalid', marketingConsent: true, attribution: {}, eventSourceUrl: 'https://example.com/book' };
  return { delivery, lead, sent, updates };
}

test('delivery recovery skips destinations already confirmed as sent', async () => {
  const { delivery, lead, sent, updates } = deliveryHarness({ crm: 'failed', meta: 'sent', attempts: 1 });
  const result = await delivery.runMarketingLeadIntegrations(lead);
  assert.equal(result.crm, 'sent');
  assert.equal(result.meta, 'sent');
  assert.equal(sent.length, 1);
  assert.equal(updates[1].marketing_delivery.attempts, 2);
  assert.equal(updates[1].marketing_locked_until, null);
});

test('Meta recovery retains the original time and ID and requires acknowledgement', async () => {
  const { delivery, lead, sent, updates } = deliveryHarness({ crm: 'sent', meta: 'failed' }, [{ ok: true, json: async () => ({ events_received: 0 }) }]);
  const result = await delivery.runMarketingLeadIntegrations(lead);
  assert.equal(result.meta, 'failed');
  const payload = JSON.parse(sent[0].body).data[0];
  assert.equal(payload.event_id, lead.eventId);
  assert.equal(payload.event_time, Math.floor(new Date(lead.createdAt).getTime() / 1000));
  assert.equal(sent[0].url.includes('test-token'), false);
  assert.equal(updates[1].marketing_delivery.meta, 'failed');
});

test('non-consented enquiries never send a Meta request during recovery', async () => {
  const { delivery, lead, sent } = deliveryHarness({ crm: 'sent', meta: 'pending' });
  lead.marketingConsent = false;
  assert.equal((await delivery.runMarketingLeadIntegrations(lead)).meta, 'no_consent');
  assert.equal(sent.length, 0);
});
