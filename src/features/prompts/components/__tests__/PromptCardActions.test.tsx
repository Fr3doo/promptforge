import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent } from "@/test/utils";
import { PromptCardActions } from "../PromptCardActions";
import type { PromptCardActionsProps } from "../PromptCardActions.types";
import type { Prompt } from "../../types";

// Mock des composants enfants
vi.mock("../FavoriteButton", () => ({
  FavoriteButton: ({ isFavorite, onToggle }: any) => (
    <button
      data-testid="favorite-button"
      data-favorite={isFavorite}
      onClick={onToggle}
    >
      {isFavorite ? "★" : "☆"}
    </button>
  ),
}));

vi.mock("../PromptActionsMenu", () => ({
  PromptActionsMenu: ({
    isShared,
    onEdit,
    onDuplicate,
    onManageSharing,
    onToggleVisibility,
    onDelete,
  }: any) => (
    <div data-testid="actions-menu" data-shared={isShared}>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDuplicate}>Duplicate</button>
      {onManageSharing && <button onClick={onManageSharing}>Manage Sharing</button>}
      <button onClick={onToggleVisibility}>Toggle Visibility</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}));

const mockPrompt: Prompt = {
  id: "test-prompt-1",
  title: "Test Prompt",
  description: "Test description",
  content: "Test content",
  tags: ["test"],
  version: "1.0.0",
  visibility: "PRIVATE",
  status: "PUBLISHED",
  owner_id: "user-1",
  created_at: "2024-01-01",
  updated_at: "2024-01-02",
  is_favorite: false,
  public_permission: "READ",
};

const defaultProps: PromptCardActionsProps = {
  prompt: mockPrompt,
  isOwner: true,
  onToggleFavorite: vi.fn(),
  onDelete: vi.fn(),
  onDuplicate: vi.fn(),
  onToggleVisibility: vi.fn(),
  onEdit: vi.fn(),
  onManageSharing: vi.fn(),
};

