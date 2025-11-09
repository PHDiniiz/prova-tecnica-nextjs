import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input Component", () => {
  it("renders label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });
});