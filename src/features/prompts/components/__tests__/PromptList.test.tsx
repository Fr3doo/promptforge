import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptList } from "../PromptList";
import type { Prompt } from "../../types";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock PromptListView
vi.mock("../PromptListView", () => ({
  PromptListView: ({
    prompts,
    isLoading,
    isEmpty,
    loadingComponent,
    emptyComponent,
    children,
  }: any) => {
    if (isLoading) return <div data-testid="loading-view">{loadingComponent}</div>;
    if (isEmpty) return <div data-testid="empty-view">{emptyComponent}</div>;
    return <div data-testid="grid-view">{children}</div>;
  },
}));

// Mock PromptListActionsItem
vi.mock("../PromptListActions", () => ({
  PromptListActionsItem: ({
    prompt,
    index,
    onPromptClick,
    onToggleFavorite,
    onDelete,
    onDuplicate,
    onToggleVisibility,
    currentUserId,
  }: any) => (
    <div data-testid={`prompt-item-${prompt.id}`}>
      <h3>{prompt.title}</h3>
      <span data-testid="index">{index}</span>
      <button onClick={() => onPromptClick(prompt.id)} data-testid="click-btn">
        Open
      </button>
      <button
        onClick={() => onToggleFavorite(prompt.id, prompt.is_favorite)}
        data-testid="favorite-btn"
      >
        Favorite
      </button>
      {onDelete && (
        <button onClick={() => onDelete(prompt.id)} data-testid="delete-btn">
          Delete
        </button>
      )}
      {onDuplicate && (
        <button onClick={() => onDuplicate(prompt.id)} data-testid="duplicate-btn">
          Duplicate
        </button>
      )}
      {onToggleVisibility && (
        <button
          onClick={() => onToggleVisibility(prompt.id, prompt.visibility, "READ")}
          data-testid="visibility-btn"
        >
          Visibility
        </button>
      )}
      <span data-testid="user-id">{currentUserId}</span>
    </div>
  ),
}));

// Mock PromptListSkeleton
vi.mock("@/components/PromptCardSkeleton", () => ({
  PromptListSkeleton: () => <div data-testid="skeleton">Loading skeletons...</div>,
}));

// Mock EmptyPromptState
vi.mock("../EmptyPromptState", () => ({
  EmptyPromptState: ({ emptySearchState, isSharedSection }: any) => (
    <div data-testid="empty-state">
      <span data-testid="empty-search">{String(emptySearchState)}</span>
      <span data-testid="is-shared">{String(isSharedSection)}</span>
    </div>
  ),
}));

const mockPrompts: Prompt[] = [
  {
    id: "prompt-1",
    title: "First Prompt",
    content: "Content 1",
    description: "Description 1",
    tags: ["tag1"],
    is_favorite: false,
    visibility: "PRIVATE",
    public_permission: "READ",
    owner_id: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "PUBLISHED",
    version: "1.0.0",
  },
  {
    id: "prompt-2",
    title: "Second Prompt",
    content: "Content 2",
    description: "Description 2",
    tags: ["tag2"],
    is_favorite: true,
    visibility: "SHARED",
    public_permission: "WRITE",
    owner_id: "user-2",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    status: "PUBLISHED",
    version: "1.0.0",
  },
];

const defaultProps = {
  prompts: mockPrompts,
  isLoading: false,
  onToggleFavorite: vi.fn(),
};

