import Keypad from '../Keypad';

export default function KeypadExample() {
  return (
    <Keypad
      onKeyPress={(key) => console.log('Key pressed:', key)}
      onClear={() => console.log('Clear pressed')}
      onSettings={() => console.log('Settings pressed')}
    />
  );
}
