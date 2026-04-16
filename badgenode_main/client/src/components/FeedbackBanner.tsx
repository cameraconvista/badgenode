import { CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedbackBannerProps {
  type: 'success' | 'error' | null;
  message: string;
  onClose: () => void;
}

export default function FeedbackBanner({ type, message, onClose }: FeedbackBannerProps) {
  if (!type) return null;

  const bgColor = type === 'success' ? 'bg-chart-1' : 'bg-chart-2';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div
      data-testid={`banner-${type}`}
      className={`${bgColor} text-white px-4 py-3 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium" data-testid="text-feedback-message">
          {message}
        </span>
      </div>
      <Button
        data-testid="button-close-banner"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 hover:bg-white/20 no-default-hover-elevate"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
