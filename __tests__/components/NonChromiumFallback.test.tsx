import { render, screen } from "@testing-library/react";

import { NonChromiumFallback } from "@/components/NonChromiumFallback";

describe("NonChromiumFallback", () => {
  it("renders the wrong browser heading", () => {
    render(<NonChromiumFallback />);
    expect(screen.getByRole("heading")).toHaveTextContent("Wrong browser, adventurer.");
  });

  it("renders a link to download Chrome", () => {
    render(<NonChromiumFallback />);
    const link = screen.getByRole("link", { name: /get chrome/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://www.google.com/chrome/");
  });

  it("mentions Chromium-based browsers in the description", () => {
    render(<NonChromiumFallback />);
    expect(screen.getByText(/chromium-based browsers/i)).toBeInTheDocument();
  });
});
