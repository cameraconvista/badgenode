// Helper utilities per other routes
export function computeDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
}

// Error response helpers
export function sendError(res: any, status: number, error: string, code: string) {
  return res.status(status).json({ success: false, error, code });
}

export function sendSuccess(res: any, data?: any) {
  const response: any = { success: true };
  if (data !== undefined) {
    if (typeof data === 'object' && data !== null) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }
  return res.json(response);
}

// Common error responses
export function sendServiceUnavailable(res: any) {
  return sendError(res, 503, 'Servizio admin non disponibile - configurazione Supabase mancante', 'SERVICE_UNAVAILABLE');
}

export function sendInternalError(res: any) {
  return sendError(res, 500, 'Errore interno', 'INTERNAL_ERROR');
}
