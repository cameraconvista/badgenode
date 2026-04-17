import { useState } from 'react';

interface IntroSplashProps {
  visible: boolean;
}

export default function IntroSplash({ visible }: IntroSplashProps) {
  const [logoSrc, setLogoSrc] = useState('/logo_intro.svg');

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_#F5EBE0_0%,_#F0E2D4_50%,_#E8D5C4_100%)] bg-fixed transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <img
        src={logoSrc}
        alt="BADGENODE"
        onError={() => setLogoSrc('/logo_badgenode.png')}
        className="w-[min(65vw,450px)] h-auto object-contain"
      />
    </div>
  );
}