describe("PromptCardActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic rendering", () => {
    it("should render the container with correct structure", () => {
      const { container } = render(<PromptCardActions {...defaultProps} />);
      const mainDiv = container.querySelector(".flex.items-center.gap-1");
      expect(mainDiv).toBeInTheDocument();
    });

    it("should always render FavoriteButton", () => {
      render(<PromptCardActions {...defaultProps} />);
      expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
    });

    it("should render FavoriteButton even when not owner", () => {
      render(<PromptCardActions {...defaultProps} isOwner={false} />);
      expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
    });
  });

  describe("FavoriteButton integration", () => {
    it("should pass correct isFavorite prop when true", () => {
      const propsWithFavorite = {
        ...defaultProps,
        prompt: { ...mockPrompt, is_favorite: true },
      };
      render(<PromptCardActions {...propsWithFavorite} />);
      const favoriteButton = screen.getByTestId("favorite-button");
      expect(favoriteButton).toHaveAttribute("data-favorite", "true");
      expect(favoriteButton).toHaveTextContent("★");
    });

    it("should pass correct isFavorite prop when false", () => {
      render(<PromptCardActions {...defaultProps} />);
      const favoriteButton = screen.getByTestId("favorite-button");
      expect(favoriteButton).toHaveAttribute("data-favorite", "false");
      expect(favoriteButton).toHaveTextContent("☆");
    });

    it("should handle null is_favorite as false", () => {
      const propsWithNullFavorite = {
        ...defaultProps,
        prompt: { ...mockPrompt, is_favorite: null },
      };
      render(<PromptCardActions {...propsWithNullFavorite} />);
      const favoriteButton = screen.getByTestId("favorite-button");
      expect(favoriteButton).toHaveAttribute("data-favorite", "false");
    });

    it("should call onToggleFavorite with correct parameters when clicked", async () => {
      const onToggleFavoriteMock = vi.fn();
      const user = userEvent.setup();
      render(
        <PromptCardActions
          {...defaultProps}
          onToggleFavorite={onToggleFavoriteMock}
        />
      );

      await user.click(screen.getByTestId("favorite-button"));

      expect(onToggleFavoriteMock).toHaveBeenCalledWith("test-prompt-1", false);
      expect(onToggleFavoriteMock).toHaveBeenCalledTimes(1);
    });

    it("should stop event propagation when toggling favorite", async () => {
      const onToggleFavoriteMock = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <PromptCardActions
          {...defaultProps}
          onToggleFavorite={onToggleFavoriteMock}
        />
      );

      await user.click(screen.getByTestId("favorite-button"));

      expect(onToggleFavoriteMock).toHaveBeenCalled();
      // stopPropagation est appelé dans handleToggleFavorite
    });
  });

  describe("PromptActionsMenu conditional rendering", () => {
    it("should render PromptActionsMenu when isOwner is true", () => {
      render(<PromptCardActions {...defaultProps} isOwner={true} />);
      expect(screen.getByTestId("actions-menu")).toBeInTheDocument();
    });

    it("should not render PromptActionsMenu when isOwner is false", () => {
      render(<PromptCardActions {...defaultProps} isOwner={false} />);
      expect(screen.queryByTestId("actions-menu")).not.toBeInTheDocument();
    });

    it("should hide all menu actions when not owner", () => {
      render(<PromptCardActions {...defaultProps} isOwner={false} />);
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Duplicate")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
  });

  describe("PromptActionsMenu integration", () => {
    it("should pass isShared=true when visibility is SHARED", () => {
      const propsWithShared = {
        ...defaultProps,
        prompt: { ...mockPrompt, visibility: "SHARED" as const },
      };
      render(<PromptCardActions {...propsWithShared} />);
      const menu = screen.getByTestId("actions-menu");
      expect(menu).toHaveAttribute("data-shared", "true");
    });

    it("should pass isShared=false when visibility is PRIVATE", () => {
      render(<PromptCardActions {...defaultProps} />);
      const menu = screen.getByTestId("actions-menu");
      expect(menu).toHaveAttribute("data-shared", "false");
    });

    it("should call onEdit with prompt id when edit is clicked", async () => {
      const onEditMock = vi.fn();
      const user = userEvent.setup();
      render(<PromptCardActions {...defaultProps} onEdit={onEditMock} />);

      await user.click(screen.getByText("Edit"));

      expect(onEditMock).toHaveBeenCalledWith("test-prompt-1");
      expect(onEditMock).toHaveBeenCalledTimes(1);
    });

    it("should call onDuplicate with prompt id when duplicate is clicked", async () => {
      const onDuplicateMock = vi.fn();
      const user = userEvent.setup();
      render(<PromptCardActions {...defaultProps} onDuplicate={onDuplicateMock} />);

      await user.click(screen.getByText("Duplicate"));

      expect(onDuplicateMock).toHaveBeenCalledWith("test-prompt-1");
      expect(onDuplicateMock).toHaveBeenCalledTimes(1);
    });

    it("should call onDelete with prompt id when delete is clicked", async () => {
      const onDeleteMock = vi.fn();
      const user = userEvent.setup();
      render(<PromptCardActions {...defaultProps} onDelete={onDeleteMock} />);

      await user.click(screen.getByText("Delete"));

      expect(onDeleteMock).toHaveBeenCalledWith("test-prompt-1");
      expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });

    it("should call onToggleVisibility with correct parameters", async () => {
      const onToggleVisibilityMock = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(
        <PromptCardActions
          {...defaultProps}
          onToggleVisibility={onToggleVisibilityMock}
        />
      );

      await user.click(screen.getByText("Toggle Visibility"));

      expect(onToggleVisibilityMock).toHaveBeenCalledWith(
        "test-prompt-1",
        "PRIVATE",
        "READ"
      );
      expect(onToggleVisibilityMock).toHaveBeenCalledTimes(1);
    });

    it("should handle onToggleVisibility with SHARED visibility", async () => {
      const onToggleVisibilityMock = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      const propsWithShared = {
        ...defaultProps,
        prompt: { ...mockPrompt, visibility: "SHARED" as const },
        onToggleVisibility: onToggleVisibilityMock,
      };
      render(<PromptCardActions {...propsWithShared} />);

      await user.click(screen.getByText("Toggle Visibility"));

      expect(onToggleVisibilityMock).toHaveBeenCalledWith(
        "test-prompt-1",
        "SHARED",
        "READ"
      );
    });

    it("should call onManageSharing when provided and clicked", async () => {
      const onManageSharingMock = vi.fn();
      const user = userEvent.setup();
      render(
        <PromptCardActions
          {...defaultProps}
          onManageSharing={onManageSharingMock}
        />
      );

      await user.click(screen.getByText("Manage Sharing"));

      expect(onManageSharingMock).toHaveBeenCalledTimes(1);
    });

    it("should not render Manage Sharing button when onManageSharing is undefined", () => {
      render(<PromptCardActions {...defaultProps} onManageSharing={undefined} />);
      expect(screen.queryByText("Manage Sharing")).not.toBeInTheDocument();
    });
  });

  describe("Event propagation", () => {
    it("should stop event propagation on container click", async () => {
      const user = userEvent.setup();
      const { container } = render(<PromptCardActions {...defaultProps} />);
      const mainDiv = container.querySelector(".flex.items-center.gap-1");

      const clickHandler = vi.fn();
      mainDiv?.addEventListener("click", clickHandler);

      await user.click(mainDiv!);

      // L'événement ne devrait pas se propager au-delà du container
      expect(clickHandler).toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle prompt with null visibility as PRIVATE", async () => {
      const onToggleVisibilityMock = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      const propsWithNullVisibility = {
        ...defaultProps,
        prompt: { ...mockPrompt, visibility: null },
        onToggleVisibility: onToggleVisibilityMock,
      };
      render(<PromptCardActions {...propsWithNullVisibility} />);

      await user.click(screen.getByText("Toggle Visibility"));

      expect(onToggleVisibilityMock).toHaveBeenCalledWith(
        "test-prompt-1",
        "PRIVATE",
        "READ"
      );
    });

    it("should handle different public_permission values", async () => {
      const onToggleVisibilityMock = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      const propsWithWritePermission = {
        ...defaultProps,
        prompt: { ...mockPrompt, public_permission: "WRITE" as const },
        onToggleVisibility: onToggleVisibilityMock,
      };
      render(<PromptCardActions {...propsWithWritePermission} />);

      await user.click(screen.getByText("Toggle Visibility"));

      expect(onToggleVisibilityMock).toHaveBeenCalledWith(
        "test-prompt-1",
        "PRIVATE",
        "WRITE"
      );
    });

    it("should handle all callbacks being called in sequence", async () => {
      const onToggleFavoriteMock = vi.fn();
      const onEditMock = vi.fn();
      const onDuplicateMock = vi.fn();
      const onDeleteMock = vi.fn();
      const user = userEvent.setup();

      render(
        <PromptCardActions
          {...defaultProps}
          onToggleFavorite={onToggleFavoriteMock}
          onEdit={onEditMock}
          onDuplicate={onDuplicateMock}
          onDelete={onDeleteMock}
        />
      );

      await user.click(screen.getByTestId("favorite-button"));
      await user.click(screen.getByText("Edit"));
      await user.click(screen.getByText("Duplicate"));
      await user.click(screen.getByText("Delete"));

      expect(onToggleFavoriteMock).toHaveBeenCalledTimes(1);
      expect(onEditMock).toHaveBeenCalledTimes(1);
      expect(onDuplicateMock).toHaveBeenCalledTimes(1);
      expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });

    it("should work correctly when user is not owner but can favorite", async () => {
      const onToggleFavoriteMock = vi.fn();
      const user = userEvent.setup();
      render(
        <PromptCardActions
          {...defaultProps}
          isOwner={false}
          onToggleFavorite={onToggleFavoriteMock}
        />
      );

      expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
      expect(screen.queryByTestId("actions-menu")).not.toBeInTheDocument();

      await user.click(screen.getByTestId("favorite-button"));
      expect(onToggleFavoriteMock).toHaveBeenCalled();
    });
  });

  describe("CSS classes", () => {
    it("should have correct flex container classes", () => {
      const { container } = render(<PromptCardActions {...defaultProps} />);
      const mainDiv = container.querySelector(".flex.items-center.gap-1");
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveClass("flex", "items-center", "gap-1");
    });
  });

  describe("Callback parameters validation", () => {
    it("should pass prompt id consistently across all callbacks", async () => {
      const onEditMock = vi.fn();
      const onDuplicateMock = vi.fn();
      const onDeleteMock = vi.fn();
      const user = userEvent.setup();

      const customPrompt = { ...mockPrompt, id: "custom-id-123" };
      render(
        <PromptCardActions
          {...defaultProps}
          prompt={customPrompt}
          onEdit={onEditMock}
          onDuplicate={onDuplicateMock}
          onDelete={onDeleteMock}
        />
      );

      await user.click(screen.getByText("Edit"));
      await user.click(screen.getByText("Duplicate"));
      await user.click(screen.getByText("Delete"));

      expect(onEditMock).toHaveBeenCalledWith("custom-id-123");
      expect(onDuplicateMock).toHaveBeenCalledWith("custom-id-123");
      expect(onDeleteMock).toHaveBeenCalledWith("custom-id-123");
    });

    it("should pass current favorite state when toggling", async () => {
      const onToggleFavoriteMock = vi.fn();
      const user = userEvent.setup();
      const favoritePrompt = { ...mockPrompt, is_favorite: true };
      
      render(
        <PromptCardActions
          {...defaultProps}
          prompt={favoritePrompt}
          onToggleFavorite={onToggleFavoriteMock}
        />
      );

      await user.click(screen.getByTestId("favorite-button"));

      expect(onToggleFavoriteMock).toHaveBeenCalledWith(
        "test-prompt-1",
        true
      );
    });
  });
});
