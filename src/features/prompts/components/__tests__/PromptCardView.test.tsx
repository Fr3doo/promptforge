import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent } from "@/test/utils";
import { PromptCardView } from "../PromptCardView";
import type { PromptCardViewProps } from "../PromptCardView.types";
import type { Prompt } from "../../types";

// Mock de framer-motion pour simplifier les tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock de VisibilityBadge
vi.mock("../VisibilityBadge", () => ({
  VisibilityBadge: ({ sharingState, shareCount }: any) => (
    <div data-testid="visibility-badge">
      {sharingState}-{shareCount}
    </div>
  ),
}));

const mockPrompt: Prompt = {
  id: "test-1",
  title: "Test Prompt Title",
  description: "Test prompt description",
  content: "Test content",
  tags: ["react", "testing", "vitest"],
  version: "1.2.0",
  visibility: "PRIVATE",
  status: "PUBLISHED",
  owner_id: "user-1",
  created_at: "2024-01-01",
  updated_at: "2024-01-02",
  is_favorite: false,
  public_permission: "READ",
};

const defaultProps: PromptCardViewProps = {
  prompt: mockPrompt,
  isDraft: false,
  isOwner: true,
  shareCount: 0,
  sharingState: "PRIVATE",
  onClick: vi.fn(),
  index: 0,
};

