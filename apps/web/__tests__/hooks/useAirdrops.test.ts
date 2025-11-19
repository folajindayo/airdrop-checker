import { renderHook, waitFor } from "@testing-library/react";
import { useAirdrops } from "@/hooks/useAirdrops";
import { airdropService } from "@/lib/services/airdropService";

jest.mock("@/lib/services/airdropService");

describe("useAirdrops", () => {
  const mockAirdrops = [
    {
      id: "1",
      name: "Airdrop 1",
      description: "Test airdrop 1",
      chain: "ethereum",
      status: "active" as const,
      totalAmount: "1000 tokens",
      participants: 100,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      requirements: ["Hold tokens"],
    },
    {
      id: "2",
      name: "Airdrop 2",
      description: "Test airdrop 2",
      chain: "polygon",
      status: "upcoming" as const,
      totalAmount: "2000 tokens",
      participants: 50,
      startDate: "2024-02-01",
      endDate: "2024-12-31",
      requirements: ["Complete tasks"],
    },
  ];

  const mockResponse = {
    data: mockAirdrops,
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads airdrops on mount", async () => {
    (airdropService.getAirdrops as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAirdrops());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.airdrops).toEqual(mockAirdrops);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it("filters airdrops by status", async () => {
    const filteredResponse = {
      ...mockResponse,
      data: [mockAirdrops[0]],
    };

    (airdropService.getAirdrops as jest.Mock).mockResolvedValue(filteredResponse);

    const { result } = renderHook(() =>
      useAirdrops({ status: "active" })
    );

    await waitFor(() => {
      expect(result.current.airdrops.length).toBe(1);
      expect(result.current.airdrops[0].status).toBe("active");
    });
  });

  it("handles fetch error", async () => {
    (airdropService.getAirdrops as jest.Mock).mockRejectedValue(
      new Error("API error")
    );

    const { result } = renderHook(() => useAirdrops());

    await waitFor(() => {
      expect(result.current.error).toBe("API error");
      expect(result.current.airdrops).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  it("refetches airdrops", async () => {
    (airdropService.getAirdrops as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAirdrops());

    await waitFor(() => {
      expect(result.current.airdrops).toEqual(mockAirdrops);
    });

    const newMockResponse = {
      ...mockResponse,
      data: [mockAirdrops[0]],
    };

    (airdropService.getAirdrops as jest.Mock).mockResolvedValue(newMockResponse);

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.airdrops.length).toBe(1);
    });
  });
});

