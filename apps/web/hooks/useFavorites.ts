import { useState, useEffect, useCallback } from "react";
import { Airdrop } from "@/lib/services/airdropService";

const FAVORITES_KEY = "airdrop_favorites";

interface UseFavoritesResult {
  favorites: string[];
  isFavorite: (airdropId: string) => boolean;
  addFavorite: (airdropId: string) => void;
  removeFavorite: (airdropId: string) => void;
  toggleFavorite: (airdropId: string) => void;
  clearFavorites: () => void;
  favoritesCount: number;
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (airdropId: string) => {
      return favorites.includes(airdropId);
    },
    [favorites]
  );

  const addFavorite = useCallback((airdropId: string) => {
    setFavorites((prev) => {
      if (prev.includes(airdropId)) return prev;
      return [...prev, airdropId];
    });
  }, []);

  const removeFavorite = useCallback((airdropId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== airdropId));
  }, []);

  const toggleFavorite = useCallback((airdropId: string) => {
    setFavorites((prev) => {
      if (prev.includes(airdropId)) {
        return prev.filter((id) => id !== airdropId);
      } else {
        return [...prev, airdropId];
      }
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };
}

