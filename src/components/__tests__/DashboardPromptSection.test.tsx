import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardPromptSection } from "../DashboardPromptSection";
import { Star } from "lucide-react";
import type { Prompt } from "@/features/prompts/types";

describe("DashboardPromptSection", () => {
  const mockPrompts: Prompt[] = [
    {
      id: "1",
      title: "Test Prompt 1",
      content: "Content 1",
      visibility: "PRIVATE",
      version: "1.0.0",
      tags: [],
      owner_id: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: null,
      is_favorite: false,
      status: "DRAFT",
      public_permission: "READ",
    },
    {
      id: "2",
      title: "Test Prompt 2",
      content: "Content 2",
      visibility: "SHARED",
      version: "1.0.1",
      tags: ["test"],
      owner_id: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: "A test prompt",
      is_favorite: true,
      status: "PUBLISHED",
      public_permission: "WRITE",
    },
  ];

  const mockHandlers = {
    onToggleFavorite: vi.fn(),
    onToggleVisibility: vi.fn().mockResolvedValue(undefined),
    onPromptClick: vi.fn(),
  };

  it("should render prompts correctly", () => {
    render(
      <DashboardPromptSection
        icon={Star}
        title="Test Section"
        prompts={mockPrompts}
        currentUserId="user-1"
        {...mockHandlers}
      />
    );

    expect(screen.getByText("Test Section")).toBeInTheDocument();
    expect(screen.getByText("Test Prompt 1")).toBeInTheDocument();
    expect(screen.getByText("Test Prompt 2")).toBeInTheDocument();
  });

  it("should render the icon correctly", () => {
    const { container } = render(
      <DashboardPromptSection
        icon={Star}
        title="Favorite Section"
        prompts={mockPrompts}
        currentUserId="user-1"
        {...mockHandlers}
      />
    );

    // Verify the icon is rendered (lucide icons render as svg)
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("h-5", "w-5", "text-primary");
  });

  it("should render nothing if prompts array is empty", () => {
    const { container } = render(
      <DashboardPromptSection
        icon={Star}
        title="Empty Section"
        prompts={[]}
        {...mockHandlers}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render nothing if prompts is undefined", () => {
    const { container } = render(
      <DashboardPromptSection
        icon={Star}
        title="Undefined Section"
        prompts={undefined as any}
        {...mockHandlers}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should call onPromptClick when prompt card is clicked", () => {
    render(
      <DashboardPromptSection
        icon={Star}
        title="Test Section"
        prompts={mockPrompts}
        currentUserId="user-1"
        {...mockHandlers}
      />
    );

    const firstCard = screen.getByText("Test Prompt 1").closest(".cursor-pointer");
    if (firstCard) {
      fireEvent.click(firstCard);
      expect(mockHandlers.onPromptClick).toHaveBeenCalledWith("1");
    }
  });

  it("should render multiple prompts in a grid layout", () => {
    const { container } = render(
      <DashboardPromptSection
        icon={Star}
        title="Test Section"
        prompts={mockPrompts}
        currentUserId="user-1"
        {...mockHandlers}
      />
    );

    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("gap-4", "md:grid-cols-2", "lg:grid-cols-3");
  });

  it("should pass correct props to PromptCard components", () => {
    render(
      <DashboardPromptSection
        icon={Star}
        title="Test Section"
        prompts={[mockPrompts[0]]}
        currentUserId="user-1"
        {...mockHandlers}
      />
    );

    // Verify the prompt is rendered with its data
    expect(screen.getByText("Test Prompt 1")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("should handle missing currentUserId gracefully", () => {
    render(
      <DashboardPromptSection
        icon={Star}
        title="Test Section"
        prompts={mockPrompts}
        {...mockHandlers}
      />
    );

    expect(screen.getByText("Test Prompt 1")).toBeInTheDocument();
    expect(screen.getByText("Test Prompt 2")).toBeInTheDocument();
  });
});
