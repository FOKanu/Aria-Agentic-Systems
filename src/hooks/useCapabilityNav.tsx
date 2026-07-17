// Capability Navigation - Francis Okorie Iyeke-Kanu
//
// Legal and Social pages cross-link to sibling pages within their own
// module (e.g. Legal Overview -> Contracts, Trend Monitoring -> Post
// Generation). When those pages are reached through the Agent Rail they are
// rendered as tabs inside Index.tsx's shell (AgentRail/TopBar/floating chat)
// — a plain react-router `navigate('/legal/contracts')` call would unmount
// that shell and drop straight to the bare standalone route.
//
// This hook lets a page call `nav('contracts')` and have it resolve to the
// right behavior: switch tabs when rendered inside Index (chrome stays
// mounted), or fall back to router navigation when the page is reached
// directly via a bare route (e.g. a bookmarked /legal/contracts URL).
import { createContext, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export type CapabilityNavigate = (tabId: string) => void;

export const CapabilityNavContext = createContext<CapabilityNavigate | null>(null);

// Mirrors the routes registered in AppRoutes.tsx for these tab ids.
export const CAPABILITY_PATHS: Record<string, string> = {
  legal: '/legal',
  contracts: '/legal/contracts',
  review: '/legal/document-review',
  compliance: '/legal/compliance',
  nda: '/legal/nda-generator',
  ip: '/legal/ip-management',
  research: '/legal/case-research',
  social: '/social',
  'social-scheduling': '/social/scheduling',
  'social-posts': '/social/posts',
  'social-analytics': '/social/analytics',
  'social-community': '/social/community',
  'social-outreach': '/social/outreach',
  'social-trends': '/social/trends',
};

export function useCapabilityNav(): CapabilityNavigate {
  const tabNavigate = useContext(CapabilityNavContext);
  const routerNavigate = useNavigate();

  return useCallback((tabId: string) => {
    if (tabNavigate) {
      tabNavigate(tabId);
      return;
    }
    const path = CAPABILITY_PATHS[tabId];
    if (path) routerNavigate(path);
  }, [tabNavigate, routerNavigate]);
}
