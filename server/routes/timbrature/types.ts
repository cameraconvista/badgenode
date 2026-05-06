// Tipi condivisi per moduli timbrature

export interface ValidationError {
  success: false;
  error: string;
  code: string;
}

export interface ValidationSuccess {
  success: true;
  anchorEntry?: {
    id: string;
    giorno_logico: string;
    data_locale: string;
    ora_locale: string;
  };
}

export type ValidationResult = ValidationError | ValidationSuccess;
