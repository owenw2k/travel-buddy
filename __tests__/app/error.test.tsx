import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AppError from "@/app/error";

describe("Error", () => {
  const mockRetry = jest.fn();
  const mockError = new globalThis.Error("test error");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the error heading", () => {
    render(<AppError error={mockError} unstable_retry={mockRetry} />);
    expect(screen.getByRole("heading")).toHaveTextContent("Something went sideways.");
  });

  it("renders a try again button", () => {
    render(<AppError error={mockError} unstable_retry={mockRetry} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls unstable_retry when try again is clicked", async () => {
    render(<AppError error={mockError} unstable_retry={mockRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("renders a link back to the map", () => {
    render(<AppError error={mockError} unstable_retry={mockRetry} />);
    const link = screen.getByRole("link", { name: /back to the map/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
