import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
// Soglia dedicata alla SIDEBAR: sotto 1024px (tutti i tablet in portrait, iOS e
// Android) la sidebar diventa un drawer a scomparsa (hamburger), liberando la
// larghezza per le tabelle. Da 1024px in su (desktop e tablet in landscape)
// resta fissa. Non tocca le classi Tailwind `md:` (768px) del resto della UI.
const SIDEBAR_DRAWER_BREAKPOINT = 1024;

/** Hook generico basato su una soglia max-width (px CSS, device-agnostico). */
function useMaxWidth(breakpoint: number) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setMatches(window.innerWidth < breakpoint);
    mql.addEventListener('change', onChange);
    setMatches(window.innerWidth < breakpoint);
    return () => mql.removeEventListener('change', onChange);
  }, [breakpoint]);

  return !!matches;
}

export function useIsMobile() {
  return useMaxWidth(MOBILE_BREAKPOINT);
}

/**
 * True quando la sidebar deve comportarsi da drawer (tablet portrait e telefono).
 * Usato SOLO da SidebarContext: alza la soglia a 1024px senza spostare il
 * confine desktop del resto dell'app.
 */
export function useIsSidebarDrawer() {
  return useMaxWidth(SIDEBAR_DRAWER_BREAKPOINT);
}
