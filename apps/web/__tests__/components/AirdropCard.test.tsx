import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AirdropCard from "@/components/airdrop/AirdropCard";

describe("AirdropCard", () => {
  const mockProps = {
    name: "Test Airdrop",
    status: "active" as const,
    amount: "$100",
    claimBy: "2024-12-31",
    description: "This is a test airdrop description",
  };

  it("renders airdrop information correctly", () => {
    render(<AirdropCard {...mockProps} />);

    expect(screen.getByText("Test Airdrop")).toBeInTheDocument();
    expect(screen.getByText("Est. $100")).toBeInTheDocument();
    expect(screen.getByText("Claim by: 2024-12-31")).toBeInTheDocument();
    expect(screen.getByText(/This is a test airdrop/)).toBeInTheDocument();
  });

  it("displays active status badge", () => {
    render(<AirdropCard {...mockProps} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows eligible badge when eligible is true", () => {
    render(<AirdropCard {...mockProps} eligibility={true} />);
    expect(screen.getByText("✓ Eligible")).toBeInTheDocument();
  });

  it("shows not eligible badge when eligible is false", () => {
    render(<AirdropCard {...mockProps} eligibility={false} />);
    expect(screen.getByText("✗ Not Eligible")).toBeInTheDocument();
  });

  it("calls onClaim when claim button is clicked", () => {
    const mockOnClaim = jest.fn();
    render(
      <AirdropCard
        {...mockProps}
        eligibility={true}
        onClaim={mockOnClaim}
      />
    );

    const claimButton = screen.getByText("Claim Airdrop");
    fireEvent.click(claimButton);

    expect(mockOnClaim).toHaveBeenCalledTimes(1);
  });

  it("calls onCheckEligibility when button is clicked", () => {
    const mockOnCheck = jest.fn();
    render(
      <AirdropCard
        {...mockProps}
        onCheckEligibility={mockOnCheck}
      />
    );

    const checkButton = screen.getByText("Check Eligibility");
    fireEvent.click(checkButton);

    expect(mockOnCheck).toHaveBeenCalledTimes(1);
  });

  it("does not show claim button for ended airdrops", () => {
    render(
      <AirdropCard
        {...mockProps}
        status="ended"
        eligibility={true}
        onClaim={jest.fn()}
      />
    );

    expect(screen.queryByText("Claim Airdrop")).not.toBeInTheDocument();
  });

  it("renders logo when provided", () => {
    render(<AirdropCard {...mockProps} logo="https://example.com/logo.png" />);
    const logo = screen.getByAlt("Test Airdrop");
    expect(logo).toBeInTheDocument();
  });
});

