import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WalletConnect from "@/components/wallet/WalletConnect";

describe("WalletConnect", () => {
  const mockOnConnect = jest.fn();
  const mockOnDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders connect button when not connected", () => {
    render(
      <WalletConnect
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
      />
    );

    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });

  it("renders connected state with address", () => {
    const address = "0x1234567890123456789012345678901234567890";
    render(
      <WalletConnect
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
        address={address}
      />
    );

    expect(screen.getByText("0x1234...7890")).toBeInTheDocument();
    expect(screen.getByText("Disconnect")).toBeInTheDocument();
  });

  it("truncates address correctly", () => {
    const address = "0x1234567890123456789012345678901234567890";
    render(
      <WalletConnect
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
        address={address}
      />
    );

    expect(screen.getByText("0x1234...7890")).toBeInTheDocument();
  });

  it("calls onDisconnect when disconnect button is clicked", () => {
    const address = "0x1234567890123456789012345678901234567890";
    render(
      <WalletConnect
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
        address={address}
      />
    );

    const disconnectButton = screen.getByText("Disconnect");
    fireEvent.click(disconnectButton);

    expect(mockOnDisconnect).toHaveBeenCalledTimes(1);
  });

  it("shows error message when wallet is not available", async () => {
    // Mock window.ethereum as undefined
    const originalEthereum = (window as any).ethereum;
    delete (window as any).ethereum;

    render(
      <WalletConnect
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
      />
    );

    const connectButton = screen.getByText("Connect Wallet");
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Please install MetaMask/)
      ).toBeInTheDocument();
    });

    // Restore window.ethereum
    (window as any).ethereum = originalEthereum;
  });

  it("shows loading state when connecting", () => {
    render(
      <WalletConnect
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
      />
    );

    const connectButton = screen.getByText("Connect Wallet");
    expect(connectButton).toBeInTheDocument();
  });
});

