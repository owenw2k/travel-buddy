import { render, screen } from "@testing-library/react";

import NotFound from "@/app/not-found";

describe("NotFound", () => {
  it("renders the not-found heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading")).toHaveTextContent("This route doesn't exist.");
  });

  it("renders a link back to the map", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /back to the map/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
