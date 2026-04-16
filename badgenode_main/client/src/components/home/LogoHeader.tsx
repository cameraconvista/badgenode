interface LogoHeaderProps {
  className?: string;
}

export default function LogoHeader({ className = '' }: LogoHeaderProps) {
  return (
    <div className={`text-center mb-4 ${className}`}>
      <div className="h-[60px] flex items-center justify-center">
        <img
          src="/logo_badgenode.png"
          alt=""
          className="max-h-[60px] w-auto object-contain"
          style={{ maxWidth: '200px' }}
          onLoad={() => {}}
          onError={() => {}}
        />
      </div>
    </div>
  );
}
