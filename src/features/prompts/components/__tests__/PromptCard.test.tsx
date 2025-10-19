import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/utils";
import { PromptCard } from "../PromptCard";

const mockPrompt = {
  id: "1",
  title: "Test Prompt",
  description: "Test description",
  content: "Test content",
  tags: ["test", "prompt"],
  visibility: "PRIVATE" as const,
  is_favorite: false,
  version: "1.0.0",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  owner_id: "user-1",
};

describe("PromptCard", () => {
  it("should render prompt information", () => {
    const onToggleFavorite = vi.fn();
    const onClick = vi.fn();

    render(
      <PromptCard
        prompt={mockPrompt}
        onToggleFavorite={onToggleFavorite}
        onClick={onClick}
      />
    );

    expect(screen.getByText("Test Prompt")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("Privé")).toBeInTheDocument();
  });

  it("should call onClick when card is clicked", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    const onClick = vi.fn();

    render(
      <PromptCard
        prompt={mockPrompt}
        onToggleFavorite={onToggleFavorite}
        onClick={onClick}
      />
    );

    const card = screen.getByText("Test Prompt").closest(".cursor-pointer");
    if (card) {
      await user.click(card);
      expect(onClick).toHaveBeenCalled();
    }
  });

  it("should toggle favorite without triggering card click", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    const onClick = vi.fn();

    render(
      <PromptCard
        prompt={mockPrompt}
        onToggleFavorite={onToggleFavorite}
        onClick={onClick}
      />
    );

    const starButton = screen.getByRole("button");
    await user.click(starButton);

    expect(onToggleFavorite).toHaveBeenCalledWith("1", false);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("should display favorite star when is_favorite is true", () => {
    const onToggleFavorite = vi.fn();
    const onClick = vi.fn();

    render(
      <PromptCard
        prompt={{ ...mockPrompt, is_favorite: true }}
        onToggleFavorite={onToggleFavorite}
        onClick={onClick}
      />
    );

    const star = screen.getByRole("button").querySelector("svg");
    expect(star).toHaveClass("fill-accent");
  });

  it("should show 'Aucune description' when description is empty", () => {
    const onToggleFavorite = vi.fn();
    const onClick = vi.fn();

    render(
      <PromptCard
        prompt={{ ...mockPrompt, description: null }}
        onToggleFavorite={onToggleFavorite}
        onClick={onClick}
      />
    );

    expect(screen.getByText("Aucune description")).toBeInTheDocument();
  });

  it("should show shared visibility correctly", () => {
    const onToggleFavorite = vi.fn();
    const onClick = vi.fn();

    render(
      <PromptCard
        prompt={{ ...mockPrompt, visibility: "SHARED" }}
        onToggleFavorite={onToggleFavorite}
        onClick={onClick}
      />
    );

    expect(screen.getByText("Partagé")).toBeInTheDocument();
  });

  it("should show +N badge when more than 3 tags", () => {
    const onToggleFavorite = vi.fn();
    const onClick = vi.fn();

    render(
      <PromptCard
        prompt={{ ...mockPrompt, tags: ["tag1", "tag2", "tag3", "tag4", "tag5"] }}
        onToggleFavorite={onToggleFavorite}
        onClick={onClick}
      />
    );

    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});
