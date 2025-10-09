import ActionButtons from '../home/ActionButtons';

export default function ActionButtonsExample() {
  return (
    <ActionButtons
      onEntrata={() => console.log('Entrata clicked')}
      onUscita={() => console.log('Uscita clicked')}
    />
  );
}
