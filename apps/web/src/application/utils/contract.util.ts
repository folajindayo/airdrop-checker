/**
 * Smart Contract Utility Functions
 */

export function encodeFunction(functionName: string, params: any[]): string {
  // Simplified encoding
  return `0x${functionName}${params.join('')}`;
}

export function decodeEventLog(log: any): any {
  // Simplified decoding
  return {
    name: log.topics[0],
    args: log.data,
  };
}

export function estimateContractGas(contractCall: any): number {
  // Simplified gas estimation
  return 50000;
}

export function parseContractError(error: any): string {
  if (error.data && error.data.message) {
    return error.data.message;
  }
  return error.message || 'Contract call failed';
}

