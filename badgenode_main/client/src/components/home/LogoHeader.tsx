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
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
          onLoad={() => {}}
          onError={() => {}}
        />
      </div>
    </div>
  );
}
