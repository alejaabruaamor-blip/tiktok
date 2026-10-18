import { beforeEach, expect, it, vi } from 'vitest';
import { regionAllowsAdvertising, campaignParams } from './ad-tracking';
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); vi.restoreAllMocks(); });
it.each(['BR','CA','FR','DE','GB','CH','NL','XX','T1',null])('blocks consent or unresolved region %s without banner', region => { expect(regionAllowsAdvertising(region)).toBe(false); });
it('allows ordinary advertising in a resolved unrestricted region', () => { expect(regionAllowsAdvertising('MX')).toBe(true); });
it('captures campaign labels and TikTok clicks, never customer parameters', () => {
  expect(campaignParams('?utm_source=tiktok&utm_campaign=tools_2026&ttclid=click-123&email=a%40example.com&cpf=123&fbclid=456')).toEqual({utm_source:'tiktok',utm_campaign:'tools_2026',ttclid:'click-123'});
});
it('rejects email and oversized campaign values', () => { expect(campaignParams('?utm_content=a%40example.com&utm_term='+ 'a'.repeat(201))).toEqual({}); });
it('keeps landing parameters through subsequent pages and only reports approved payments once', async () => {
  vi.resetModules();
  history.replaceState({}, '', '/?utm_source=tiktok&utm_campaign=tools&ttclid=test-click');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => 'loc=MX' }));
  const ads = await import('./ad-tracking');
  expect(await ads.getCampaignParameters()).toEqual({utm_source:'tiktok',utm_campaign:'tools',ttclid:'test-click'});
  history.replaceState({}, '', '/pagamento');
  expect(await ads.getCampaignParameters()).toEqual({utm_source:'tiktok',utm_campaign:'tools',ttclid:'test-click'});
  const track = vi.fn(); if (window.ttq) window.ttq.track = track;
  expect(await ads.trackPayment('PENDING','test-order',9790,'ferramenta')).toBe(false);
  expect(await ads.trackPayment('PAID','test-order',9790,'ferramenta')).toBe(true);
  expect(await ads.trackPayment('PAID','test-order',9790,'ferramenta')).toBe(false);
  expect(track).toHaveBeenCalledExactlyOnceWith('CompletePayment',{ content_id:'ferramenta',content_type:'product',value:97.90,currency:'BRL'},{event_id:'paid-test-order'});
  ads.stopAdvertising();
  expect(await ads.trackPayment('PAID','extra',1015,'upsell')).toBe(false);
  expect(await ads.getCampaignParameters()).toEqual({});
});
it('does not initialize or send events in Brazil', async () => {
  vi.resetModules(); delete window.ttq;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok:true, text:async () => 'loc=BR' }));
  const ads = await import('./ad-tracking');
  expect(await ads.prepareAdvertising()).toBe(false);
  expect(await ads.trackPayment('PAID','blocked',1015,'upsell')).toBe(false);
  expect(window.ttq).toBeUndefined();
});
