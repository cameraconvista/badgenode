interface LogoHeaderProps {
  className?: string;
}

export default function LogoHeader({ className = '' }: LogoHeaderProps) {
  return (
    <div className={`text-center mb-6 ${className}`}>
      <div className="h-[60px] flex items-center justify-center">
        <img
          src="/logo2_app.png"
          alt=""
          className="max-h-[60px] w-auto object-contain drop-shadow-sm"
          style={{
            maxWidth: '200px',
            filter: 'drop-shadow(0 1px 0 rgba(122,18,40,0.6)) drop-shadow(0 -1px 0 rgba(122,18,40,0.6)) drop-shadow(1px 0 0 rgba(122,18,40,0.6)) drop-shadow(-1px 0 0 rgba(122,18,40,0.6))',
          }}
          onLoad={() => {}}
          onError={() => {}}
        />
      </div>
    </div>
  );
}
