import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ZoomControls } from "@/components/ZoomControls";

describe("ZoomControls", () => {
  it("renders zoom in, zoom out, and reset buttons", () => {
    render(<ZoomControls onZoomIn={jest.fn()} onZoomOut={jest.fn()} onReset={jest.fn()} />);
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset zoom/i })).toBeInTheDocument();
  });

  it("calls onZoomIn when the zoom in button is clicked", async () => {
    const onZoomIn = jest.fn();
    render(<ZoomControls onZoomIn={onZoomIn} onZoomOut={jest.fn()} onReset={jest.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /zoom in/i }));
    expect(onZoomIn).toHaveBeenCalledTimes(1);
  });

  it("calls onZoomOut when the zoom out button is clicked", async () => {
    const onZoomOut = jest.fn();
    render(<ZoomControls onZoomIn={jest.fn()} onZoomOut={onZoomOut} onReset={jest.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /zoom out/i }));
    expect(onZoomOut).toHaveBeenCalledTimes(1);
  });

  it("calls onReset when the reset button is clicked", async () => {
    const onReset = jest.fn();
    render(<ZoomControls onZoomIn={jest.fn()} onZoomOut={jest.fn()} onReset={onReset} />);
    await userEvent.click(screen.getByRole("button", { name: /reset zoom/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
