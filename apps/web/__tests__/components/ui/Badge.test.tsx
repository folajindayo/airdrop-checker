import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children correctly", () => {
    render(<Badge>Badge Text</Badge>);
    expect(screen.getByText("Badge Text")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass("bg-gray-100");
    expect(container.firstChild).toHaveClass("text-gray-800");
  });

  it("applies success variant styles", () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    expect(container.firstChild).toHaveClass("bg-green-100");
    expect(container.firstChild).toHaveClass("text-green-800");
  });

  it("applies error variant styles", () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    expect(container.firstChild).toHaveClass("bg-red-100");
    expect(container.firstChild).toHaveClass("text-red-800");
  });

  it("applies warning variant styles", () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    expect(container.firstChild).toHaveClass("bg-yellow-100");
    expect(container.firstChild).toHaveClass("text-yellow-800");
  });

  it("applies info variant styles", () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    expect(container.firstChild).toHaveClass("bg-blue-100");
    expect(container.firstChild).toHaveClass("text-blue-800");
  });

  it("applies correct size styles", () => {
    const { container, rerender } = render(<Badge size="sm">Small</Badge>);
    expect(container.firstChild).toHaveClass("text-xs");

    rerender(<Badge size="md">Medium</Badge>);
    expect(container.firstChild).toHaveClass("text-sm");

    rerender(<Badge size="lg">Large</Badge>);
    expect(container.firstChild).toHaveClass("text-base");
  });

  it("applies custom className", () => {
    const { container } = render(<Badge className="custom-class">Badge</Badge>);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders as span element", () => {
    const { container } = render(<Badge>Badge</Badge>);
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});