describe("PromptList - Tests d'intégration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Intégration avec navigation", () => {
    it("useNavigate appelé correctement au clic sur un prompt", async () => {
      const user = userEvent.setup();

      render(<PromptList {...defaultProps} />);

      await user.click(screen.getAllByTestId("click-btn")[0]);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/prompts/prompt-1");
    });

    it("navigation vers le bon ID pour chaque prompt", async () => {
      const user = userEvent.setup();

      render(<PromptList {...defaultProps} />);

      await user.click(screen.getAllByTestId("click-btn")[1]);

      expect(mockNavigate).toHaveBeenCalledWith("/prompts/prompt-2");
    });

    it("navigation vers différents prompts de manière séquentielle", async () => {
      const user = userEvent.setup();

      render(<PromptList {...defaultProps} />);

      await user.click(screen.getAllByTestId("click-btn")[0]);
      expect(mockNavigate).toHaveBeenCalledWith("/prompts/prompt-1");

      await user.click(screen.getAllByTestId("click-btn")[1]);
      expect(mockNavigate).toHaveBeenCalledWith("/prompts/prompt-2");

      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe("Transmission des états", () => {
    it("emptySearchState transmis correctement à EmptyPromptState", () => {
      render(
        <PromptList
          {...defaultProps}
          prompts={[]}
          emptySearchState={true}
        />
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByTestId("empty-search")).toHaveTextContent("true");
    });

    it("isSharedSection transmis correctement à EmptyPromptState", () => {
      render(
        <PromptList
          {...defaultProps}
          prompts={[]}
          isSharedSection={true}
        />
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByTestId("is-shared")).toHaveTextContent("true");
    });

    it("valeurs par défaut de emptySearchState et isSharedSection", () => {
      render(<PromptList {...defaultProps} prompts={[]} />);

      expect(screen.getByTestId("empty-search")).toHaveTextContent("false");
      expect(screen.getByTestId("is-shared")).toHaveTextContent("false");
    });

    it("currentUserId transmis à tous les items", () => {
      render(
        <PromptList {...defaultProps} currentUserId="current-user-123" />
      );

      const userIds = screen.getAllByTestId("user-id");
      expect(userIds).toHaveLength(2);
      userIds.forEach((el) => {
        expect(el).toHaveTextContent("current-user-123");
      });
    });
  });

  describe("Rendu de la liste", () => {
    it("affiche tous les prompts avec PromptListActionsItem", () => {
      render(<PromptList {...defaultProps} />);

      expect(screen.getByTestId("prompt-item-prompt-1")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-item-prompt-2")).toBeInTheDocument();
      expect(screen.getByText("First Prompt")).toBeInTheDocument();
      expect(screen.getByText("Second Prompt")).toBeInTheDocument();
    });

    it("gère une liste vide", () => {
      render(<PromptList {...defaultProps} prompts={[]} />);

      expect(screen.getByTestId("empty-view")).toBeInTheDocument();
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("gère l'état de chargement", () => {
      render(<PromptList {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("loading-view")).toBeInTheDocument();
      expect(screen.getByTestId("skeleton")).toBeInTheDocument();
      expect(screen.getByText("Loading skeletons...")).toBeInTheDocument();
    });

    it("n'affiche pas les items pendant le chargement", () => {
      render(<PromptList {...defaultProps} isLoading={true} />);

      expect(screen.queryByTestId("prompt-item-prompt-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("prompt-item-prompt-2")).not.toBeInTheDocument();
    });

    it("affiche les items après le chargement", () => {
      const { rerender } = render(<PromptList {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("loading-view")).toBeInTheDocument();

      rerender(<PromptList {...defaultProps} isLoading={false} />);

      expect(screen.queryByTestId("loading-view")).not.toBeInTheDocument();
      expect(screen.getByTestId("prompt-item-prompt-1")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-item-prompt-2")).toBeInTheDocument();
    });

    it("affiche les index corrects pour l'animation", () => {
      render(<PromptList {...defaultProps} />);

      const indices = screen.getAllByTestId("index");
      expect(indices[0]).toHaveTextContent("0");
      expect(indices[1]).toHaveTextContent("1");
    });
  });

  describe("Callbacks en cascade", () => {
    it("onToggleFavorite transmis de PromptList → PromptListActionsItem", async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn();

      render(<PromptList {...defaultProps} onToggleFavorite={onToggleFavorite} />);

      await user.click(screen.getAllByTestId("favorite-btn")[0]);

      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
      expect(onToggleFavorite).toHaveBeenCalledWith("prompt-1", false);
    });

    it("onDelete transmis correctement", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(<PromptList {...defaultProps} onDelete={onDelete} />);

      await user.click(screen.getAllByTestId("delete-btn")[0]);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith("prompt-1");
    });

    it("onDuplicate transmis correctement", async () => {
      const user = userEvent.setup();
      const onDuplicate = vi.fn();

      render(<PromptList {...defaultProps} onDuplicate={onDuplicate} />);

      await user.click(screen.getAllByTestId("duplicate-btn")[0]);

      expect(onDuplicate).toHaveBeenCalledTimes(1);
      expect(onDuplicate).toHaveBeenCalledWith("prompt-1");
    });

    it("onToggleVisibility transmis correctement", async () => {
      const user = userEvent.setup();
      const onToggleVisibility = vi.fn();

      render(
        <PromptList {...defaultProps} onToggleVisibility={onToggleVisibility} />
      );

      await user.click(screen.getAllByTestId("visibility-btn")[0]);

      expect(onToggleVisibility).toHaveBeenCalledTimes(1);
      expect(onToggleVisibility).toHaveBeenCalledWith("prompt-1", "PRIVATE", "READ");
    });

    it("tous les callbacks optionnels fonctionnent ensemble", async () => {
      const user = userEvent.setup();
      const callbacks = {
        onToggleFavorite: vi.fn(),
        onDelete: vi.fn(),
        onDuplicate: vi.fn(),
        onToggleVisibility: vi.fn(),
      };

      render(<PromptList {...defaultProps} {...callbacks} />);

      await user.click(screen.getAllByTestId("favorite-btn")[0]);
      await user.click(screen.getAllByTestId("delete-btn")[0]);
      await user.click(screen.getAllByTestId("duplicate-btn")[0]);
      await user.click(screen.getAllByTestId("visibility-btn")[0]);

      expect(callbacks.onToggleFavorite).toHaveBeenCalledWith("prompt-1", false);
      expect(callbacks.onDelete).toHaveBeenCalledWith("prompt-1");
      expect(callbacks.onDuplicate).toHaveBeenCalledWith("prompt-1");
      expect(callbacks.onToggleVisibility).toHaveBeenCalledWith(
        "prompt-1",
        "PRIVATE",
        "READ"
      );
    });
  });

  describe("Scénarios complets", () => {
    it("affiche correctement une liste de prompts avec recherche vide", () => {
      render(
        <PromptList
          {...defaultProps}
          emptySearchState={true}
          searchQuery="test"
          currentUserId="user-123"
        />
      );

      expect(screen.getByTestId("prompt-item-prompt-1")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-item-prompt-2")).toBeInTheDocument();
    });

    it("gère une section de prompts partagés vide", () => {
      render(
        <PromptList
          {...defaultProps}
          prompts={[]}
          isSharedSection={true}
          emptySearchState={false}
        />
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByTestId("is-shared")).toHaveTextContent("true");
      expect(screen.getByTestId("empty-search")).toHaveTextContent("false");
    });

    it("workflow complet: chargement → affichage → interaction", async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn();

      const { rerender } = render(
        <PromptList {...defaultProps} isLoading={true} onToggleFavorite={onToggleFavorite} />
      );

      // État de chargement
      expect(screen.getByTestId("loading-view")).toBeInTheDocument();

      // Fin du chargement
      rerender(
        <PromptList {...defaultProps} isLoading={false} onToggleFavorite={onToggleFavorite} />
      );

      expect(screen.queryByTestId("loading-view")).not.toBeInTheDocument();
      expect(screen.getByTestId("prompt-item-prompt-1")).toBeInTheDocument();

      // Interaction utilisateur
      await user.click(screen.getAllByTestId("click-btn")[0]);
      expect(mockNavigate).toHaveBeenCalledWith("/prompts/prompt-1");

      await user.click(screen.getAllByTestId("favorite-btn")[1]);
      expect(onToggleFavorite).toHaveBeenCalledWith("prompt-2", true);
    });

    it("gère un grand nombre de prompts", () => {
      const manyPrompts = Array.from({ length: 50 }, (_, i) => ({
        ...mockPrompts[0],
        id: `prompt-${i}`,
        title: `Prompt ${i}`,
      }));

      render(<PromptList {...defaultProps} prompts={manyPrompts} />);

      expect(screen.getByTestId(`prompt-item-prompt-0`)).toBeInTheDocument();
      expect(screen.getByTestId(`prompt-item-prompt-25`)).toBeInTheDocument();
      expect(screen.getByTestId(`prompt-item-prompt-49`)).toBeInTheDocument();
    });
  });
});
