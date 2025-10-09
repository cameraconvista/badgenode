import { useState } from 'react';
import PinDisplay from '../home/PinDisplay';
import { Button } from '@/components/ui/button';

export default function PinDisplayExample() {
  const [pin, setPin] = useState('12');

  return (
    <div className="space-y-4">
      <PinDisplay pin={pin} />
      <div className="flex gap-2 justify-center">
        <Button onClick={() => setPin(pin + '3')}>Add Digit</Button>
        <Button onClick={() => setPin('')}>Clear</Button>
      </div>
    </div>
  );
}
