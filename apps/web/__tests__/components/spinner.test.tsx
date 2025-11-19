import { render } from "@testing-library/react";
import { Spinner } from "@/components/ui/Spinner";

describe("Spinner", () => {
  it("renders spinner", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('[role="status"]');

    expect(spinner).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { container, rerender } = render(<Spinner size="sm" />);
    expect(container.firstChild).toHaveClass("h-4");

    rerender(<Spinner size="lg" />);
    expect(container.firstChild).toHaveClass("h-12");
  });

  it("applies custom className", () => {
    const { container } = render(<Spinner className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has accessible label", () => {
    const { getByText } = render(<Spinner />);
    expect(getByText("Loading...")).toBeInTheDocument();
  });
});
