export const PIXEL_ID = 'DBA1AARC77U7B01LPUKG';
export const CAMPAIGN_KEY = 'tiktokshop:campaign';
export const AD_CHOICE_KEY = 'tiktokshop:advertising-choice';
export const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'ttclid'] as const;
const CONSENT_REGIONS = new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE GB CH'.split(' '));
// Conservative denial in consent jurisdictions, including Canada and Brazil.
const RESTRICTED = new Set([...CONSENT_REGIONS, 'CA', 'BR']);
export function regionAllowsAdvertising(country: string | null) {
  return Boolean(country && /^[A-Z]{2}$/.test(country) && !['XX', 'T1'].includes(country) && !RESTRICTED.has(country));
}
export function campaignParams(search: string): Record<string, string> {
  const query = new URLSearchParams(search); const result: Record<string, string> = {};
  for (const key of PARAMS) {
    const value = query.get(key);
    // Only campaign labels/click IDs. Never forward free text, email or customer fields.
    if (value && value.length <= 200 && /^[\p{L}\p{N}_.{}~+ -]+$/u.test(value)) result[key] = value;
  }
  return result;
}
type Pixel = Array<unknown> & { page: (data?: object) => void; track: (name: string, properties: object, options: object) => void; revokeConsent: () => void; grantConsent: () => void; load: (id: string, options: object) => void; [key: string]: unknown };
declare global { interface Window { ttq?: Pixel; TiktokAnalyticsObject?: string } }
let region: string | null = null; let readiness: Promise<boolean> | null = null; let installed = false;
function refused() {
  try { return JSON.parse(localStorage.getItem(AD_CHOICE_KEY) ?? 'null')?.advertising === false; } catch { return true; }
}
export function advertisingAllowedNow() {
  return regionAllowsAdvertising(region) && !refused() && navigator.globalPrivacyControl !== true && navigator.doNotTrack !== '1';
}
// Cache geographical resolution for this visit, not the visitor's latest choice.
export function prepareAdvertising(): Promise<boolean> {
  if (readiness) return readiness;
  const landing = window.location.search;
  readiness = (async () => {
    const controller = new AbortController(); const timer = window.setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch('/cdn-cgi/trace', { signal: controller.signal, cache: 'no-store' });
      if (response.ok) region = (await response.text()).match(/^loc=([A-Z]{2})$/m)?.[1] ?? null;
      if (!region) {
        const fallback = await fetch('/api/public/ad-region', { signal: controller.signal, cache: 'no-store' });
        if (fallback.ok) region = (await fallback.json() as { country: string | null }).country;
      }
    } catch { region = null; } finally { window.clearTimeout(timer); }
    if (!advertisingAllowedNow()) { sessionStorage.removeItem(CAMPAIGN_KEY); return false; }
    const incoming = campaignParams(landing);
    if (Object.keys(incoming).length) sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(incoming));
    installPixel(); return true;
  })();
  return readiness;
}
function installPixel() {
  if (installed || !advertisingAllowedNow()) return;
  installed = true;
  // Strip unknown URL parameters before any provider script can inspect the page.
  const clean = new URL(window.location.href); const allowed = new Set<string>([...PARAMS, 'p', 'funnel']);
  for (const key of [...clean.searchParams.keys()]) if (!allowed.has(key) || (PARAMS.includes(key as typeof PARAMS[number]) && !campaignParams(clean.search)[key])) clean.searchParams.delete(key);
  clean.hash = ''; window.history.replaceState(window.history.state, '', clean);
  window.TiktokAnalyticsObject = 'ttq';
  const queue = (window.ttq ?? []) as Pixel; window.ttq = queue;
  const methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
  const defer = (target: Pixel, name: string) => { target[name] = (...args: unknown[]) => target.push([name, ...args]); };
  queue['methods'] = methods; queue['setAndDefer'] = defer;
  methods.forEach(name => defer(queue, name));
  queue['instance'] = (id: string) => { const instances = queue['_i'] as Record<string, Pixel>; const instance = instances[id] ?? ([] as unknown as Pixel); methods.forEach(name => defer(instance, name)); return instance; };
  queue.load = (id, options) => {
    queue['_i'] = { [id]: [] }; queue['_t'] = { [id]: Date.now() }; queue['_o'] = { [id]: options };
    const script = document.createElement('script'); script.async = true;
    script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}&lib=ttq`;
    document.head.append(script);
  };
  queue.load(PIXEL_ID, { plugins: { AdvancedMatching: false, AutoAdvancedMatching: false, AutoClick: false, AutoConfig: false, AutoConfigV2: false, Identify: false, EventBuilder: false, Metadata: false, EnableLPV: false, EnableDatalayerVisiter: false, PageData: false, HistoryObserver: false } });
}
export async function getCampaignParameters() {
  await prepareAdvertising(); if (!advertisingAllowedNow()) return {};
  try { return campaignParams(new URLSearchParams(JSON.parse(sessionStorage.getItem(CAMPAIGN_KEY) ?? '{}')).toString()); } catch { return {}; }
}
export async function trackPage(path: string) {
  await prepareAdvertising(); if (!advertisingAllowedNow()) return;
  window.ttq?.page();
  if (path === '/' || path === '/ferramenta') window.ttq?.track('ViewContent', { content_id: 'ferramenta', content_type: 'product', currency: 'BRL', value: 97.90 }, { event_id: crypto.randomUUID() });
  if (['/checkout', '/w3/checkout'].includes(path)) {
    const w3 = path.startsWith('/w3');
    window.ttq?.track('InitiateCheckout', { content_id: w3 ? 'w3' : 'ferramenta', content_type: 'product', currency: 'BRL', value: w3 ? 87.90 : 97.90 }, { event_id: crypto.randomUUID() });
  }
}
export async function trackPayment(status: string, id: string, amountCents: number, product: string) {
  if (status !== 'PAID' || !id || !Number.isInteger(amountCents) || amountCents <= 0) return false;
  await prepareAdvertising(); if (!advertisingAllowedNow()) return false;
  const key = `tiktokshop:tracked-payment:${id}`;
  if (localStorage.getItem(key)) return false;
  const eventId = `paid-${id}`;
  window.ttq?.track('CompletePayment', { content_id: product, content_type: 'product', value: amountCents / 100, currency: 'BRL' }, { event_id: eventId });
  localStorage.setItem(key, JSON.stringify({ eventId, region, advertising: true, recordedAt: new Date().toISOString() }));
  return true;
}
export function stopAdvertising() {
  localStorage.setItem(AD_CHOICE_KEY, JSON.stringify({ advertising: false, recordedAt: new Date().toISOString(), noticeVersion: '2026-10-18-v1' }));
  sessionStorage.removeItem(CAMPAIGN_KEY); window.ttq?.revokeConsent();
}
export function syncAdvertisingChoice() {
  if (!advertisingAllowedNow()) { sessionStorage.removeItem(CAMPAIGN_KEY); window.ttq?.revokeConsent(); }
}
declare global { interface Navigator { readonly globalPrivacyControl?: boolean } }
