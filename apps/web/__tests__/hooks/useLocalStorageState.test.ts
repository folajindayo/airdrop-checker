import { renderHook, act } from "@testing-library/react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

describe("useLocalStorageState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with initial value", () => {
    const { result } = renderHook(() =>
      useLocalStorageState("test-key", "initial")
    );

    expect(result.current[0]).toBe("initial");
  });

  it("loads from localStorage if exists", () => {
    localStorage.setItem("test-key", JSON.stringify("stored value"));

    const { result } = renderHook(() =>
      useLocalStorageState("test-key", "initial")
    );

    expect(result.current[0]).toBe("stored value");
  });

  it("updates localStorage when state changes", () => {
    const { result } = renderHook(() =>
      useLocalStorageState("test-key", "initial")
    );

    act(() => {
      result.current[1]("new value");
    });

    expect(result.current[0]).toBe("new value");
    expect(localStorage.getItem("test-key")).toBe(JSON.stringify("new value"));
  });

  it("handles function updates", () => {
    const { result } = renderHook(() =>
      useLocalStorageState("test-key", 0)
    );

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("removes value from localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorageState("test-key", "initial")
    );

    act(() => {
      result.current[1]("new value");
    });

    expect(localStorage.getItem("test-key")).toBeTruthy();

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe("initial");
    expect(localStorage.getItem("test-key")).toBeNull();
  });

  it("handles custom serializer and deserializer", () => {
    const serializer = (value: number) => value.toString();
    const deserializer = (value: string) => parseInt(value, 10);

    const { result } = renderHook(() =>
      useLocalStorageState("test-key", 42, { serializer, deserializer })
    );

    act(() => {
      result.current[1](100);
    });

    expect(result.current[0]).toBe(100);
    expect(localStorage.getItem("test-key")).toBe("100");
  });

  it("handles JSON parse errors gracefully", () => {
    localStorage.setItem("test-key", "invalid json");

    const { result } = renderHook(() =>
      useLocalStorageState("test-key", "fallback")
    );

    expect(result.current[0]).toBe("fallback");
  });
});

