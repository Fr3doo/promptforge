import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptListActionsItem } from "../PromptListActions";
import type { PromptListActionsItemProps } from "../PromptListActions";
import type { Prompt } from "../../types";

// Mock PromptCard
vi.mock("../PromptCard", () => ({
  PromptCard: ({
    prompt,
    index,
    onToggleFavorite,
    onDelete,
    onDuplicate,
    onToggleVisibility,
    onClick,
    currentUserId,
  }: any) => (
    <div data-testid={`prompt-card-${prompt.id}`}>
      <h3>{prompt.title}</h3>
      <span data-testid="prompt-index">{index}</span>
      <span data-testid="current-user">{currentUserId}</span>
      <button onClick={onClick} data-testid="click-button">
        Click
      </button>
      <button
        onClick={() => onToggleFavorite(prompt.id, prompt.is_favorite)}
        data-testid="favorite-button"
      >
        Favorite
      </button>
      {onDelete && (
        <button onClick={() => onDelete(prompt.id)} data-testid="delete-button">
          Delete
        </button>
      )}
      {onDuplicate && (
        <button
          onClick={() => onDuplicate(prompt.id)}
          data-testid="duplicate-button"
        >
          Duplicate
        </button>
      )}
      {onToggleVisibility && (
        <button
          onClick={() =>
            onToggleVisibility(prompt.id, prompt.visibility, "READ")
          }
          data-testid="visibility-button"
        >
          Toggle Visibility
        </button>
      )}
    </div>
  ),
}));

const mockPrompt: Prompt = {
  id: "prompt-123",
  title: "Test Prompt",
  content: "Test content",
  description: "Test description",
  tags: ["test"],
  is_favorite: false,
  visibility: "PRIVATE",
  public_permission: "READ",
  owner_id: "user-456",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  status: "PUBLISHED",
  version: "1.0.0",
};

const defaultProps: PromptListActionsItemProps = {
  prompt: mockPrompt,
  index: 0,
  onPromptClick: vi.fn(),
  onToggleFavorite: vi.fn(),
  currentUserId: "user-456",
};

