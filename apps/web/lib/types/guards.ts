/**
 * Type guard functions
 */

import {
  AirdropStatus,
  Chain,
  NotificationType,
  ApiResponse,
  ApiError,
  Airdrop,
  EligibilityResult,
} from "./api";

export function isAirdropStatus(value: unknown): value is AirdropStatus {
  return (
    typeof value === "string" &&
    ["active", "upcoming", "ended", "claimed"].includes(value)
  );
}

export function isChain(value: unknown): value is Chain {
  return (
    typeof value === "string" &&
    [
      "ethereum",
      "polygon",
      "bsc",
      "arbitrum",
      "optimism",
      "avalanche",
      "base",
      "solana",
    ].includes(value)
  );
}

export function isNotificationType(value: unknown): value is NotificationType {
  return (
    typeof value === "string" &&
    ["success", "error", "warning", "info"].includes(value)
  );
}

export function isAirdrop(value: unknown): value is Airdrop {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "chain" in value &&
    "status" in value &&
    typeof (value as any).id === "string" &&
    typeof (value as any).name === "string" &&
    isChain((value as any).chain) &&
    isAirdropStatus((value as any).status)
  );
}

export function isEligibilityResult(value: unknown): value is EligibilityResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "eligible" in value &&
    "requirements" in value &&
    typeof (value as any).eligible === "boolean" &&
    Array.isArray((value as any).requirements)
  );
}

export function isEthereumAddress(value: unknown): value is string {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as any).success === "boolean"
  );
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    typeof (value as any).code === "string" &&
    typeof (value as any).message === "string"
  );
}

export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success && response.data !== undefined;
}

export function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: false; error: ApiError } {
  return !response.success && response.error !== undefined;
}

export function assertEthereumAddress(
  value: unknown,
  name: string = "address"
): asserts value is string {
  if (!isEthereumAddress(value)) {
    throw new Error(`Invalid Ethereum address: ${name}`);
  }
}

export function assertAirdropStatus(
  value: unknown,
  name: string = "status"
): asserts value is AirdropStatus {
  if (!isAirdropStatus(value)) {
    throw new Error(`Invalid airdrop status: ${name}`);
  }
}

export function assertChain(
  value: unknown,
  name: string = "chain"
): asserts value is Chain {
  if (!isChain(value)) {
    throw new Error(`Invalid chain: ${name}`);
  }
}

