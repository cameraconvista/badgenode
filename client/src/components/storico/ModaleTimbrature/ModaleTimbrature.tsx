import { useModaleTimbrature } from './useModaleTimbrature';
import ModaleTimbratureView from './ModaleTimbratureView';
import type { ModaleTimbratureProps } from './types';

export default function ModaleTimbrature(props: ModaleTimbratureProps) {
  const {
    formData,
    setFormData,
    errors,
    handleSave,
  } = useModaleTimbrature(
    props.isOpen,
    props.timbrature,
    props.giornologico,
    props.onSave,
    props.onClose
  );

  return (
    <ModaleTimbratureView
      {...props}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      handleSave={handleSave}
    />
  );
}
