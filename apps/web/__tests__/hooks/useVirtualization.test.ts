import { renderHook } from "@testing-library/react";
import { useVirtualization } from "@/hooks/useVirtualization";
import { RefObject } from "react";

describe("useVirtualization", () => {
  let scrollRef: RefObject<HTMLElement>;

  beforeEach(() => {
    const mockElement = {
      scrollTop: 0,
      clientHeight: 500,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      scrollTo: jest.fn(),
    } as any;

    scrollRef = { current: mockElement };
  });

  it("calculates total size correctly", () => {
    const { result } = renderHook(() =>
      useVirtualization(100, {
        itemHeight: 50,
        scrollRef,
      })
    );

    expect(result.current.totalSize).toBe(5000);
  });

  it("returns visible items", () => {
    const { result } = renderHook(() =>
      useVirtualization(100, {
        itemHeight: 50,
        scrollRef,
      })
    );

    expect(result.current.virtualItems.length).toBeGreaterThan(0);
    expect(result.current.virtualItems[0]).toHaveProperty("index");
    expect(result.current.virtualItems[0]).toHaveProperty("start");
    expect(result.current.virtualItems[0]).toHaveProperty("size");
  });

  it("provides scrollToIndex function", () => {
    const { result } = renderHook(() =>
      useVirtualization(100, {
        itemHeight: 50,
        scrollRef,
      })
    );

    expect(typeof result.current.scrollToIndex).toBe("function");
  });

  it("scrolls to specified index", () => {
    const { result } = renderHook(() =>
      useVirtualization(100, {
        itemHeight: 50,
        scrollRef,
      })
    );

    result.current.scrollToIndex(10);

    // scrollTop should be set to index * itemHeight
    expect(scrollRef.current!.scrollTop).toBe(500);
  });

  it("respects overscan option", () => {
    const { result: withOverscan } = renderHook(() =>
      useVirtualization(100, {
        itemHeight: 50,
        scrollRef,
        overscan: 5,
      })
    );

    const { result: withoutOverscan } = renderHook(() =>
      useVirtualization(100, {
        itemHeight: 50,
        scrollRef,
        overscan: 0,
      })
    );

    // With overscan should render more items
    expect(withOverscan.current.virtualItems.length).toBeGreaterThanOrEqual(
      withoutOverscan.current.virtualItems.length
    );
  });
});

