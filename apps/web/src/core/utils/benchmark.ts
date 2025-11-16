/**
 * Benchmark Utilities
 * Tools for benchmarking code performance
 */

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
}

export async function benchmark(
  name: string,
  fn: () => void | Promise<void>,
  iterations: number = 1000
): Promise<BenchmarkResult> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const avgTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return {
    name,
    iterations,
    totalTime,
    avgTime,
    minTime,
    maxTime,
  };
}

export async function compareBenchmarks(
  benchmarks: Array<{ name: string; fn: () => void | Promise<void> }>,
  iterations: number = 1000
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  for (const { name, fn } of benchmarks) {
    const result = await benchmark(name, fn, iterations);
    results.push(result);
  }

  // Sort by average time
  results.sort((a, b) => a.avgTime - b.avgTime);

  return results;
}

export function printBenchmarkResults(results: BenchmarkResult[]): void {
  console.log('\n=== Benchmark Results ===');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.name}`);
    console.log(`  Iterations: ${result.iterations}`);
    console.log(`  Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`  Avg Time: ${result.avgTime.toFixed(4)}ms`);
    console.log(`  Min Time: ${result.minTime.toFixed(4)}ms`);
    console.log(`  Max Time: ${result.maxTime.toFixed(4)}ms`);
  });
  console.log('\n========================\n');
}