describe("PromptListActionsItem", () => {
  describe("Rendu de PromptCard", () => {
    it("passe toutes les props requises à PromptCard correctement", () => {
      render(<PromptListActionsItem {...defaultProps} />);

      expect(screen.getByTestId("prompt-card-prompt-123")).toBeInTheDocument();
      expect(screen.getByText("Test Prompt")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-index")).toHaveTextContent("0");
      expect(screen.getByTestId("current-user")).toHaveTextContent("user-456");
    });

    it("gère l'index pour les animations", () => {
      const { rerender } = render(
        <PromptListActionsItem {...defaultProps} index={5} />
      );

      expect(screen.getByTestId("prompt-index")).toHaveTextContent("5");

      rerender(<PromptListActionsItem {...defaultProps} index={10} />);

      expect(screen.getByTestId("prompt-index")).toHaveTextContent("10");
    });

    it("passe les props optionnels seulement s'ils sont fournis", () => {
      const { rerender } = render(<PromptListActionsItem {...defaultProps} />);

      // Sans callbacks optionnels
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("duplicate-button")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("visibility-button")
      ).not.toBeInTheDocument();

      // Avec callbacks optionnels
      rerender(
        <PromptListActionsItem
          {...defaultProps}
          onDelete={vi.fn()}
          onDuplicate={vi.fn()}
          onToggleVisibility={vi.fn()}
        />
      );

      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
      expect(screen.getByTestId("duplicate-button")).toBeInTheDocument();
      expect(screen.getByTestId("visibility-button")).toBeInTheDocument();
    });
  });

  describe("Callbacks - onPromptClick", () => {
    it("appelle onPromptClick avec le bon ID au clic", async () => {
      const user = userEvent.setup();
      const onPromptClick = vi.fn();

      render(
        <PromptListActionsItem {...defaultProps} onPromptClick={onPromptClick} />
      );

      await user.click(screen.getByTestId("click-button"));

      expect(onPromptClick).toHaveBeenCalledTimes(1);
      expect(onPromptClick).toHaveBeenCalledWith("prompt-123");
    });

    it("appelle onPromptClick avec le bon ID pour différents prompts", async () => {
      const user = userEvent.setup();
      const onPromptClick = vi.fn();

      const promptA = { ...mockPrompt, id: "prompt-A" };
      const promptB = { ...mockPrompt, id: "prompt-B" };

      const { rerender } = render(
        <PromptListActionsItem
          {...defaultProps}
          prompt={promptA}
          onPromptClick={onPromptClick}
        />
      );

      await user.click(screen.getByTestId("click-button"));
      expect(onPromptClick).toHaveBeenCalledWith("prompt-A");

      rerender(
        <PromptListActionsItem
          {...defaultProps}
          prompt={promptB}
          onPromptClick={onPromptClick}
        />
      );

      await user.click(screen.getByTestId("click-button"));
      expect(onPromptClick).toHaveBeenCalledWith("prompt-B");
    });
  });

  describe("Callbacks - onToggleFavorite", () => {
    it("transmet onToggleFavorite correctement à PromptCard", async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn();

      render(
        <PromptListActionsItem
          {...defaultProps}
          onToggleFavorite={onToggleFavorite}
        />
      );

      await user.click(screen.getByTestId("favorite-button"));

      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
      expect(onToggleFavorite).toHaveBeenCalledWith("prompt-123", false);
    });

    it("gère les changements d'état de is_favorite", async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn();

      const favoritePrompt = { ...mockPrompt, is_favorite: true };

      render(
        <PromptListActionsItem
          {...defaultProps}
          prompt={favoritePrompt}
          onToggleFavorite={onToggleFavorite}
        />
      );

      await user.click(screen.getByTestId("favorite-button"));

      expect(onToggleFavorite).toHaveBeenCalledWith("prompt-123", true);
    });
  });

  describe("Callbacks optionnels - onDelete", () => {
    it("transmet onDelete correctement quand fourni", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(
        <PromptListActionsItem {...defaultProps} onDelete={onDelete} />
      );

      await user.click(screen.getByTestId("delete-button"));

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith("prompt-123");
    });

    it("n'affiche pas le bouton delete si onDelete n'est pas fourni", () => {
      render(<PromptListActionsItem {...defaultProps} />);

      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
    });
  });

  describe("Callbacks optionnels - onDuplicate", () => {
    it("transmet onDuplicate correctement quand fourni", async () => {
      const user = userEvent.setup();
      const onDuplicate = vi.fn();

      render(
        <PromptListActionsItem {...defaultProps} onDuplicate={onDuplicate} />
      );

      await user.click(screen.getByTestId("duplicate-button"));

      expect(onDuplicate).toHaveBeenCalledTimes(1);
      expect(onDuplicate).toHaveBeenCalledWith("prompt-123");
    });

    it("n'affiche pas le bouton duplicate si onDuplicate n'est pas fourni", () => {
      render(<PromptListActionsItem {...defaultProps} />);

      expect(screen.queryByTestId("duplicate-button")).not.toBeInTheDocument();
    });
  });

  describe("Callbacks optionnels - onToggleVisibility", () => {
    it("transmet onToggleVisibility correctement quand fourni", async () => {
      const user = userEvent.setup();
      const onToggleVisibility = vi.fn();

      render(
        <PromptListActionsItem
          {...defaultProps}
          onToggleVisibility={onToggleVisibility}
        />
      );

      await user.click(screen.getByTestId("visibility-button"));

      expect(onToggleVisibility).toHaveBeenCalledTimes(1);
      expect(onToggleVisibility).toHaveBeenCalledWith(
        "prompt-123",
        "PRIVATE",
        "READ"
      );
    });

    it("gère différents états de visibilité", async () => {
      const user = userEvent.setup();
      const onToggleVisibility = vi.fn();

      const sharedPrompt = { ...mockPrompt, visibility: "SHARED" as const };

      render(
        <PromptListActionsItem
          {...defaultProps}
          prompt={sharedPrompt}
          onToggleVisibility={onToggleVisibility}
        />
      );

      await user.click(screen.getByTestId("visibility-button"));

      expect(onToggleVisibility).toHaveBeenCalledWith(
        "prompt-123",
        "SHARED",
        "READ"
      );
    });

    it("n'affiche pas le bouton visibility si onToggleVisibility n'est pas fourni", () => {
      render(<PromptListActionsItem {...defaultProps} />);

      expect(
        screen.queryByTestId("visibility-button")
      ).not.toBeInTheDocument();
    });
  });

  describe("Métadonnées - currentUserId", () => {
    it("transmet currentUserId correctement", () => {
      render(
        <PromptListActionsItem {...defaultProps} currentUserId="user-789" />
      );

      expect(screen.getByTestId("current-user")).toHaveTextContent("user-789");
    });

    it("gère currentUserId undefined", () => {
      render(
        <PromptListActionsItem {...defaultProps} currentUserId={undefined} />
      );

      expect(screen.getByTestId("current-user")).toHaveTextContent("");
    });
  });

  describe("Cas d'usage complets", () => {
    it("gère tous les callbacks en même temps", async () => {
      const user = userEvent.setup();
      const callbacks = {
        onPromptClick: vi.fn(),
        onToggleFavorite: vi.fn(),
        onDelete: vi.fn(),
        onDuplicate: vi.fn(),
        onToggleVisibility: vi.fn(),
      };

      render(<PromptListActionsItem {...defaultProps} {...callbacks} />);

      // Test de tous les callbacks
      await user.click(screen.getByTestId("click-button"));
      expect(callbacks.onPromptClick).toHaveBeenCalledWith("prompt-123");

      await user.click(screen.getByTestId("favorite-button"));
      expect(callbacks.onToggleFavorite).toHaveBeenCalledWith(
        "prompt-123",
        false
      );

      await user.click(screen.getByTestId("delete-button"));
      expect(callbacks.onDelete).toHaveBeenCalledWith("prompt-123");

      await user.click(screen.getByTestId("duplicate-button"));
      expect(callbacks.onDuplicate).toHaveBeenCalledWith("prompt-123");

      await user.click(screen.getByTestId("visibility-button"));
      expect(callbacks.onToggleVisibility).toHaveBeenCalledWith(
        "prompt-123",
        "PRIVATE",
        "READ"
      );
    });

    it("affiche correctement une carte de prompt partagé avec toutes les métadonnées", () => {
      const sharedPrompt: Prompt = {
        ...mockPrompt,
        visibility: "SHARED",
        public_permission: "WRITE",
        owner_id: "user-different",
      };

      render(
        <PromptListActionsItem
          {...defaultProps}
          prompt={sharedPrompt}
          index={3}
          currentUserId="user-456"
          onDelete={vi.fn()}
          onDuplicate={vi.fn()}
          onToggleVisibility={vi.fn()}
        />
      );

      expect(screen.getByText("Test Prompt")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-index")).toHaveTextContent("3");
      expect(screen.getByTestId("current-user")).toHaveTextContent("user-456");
      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
      expect(screen.getByTestId("duplicate-button")).toBeInTheDocument();
      expect(screen.getByTestId("visibility-button")).toBeInTheDocument();
    });
  });
});
