import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PromptListView } from "../PromptListView";
import type { PromptListViewProps } from "../PromptListView.types";

const mockPrompts = [
  { id: "1", title: "Prompt 1" },
  { id: "2", title: "Prompt 2" },
  { id: "3", title: "Prompt 3" },
];

const defaultProps: PromptListViewProps = {
  prompts: mockPrompts as any,
  isLoading: false,
  isEmpty: false,
  loadingComponent: <div>Loading...</div>,
  emptyComponent: <div>No prompts found</div>,
  children: (
    <>
      <div data-testid="prompt-1">Prompt Card 1</div>
      <div data-testid="prompt-2">Prompt Card 2</div>
      <div data-testid="prompt-3">Prompt Card 3</div>
    </>
  ),
};

describe("PromptListView", () => {
  describe("Rendu de base", () => {
    it("affiche les enfants quand !isLoading && !isEmpty", () => {
      render(<PromptListView {...defaultProps} />);

      expect(screen.getByTestId("prompt-1")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-2")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-3")).toBeInTheDocument();
    });

    it("applique la classe CSS par défaut", () => {
      const { container } = render(<PromptListView {...defaultProps} />);

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toHaveClass(
        "grid",
        "gap-4",
        "md:grid-cols-2",
        "lg:grid-cols-3"
      );
    });

    it("n'affiche pas les composants de fallback quand les données sont disponibles", () => {
      render(<PromptListView {...defaultProps} />);

      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.queryByText("No prompts found")).not.toBeInTheDocument();
    });
  });

  describe("État de chargement", () => {
    it("affiche loadingComponent quand isLoading=true", () => {
      render(<PromptListView {...defaultProps} isLoading={true} />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("n'affiche pas les enfants pendant le chargement", () => {
      render(<PromptListView {...defaultProps} isLoading={true} />);

      expect(screen.queryByTestId("prompt-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("prompt-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("prompt-3")).not.toBeInTheDocument();
    });

    it("n'affiche pas emptyComponent pendant le chargement", () => {
      render(
        <PromptListView {...defaultProps} isLoading={true} isEmpty={true} />
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText("No prompts found")).not.toBeInTheDocument();
    });
  });

  describe("État vide", () => {
    it("affiche emptyComponent quand isEmpty=true", () => {
      render(
        <PromptListView
          {...defaultProps}
          isEmpty={true}
          children={<></>}
        />
      );

      expect(screen.getByText("No prompts found")).toBeInTheDocument();
    });

    it("n'affiche pas les enfants quand isEmpty=true", () => {
      render(
        <PromptListView {...defaultProps} isEmpty={true} />
      );

      expect(screen.queryByTestId("prompt-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("prompt-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("prompt-3")).not.toBeInTheDocument();
    });

    it("priorité: loading > empty (affiche loading si les deux sont true)", () => {
      render(
        <PromptListView
          {...defaultProps}
          isLoading={true}
          isEmpty={true}
        />
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText("No prompts found")).not.toBeInTheDocument();
    });
  });

  describe("Classes CSS personnalisées", () => {
    it("applique className personnalisée", () => {
      const customClassName = "custom-grid flex flex-col gap-8";
      const { container } = render(
        <PromptListView {...defaultProps} className={customClassName} />
      );

      const gridContainer = container.querySelector(".custom-grid");
      expect(gridContainer).toHaveClass("custom-grid", "flex", "flex-col", "gap-8");
    });

    it("remplace complètement les classes par défaut avec className personnalisée", () => {
      const { container } = render(
        <PromptListView {...defaultProps} className="my-custom-class" />
      );

      const customContainer = container.querySelector(".my-custom-class");
      expect(customContainer).toBeInTheDocument();
      expect(customContainer).not.toHaveClass("grid", "gap-4");
    });
  });

  describe("Rendu de plusieurs enfants", () => {
    it("affiche tous les enfants dans le grid", () => {
      render(<PromptListView {...defaultProps} />);

      expect(screen.getByTestId("prompt-1")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-2")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-3")).toBeInTheDocument();
    });

    it("affiche un seul enfant correctement", () => {
      render(
        <PromptListView
          {...defaultProps}
          children={<div data-testid="single-prompt">Single Prompt</div>}
        />
      );

      expect(screen.getByTestId("single-prompt")).toBeInTheDocument();
    });

    it("affiche un grand nombre d'enfants sans problème", () => {
      const manyChildren = Array.from({ length: 20 }, (_, i) => (
        <div key={i} data-testid={`prompt-${i}`}>
          Prompt {i}
        </div>
      ));

      render(
        <PromptListView {...defaultProps} children={<>{manyChildren}</>} />
      );

      expect(screen.getByTestId("prompt-0")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-10")).toBeInTheDocument();
      expect(screen.getByTestId("prompt-19")).toBeInTheDocument();
    });
  });

  describe("Composants de slot personnalisés", () => {
    it("affiche loadingComponent personnalisé", () => {
      const customLoading = (
        <div data-testid="custom-loading">
          <span>Custom Loading Spinner</span>
        </div>
      );

      render(
        <PromptListView
          {...defaultProps}
          isLoading={true}
          loadingComponent={customLoading}
        />
      );

      expect(screen.getByTestId("custom-loading")).toBeInTheDocument();
      expect(screen.getByText("Custom Loading Spinner")).toBeInTheDocument();
    });

    it("affiche emptyComponent personnalisé", () => {
      const customEmpty = (
        <div data-testid="custom-empty">
          <h3>Aucun résultat trouvé</h3>
          <p>Essayez une autre recherche</p>
        </div>
      );

      render(
        <PromptListView
          {...defaultProps}
          isEmpty={true}
          emptyComponent={customEmpty}
          children={<></>}
        />
      );

      expect(screen.getByTestId("custom-empty")).toBeInTheDocument();
      expect(screen.getByText("Aucun résultat trouvé")).toBeInTheDocument();
      expect(screen.getByText("Essayez une autre recherche")).toBeInTheDocument();
    });
  });
});
