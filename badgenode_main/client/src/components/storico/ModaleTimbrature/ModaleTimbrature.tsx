import { useModaleTimbrature } from './useModaleTimbrature';
import ModaleTimbratureView from './ModaleTimbratureView';
import type { ModaleTimbratureProps } from './types';

export default function ModaleTimbrature(props: ModaleTimbratureProps) {
  const {
    formData,
    setFormData,
    errors,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleDelete,
  } = useModaleTimbrature(
    props.isOpen,
    props.timbrature,
    props.giorno_logico,
    props.onSave,
    props.onDelete,
    props.onClose
  );

  return (
    <ModaleTimbratureView
      {...props}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      showDeleteConfirm={showDeleteConfirm}
      setShowDeleteConfirm={setShowDeleteConfirm}
      handleSave={handleSave}
      handleDelete={handleDelete}
    />
  );
}
