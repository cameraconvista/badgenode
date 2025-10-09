import { useState } from 'react';
import FeedbackBanner from '../FeedbackBanner';
import { Button } from '@/components/ui/button';

export default function FeedbackBannerExample() {
  const [type, setType] = useState<'success' | 'error' | null>('success');

  return (
    <div className="space-y-4">
      <FeedbackBanner
        type={type}
        message={type === 'success' ? 'Entrata registrata con successo' : 'PIN non valido'}
        onClose={() => setType(null)}
      />
      <div className="flex gap-2 justify-center">
        <Button onClick={() => setType('success')}>Show Success</Button>
        <Button onClick={() => setType('error')}>Show Error</Button>
      </div>
    </div>
  );
}
