/**
 * Discriminated union types and utilities
 */

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export type Option<T> = { type: "some"; value: T } | { type: "none" };

export type LoadingState<T, E = Error> =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; data: T }
  | { state: "error"; error: E };

export type RequestState<T> =
  | { status: "pending" }
  | { status: "fetching" }
  | { status: "success"; data: T; timestamp: number }
  | { status: "error"; error: string; timestamp: number }
  | { status: "stale"; data: T; timestamp: number };

export type DataState<T> =
  | { type: "empty" }
  | { type: "loading" }
  | { type: "loaded"; value: T }
  | { type: "error"; message: string };

// Result helpers
export const ok = <T, E = Error>(data: T): Result<T, E> => ({
  success: true,
  data,
});

export const err = <T, E = Error>(error: E): Result<T, E> => ({
  success: false,
  error,
});

export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}

// Option helpers
export const some = <T>(value: T): Option<T> => ({
  type: "some",
  value,
});

export const none = <T>(): Option<T> => ({
  type: "none",
});

export function isSome<T>(option: Option<T>): option is { type: "some"; value: T } {
  return option.type === "some";
}

export function isNone<T>(option: Option<T>): option is { type: "none" } {
  return option.type === "none";
}

export function unwrapOption<T>(option: Option<T>): T {
  if (option.type === "some") {
    return option.value;
  }
  throw new Error("Attempted to unwrap None option");
}

export function unwrapOptionOr<T>(option: Option<T>, defaultValue: T): T {
  return option.type === "some" ? option.value : defaultValue;
}

// LoadingState helpers
export const idle = <T, E = Error>(): LoadingState<T, E> => ({
  state: "idle",
});

export const loading = <T, E = Error>(): LoadingState<T, E> => ({
  state: "loading",
});

export const success = <T, E = Error>(data: T): LoadingState<T, E> => ({
  state: "success",
  data,
});

export const error = <T, E = Error>(error: E): LoadingState<T, E> => ({
  state: "error",
  error,
});

export function isIdle<T, E>(state: LoadingState<T, E>): state is { state: "idle" } {
  return state.state === "idle";
}

export function isLoading<T, E>(state: LoadingState<T, E>): state is { state: "loading" } {
  return state.state === "loading";
}

export function isSuccess<T, E>(
  state: LoadingState<T, E>
): state is { state: "success"; data: T } {
  return state.state === "success";
}

export function isError<T, E>(
  state: LoadingState<T, E>
): state is { state: "error"; error: E } {
  return state.state === "error";
}

