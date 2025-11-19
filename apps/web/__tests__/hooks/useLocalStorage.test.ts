import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default value", () => {
    const { result } = renderHook(() => useLocalStorage("test", "default"));

    expect(result.current[0]).toBe("default");
  });

  it("stores value in localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test", ""));

    act(() => {
      result.current[1]("newValue");
    });

    expect(result.current[0]).toBe("newValue");
    expect(localStorage.getItem("test")).toBe(JSON.stringify("newValue"));
  });

  it("retrieves value from localStorage on mount", () => {
    localStorage.setItem("test", JSON.stringify("storedValue"));

    const { result } = renderHook(() => useLocalStorage("test", "default"));

    expect(result.current[0]).toBe("storedValue");
  });

  it("updates value with function updater", () => {
    const { result } = renderHook(() => useLocalStorage("counter", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("removes value from localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test", "default"));

    act(() => {
      result.current[1]("value");
    });

    expect(localStorage.getItem("test")).not.toBeNull();

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe("default");
    expect(localStorage.getItem("test")).toBeNull();
  });

  it("handles complex objects", () => {
    const { result } = renderHook(() =>
      useLocalStorage("user", { name: "", age: 0 })
    );

    act(() => {
      result.current[1]({ name: "John", age: 30 });
    });

    expect(result.current[0]).toEqual({ name: "John", age: 30 });
  });
});