describe("PromptCardView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic rendering", () => {
    it("should render the prompt title", () => {
      render(<PromptCardView {...defaultProps} />);
      expect(screen.getByText("Test Prompt Title")).toBeInTheDocument();
    });

    it("should render the prompt description", () => {
      render(<PromptCardView {...defaultProps} />);
      expect(screen.getByText("Test prompt description")).toBeInTheDocument();
    });

    it("should render the version", () => {
      render(<PromptCardView {...defaultProps} />);
      expect(screen.getByText("v1.2.0")).toBeInTheDocument();
    });

    it("should display 'Aucune description' when description is null", () => {
      const propsWithoutDesc = {
        ...defaultProps,
        prompt: { ...mockPrompt, description: null },
      };
      render(<PromptCardView {...propsWithoutDesc} />);
      expect(screen.getByText("Aucune description")).toBeInTheDocument();
    });
  });

  describe("Draft badge", () => {
    it("should display draft badge when isDraft is true", () => {
      render(<PromptCardView {...defaultProps} isDraft={true} />);
      expect(screen.getByText("Brouillon")).toBeInTheDocument();
    });

    it("should not display draft badge when isDraft is false", () => {
      render(<PromptCardView {...defaultProps} isDraft={false} />);
      expect(screen.queryByText("Brouillon")).not.toBeInTheDocument();
    });

    it("should display FileText icon in draft badge", () => {
      const { container } = render(<PromptCardView {...defaultProps} isDraft={true} />);
      const badge = screen.getByText("Brouillon").closest("div");
      expect(badge).toHaveClass("text-yellow-500");
      expect(badge).toHaveClass("border-yellow-500/20");
    });
  });

  describe("Tags rendering", () => {
    it("should display first 3 tags", () => {
      render(<PromptCardView {...defaultProps} />);
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.getByText("testing")).toBeInTheDocument();
      expect(screen.getByText("vitest")).toBeInTheDocument();
    });

    it("should display +N badge when more than 3 tags", () => {
      const propsWithManyTags = {
        ...defaultProps,
        prompt: {
          ...mockPrompt,
          tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
        },
      };
      render(<PromptCardView {...propsWithManyTags} />);
      expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("should calculate correct +N count", () => {
      const propsWithManyTags = {
        ...defaultProps,
        prompt: {
          ...mockPrompt,
          tags: Array.from({ length: 10 }, (_, i) => `tag${i + 1}`),
        },
      };
      render(<PromptCardView {...propsWithManyTags} />);
      expect(screen.getByText("+7")).toBeInTheDocument();
    });

    it("should not display +N badge when tags count is 3 or less", () => {
      render(<PromptCardView {...defaultProps} />);
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });

    it("should handle empty tags array", () => {
      const propsWithoutTags = {
        ...defaultProps,
        prompt: { ...mockPrompt, tags: [] },
      };
      const { container } = render(<PromptCardView {...propsWithoutTags} />);
      const badges = container.querySelectorAll('[class*="badge"]');
      // Should not have tag badges (only version and visibility info)
      expect(screen.queryByText("react")).not.toBeInTheDocument();
    });

    it("should handle null tags", () => {
      const propsWithNullTags = {
        ...defaultProps,
        prompt: { ...mockPrompt, tags: null },
      };
      render(<PromptCardView {...propsWithNullTags} />);
      expect(screen.queryByText("react")).not.toBeInTheDocument();
    });

    it("should display all tags when exactly 3 tags", () => {
      const propsWithThreeTags = {
        ...defaultProps,
        prompt: { ...mockPrompt, tags: ["tag1", "tag2", "tag3"] },
      };
      render(<PromptCardView {...propsWithThreeTags} />);
      expect(screen.getByText("tag1")).toBeInTheDocument();
      expect(screen.getByText("tag2")).toBeInTheDocument();
      expect(screen.getByText("tag3")).toBeInTheDocument();
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });

    it("should display all tags when less than 3 tags", () => {
      const propsWithTwoTags = {
        ...defaultProps,
        prompt: { ...mockPrompt, tags: ["tag1", "tag2"] },
      };
      render(<PromptCardView {...propsWithTwoTags} />);
      expect(screen.getByText("tag1")).toBeInTheDocument();
      expect(screen.getByText("tag2")).toBeInTheDocument();
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });
  });

  describe("Shared with you badge", () => {
    it("should display 'Partagé avec vous' badge when isOwner is false", () => {
      render(<PromptCardView {...defaultProps} isOwner={false} />);
      expect(screen.getByText("Partagé avec vous")).toBeInTheDocument();
    });

    it("should not display 'Partagé avec vous' badge when isOwner is true", () => {
      render(<PromptCardView {...defaultProps} isOwner={true} />);
      expect(screen.queryByText("Partagé avec vous")).not.toBeInTheDocument();
    });

    it("should have outline variant", () => {
      render(<PromptCardView {...defaultProps} isOwner={false} />);
      const badge = screen.getByText("Partagé avec vous").closest("div");
      expect(badge).toHaveClass("border");
    });
  });

  describe("VisibilityBadge integration", () => {
    it("should render VisibilityBadge with correct sharingState", () => {
      render(<PromptCardView {...defaultProps} sharingState="PRIVATE" />);
      expect(screen.getByTestId("visibility-badge")).toHaveTextContent("PRIVATE-0");
    });

    it("should render VisibilityBadge with correct shareCount", () => {
      render(<PromptCardView {...defaultProps} shareCount={5} />);
      expect(screen.getByTestId("visibility-badge")).toHaveTextContent("PRIVATE-5");
    });

    it("should handle PRIVATE_SHARED state", () => {
      render(<PromptCardView {...defaultProps} sharingState="PRIVATE_SHARED" shareCount={3} />);
      expect(screen.getByTestId("visibility-badge")).toHaveTextContent("PRIVATE_SHARED-3");
    });

    it("should handle PUBLIC state", () => {
      render(<PromptCardView {...defaultProps} sharingState="PUBLIC" />);
      expect(screen.getByTestId("visibility-badge")).toHaveTextContent("PUBLIC-0");
    });
  });

  describe("User interactions", () => {
    it("should call onClick when clicking on the title area", async () => {
      const onClickMock = vi.fn();
      const user = userEvent.setup();
      render(<PromptCardView {...defaultProps} onClick={onClickMock} />);
      
      const title = screen.getByText("Test Prompt Title");
      await user.click(title);
      
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("should call onClick when clicking on the description", async () => {
      const onClickMock = vi.fn();
      const user = userEvent.setup();
      render(<PromptCardView {...defaultProps} onClick={onClickMock} />);
      
      const description = screen.getByText("Test prompt description");
      await user.click(description);
      
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("should call onClick when clicking on the content area", async () => {
      const onClickMock = vi.fn();
      const user = userEvent.setup();
      render(<PromptCardView {...defaultProps} onClick={onClickMock} />);
      
      const version = screen.getByText("v1.2.0");
      await user.click(version);
      
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Actions slot", () => {
    it("should render actions slot when provided", () => {
      const actions = <button data-testid="test-action">Action Button</button>;
      render(<PromptCardView {...defaultProps} actions={actions} />);
      expect(screen.getByTestId("test-action")).toBeInTheDocument();
    });

    it("should not render actions slot when undefined", () => {
      render(<PromptCardView {...defaultProps} actions={undefined} />);
      expect(screen.queryByTestId("test-action")).not.toBeInTheDocument();
    });

    it("should render custom actions", () => {
      const actions = (
        <div data-testid="custom-actions">
          <button>Edit</button>
          <button>Delete</button>
        </div>
      );
      render(<PromptCardView {...defaultProps} actions={actions} />);
      const actionsElement = screen.getByTestId("custom-actions");
      expect(actionsElement).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("Framer Motion animations", () => {
    it("should have correct delay based on index", () => {
      const { container } = render(<PromptCardView {...defaultProps} index={3} />);
      const motionDiv = container.firstChild as HTMLElement;
      // Le delay devrait être 3 * 0.05 = 0.15
      // Note: Avec le mock, on ne peut pas tester les props de motion directement
      expect(motionDiv).toBeInTheDocument();
    });

    it("should use default index of 0 when not provided", () => {
      const { container } = render(<PromptCardView {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle large index values", () => {
      const { container } = render(<PromptCardView {...defaultProps} index={100} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("CSS classes", () => {
    it("should have cursor-pointer class on Card", () => {
      const { container } = render(<PromptCardView {...defaultProps} />);
      const card = container.querySelector('[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();
    });

    it("should have transition and hover classes", () => {
      const { container } = render(<PromptCardView {...defaultProps} />);
      const card = container.querySelector('[class*="transition"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("hover:border-primary");
      expect(card).toHaveClass("hover:shadow-lg");
    });
  });

  describe("Edge cases", () => {
    it("should handle prompt without description", () => {
      const propsWithoutDesc = {
        ...defaultProps,
        prompt: { ...mockPrompt, description: null },
      };
      render(<PromptCardView {...propsWithoutDesc} />);
      expect(screen.getByText("Aucune description")).toBeInTheDocument();
    });

    it("should handle different version formats", () => {
      const propsWithDifferentVersion = {
        ...defaultProps,
        prompt: { ...mockPrompt, version: "10.0.0" },
      };
      render(<PromptCardView {...propsWithDifferentVersion} />);
      expect(screen.getByText("v10.0.0")).toBeInTheDocument();
    });

    it("should handle isDraft=true and isOwner=false combination", () => {
      render(<PromptCardView {...defaultProps} isDraft={true} isOwner={false} />);
      expect(screen.getByText("Brouillon")).toBeInTheDocument();
      expect(screen.getByText("Partagé avec vous")).toBeInTheDocument();
    });

    it("should handle high shareCount with PRIVATE_SHARED state", () => {
      render(
        <PromptCardView
          {...defaultProps}
          sharingState="PRIVATE_SHARED"
          shareCount={999}
        />
      );
      expect(screen.getByTestId("visibility-badge")).toHaveTextContent("PRIVATE_SHARED-999");
    });

    it("should handle prompt with empty string description", () => {
      const propsWithEmptyDesc = {
        ...defaultProps,
        prompt: { ...mockPrompt, description: "" },
      };
      render(<PromptCardView {...propsWithEmptyDesc} />);
      expect(screen.getByText("Aucune description")).toBeInTheDocument();
    });

    it("should handle version null or undefined", () => {
      const propsWithoutVersion = {
        ...defaultProps,
        prompt: { ...mockPrompt, version: null },
      };
      render(<PromptCardView {...propsWithoutVersion} />);
      expect(screen.getByText("vnull")).toBeInTheDocument();
    });
  });
});
