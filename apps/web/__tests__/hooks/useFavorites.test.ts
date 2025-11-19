import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "@/hooks/useFavorites";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useFavorites", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("initializes with empty favorites", () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
    expect(result.current.favoritesCount).toBe(0);
  });

  it("adds favorite", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite("airdrop-1");
    });

    expect(result.current.favorites).toContain("airdrop-1");
    expect(result.current.favoritesCount).toBe(1);
  });

  it("does not add duplicate favorites", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite("airdrop-1");
      result.current.addFavorite("airdrop-1");
    });

    expect(result.current.favorites.length).toBe(1);
  });

  it("removes favorite", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite("airdrop-1");
      result.current.addFavorite("airdrop-2");
    });

    act(() => {
      result.current.removeFavorite("airdrop-1");
    });

    expect(result.current.favorites).not.toContain("airdrop-1");
    expect(result.current.favorites).toContain("airdrop-2");
  });

  it("toggles favorite", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("airdrop-1");
    });

    expect(result.current.isFavorite("airdrop-1")).toBe(true);

    act(() => {
      result.current.toggleFavorite("airdrop-1");
    });

    expect(result.current.isFavorite("airdrop-1")).toBe(false);
  });

  it("checks if item is favorite", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite("airdrop-1");
    });

    expect(result.current.isFavorite("airdrop-1")).toBe(true);
    expect(result.current.isFavorite("airdrop-2")).toBe(false);
  });

  it("clears all favorites", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite("airdrop-1");
      result.current.addFavorite("airdrop-2");
    });

    act(() => {
      result.current.clearFavorites();
    });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.favoritesCount).toBe(0);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite("airdrop-1");
    });

    const stored = localStorage.getItem("airdrop_favorites");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toContain("airdrop-1");
  });
});

