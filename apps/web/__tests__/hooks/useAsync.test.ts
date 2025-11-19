import { renderHook, waitFor } from "@testing-library/react";
import { useAsync, useAsyncCallback } from "@/lib/hooks/useAsync";

describe("useAsync", () => {
  it("executes async function immediately", async () => {
    const asyncFn = jest.fn(() => Promise.resolve("data"));
    const { result } = renderHook(() => useAsync(asyncFn, true));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe("data");
    expect(result.current.error).toBeNull();
    expect(asyncFn).toHaveBeenCalledTimes(1);
  });

  it("handles errors", async () => {
    const error = new Error("Test error");
    const asyncFn = jest.fn(() => Promise.reject(error));
    const { result } = renderHook(() => useAsync(asyncFn, true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(error);
  });

  it("does not execute immediately when immediate is false", () => {
    const asyncFn = jest.fn(() => Promise.resolve("data"));
    const { result } = renderHook(() => useAsync(asyncFn, false));

    expect(result.current.loading).toBe(false);
    expect(asyncFn).not.toHaveBeenCalled();
  });
});

describe("useAsyncCallback", () => {
  it("executes on manual trigger", async () => {
    const asyncFn = jest.fn((arg: string) => Promise.resolve(arg));
    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    expect(result.current.loading).toBe(false);

    await result.current.execute("test");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe("test");
    expect(asyncFn).toHaveBeenCalledWith("test");
  });

  it("resets state", async () => {
    const asyncFn = jest.fn(() => Promise.resolve("data"));
    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.data).toBe("data");
    });

    result.current.reset();

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});

