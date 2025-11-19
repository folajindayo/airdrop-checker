/**
 * React memoization utilities
 */

import { memo, useMemo, useCallback } from "react";

export function createMemoizedComponent<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return memo(Component, propsAreEqual);
}

export function useMemoCompare<T>(
  value: T,
  compare: (prev: T | undefined, next: T) => boolean
): T {
  const previousRef = useMemo(() => ({ value, compare }), []);

  const previous = previousRef.value;

  const isEqual = compare(previous, value);

  useMemo(() => {
    if (!isEqual) {
      previousRef.value = value;
    }
  }, [value, isEqual]);

  return isEqual ? previous : value;
}

export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps);
}

export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  return useCallback(callback, []) as T;
}

export function shallowEqual(objA: any, objB: any): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
}

export function createShallowEqualSelector<T extends object>(
  Component: React.ComponentType<T>
) {
  return memo(Component, shallowEqual);
}

export function memoizeOne<T extends (...args: any[]) => any>(
  fn: T
): T {
  let lastArgs: any[] | undefined;
  let lastResult: ReturnType<T> | undefined;

  return ((...args: any[]) => {
    if (
      lastArgs &&
      lastArgs.length === args.length &&
      args.every((arg, index) => Object.is(arg, lastArgs![index]))
    ) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = fn(...args);
    return lastResult;
  }) as T;
}

