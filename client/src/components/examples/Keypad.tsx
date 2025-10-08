import Keypad from '../home/Keypad';

export default function KeypadExample() {
  return (
    <Keypad
      onKeyPress={(key: string) => console.log('Key pressed:', key)}
      onClear={() => console.log('Clear pressed')}
      onSettings={() => console.log('Settings pressed')}
    />
  );
}
