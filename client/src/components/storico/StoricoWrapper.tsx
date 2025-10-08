import { useParams } from 'wouter';
import StoricoTimbrature from '@/pages/StoricoTimbrature';

export default function StoricoWrapper() {
  const params = useParams();
  const pin = params.pin ? parseInt(params.pin) : undefined;
  
  return <StoricoTimbrature pin={pin} />;
}
