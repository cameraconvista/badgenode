// Discriminated union per risposte app
export type SuccessResponse<T = unknown> = { success: true; data: T };
export type ErrorResponse = { success: false; error: string; code?: string; requestId?: string };
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export type DeleteResult = { deleted_count: number }; // per delete RPC

export function isSuccess<T>(r: ApiResponse<T>): r is SuccessResponse<T> {
  return (r as SuccessResponse<T>).success === true;
}

export function isError(r: ApiResponse<any>): r is ErrorResponse {
  return (r as ErrorResponse).success === false;
}
