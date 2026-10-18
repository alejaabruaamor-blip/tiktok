import { useEffect } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { trackPage, syncAdvertisingChoice } from '@/lib/ad-tracking';
export function CampaignTracking() {
  const path = useRouterState({ select: state => state.location.pathname });
  useEffect(() => { void trackPage(path); }, [path]);
  useEffect(() => {
    const listener = () => syncAdvertisingChoice();
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);
  return <footer className="ad-privacy-footer"><Link to="/privacidade" className="underline">Privacidade e preferências de publicidade</Link></footer>;
}
