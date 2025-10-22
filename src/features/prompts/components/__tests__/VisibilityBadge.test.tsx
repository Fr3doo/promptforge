import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VisibilityBadge, type SharingState } from "../VisibilityBadge";
import userEvent from "@testing-library/user-event";

describe("VisibilityBadge", () => {
  describe("Badge rendering", () => {
    it("renders PRIVATE badge correctly", () => {
      render(<VisibilityBadge sharingState="PRIVATE" />);
      expect(screen.getByText("Privé")).toBeInTheDocument();
    });

    it("renders PRIVATE_SHARED badge without count", () => {
      render(<VisibilityBadge sharingState="PRIVATE_SHARED" />);
      expect(screen.getByText("Partagé")).toBeInTheDocument();
    });

    it("renders PRIVATE_SHARED badge with count", () => {
      render(<VisibilityBadge sharingState="PRIVATE_SHARED" shareCount={3} />);
      expect(screen.getByText("Partagé (3)")).toBeInTheDocument();
    });

    it("renders PUBLIC badge correctly", () => {
      render(<VisibilityBadge sharingState="PUBLIC" />);
      expect(screen.getByText("Public")).toBeInTheDocument();
    });
  });

  describe("Tooltip functionality", () => {
    it("shows tooltip for PRIVATE state on hover", async () => {
      const user = userEvent.setup();
      render(<VisibilityBadge sharingState="PRIVATE" />);
      
      const badge = screen.getByText("Privé");
      await user.hover(badge);
      
      expect(await screen.findByText(/accessible uniquement par vous/i)).toBeInTheDocument();
    });

    it("shows tooltip for PRIVATE_SHARED state with count", async () => {
      const user = userEvent.setup();
      render(<VisibilityBadge sharingState="PRIVATE_SHARED" shareCount={2} />);
      
      const badge = screen.getByText("Partagé (2)");
      await user.hover(badge);
      
      expect(await screen.findByText(/Partagé avec 2 personnes spécifiques/i)).toBeInTheDocument();
    });

    it("shows singular form for single share", async () => {
      const user = userEvent.setup();
      render(<VisibilityBadge sharingState="PRIVATE_SHARED" shareCount={1} />);
      
      const badge = screen.getByText("Partagé (1)");
      await user.hover(badge);
      
      expect(await screen.findByText(/Partagé avec 1 personne spécifique/i)).toBeInTheDocument();
    });

    it("shows tooltip for PUBLIC state on hover", async () => {
      const user = userEvent.setup();
      render(<VisibilityBadge sharingState="PUBLIC" />);
      
      const badge = screen.getByText("Public");
      await user.hover(badge);
      
      expect(await screen.findByText(/accessible à tous les utilisateurs/i)).toBeInTheDocument();
    });
  });

  describe("Visual styling", () => {
    it("applies correct icon for PRIVATE state", () => {
      const { container } = render(<VisibilityBadge sharingState="PRIVATE" />);
      // Lock icon should be present
      const badge = container.querySelector('[class*="lucide-lock"]');
      expect(badge).toBeInTheDocument();
    });

    it("applies correct icon for PRIVATE_SHARED state", () => {
      const { container } = render(<VisibilityBadge sharingState="PRIVATE_SHARED" />);
      // Users icon should be present
      const badge = container.querySelector('[class*="lucide-users"]');
      expect(badge).toBeInTheDocument();
    });

    it("applies correct icon for PUBLIC state", () => {
      const { container } = render(<VisibilityBadge sharingState="PUBLIC" />);
      // Globe icon should be present
      const badge = container.querySelector('[class*="lucide-globe"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles zero share count", () => {
      render(<VisibilityBadge sharingState="PRIVATE_SHARED" shareCount={0} />);
      expect(screen.getByText("Partagé")).toBeInTheDocument();
    });

    it("handles large share counts", () => {
      render(<VisibilityBadge sharingState="PRIVATE_SHARED" shareCount={999} />);
      expect(screen.getByText("Partagé (999)")).toBeInTheDocument();
    });
  });
});

describe("SharingState calculation logic", () => {
  it("determines PRIVATE state correctly", () => {
    const visibility: "PRIVATE" | "SHARED" = "PRIVATE";
    const shareCount = 0;
    
    const calculateSharingState = (vis: "PRIVATE" | "SHARED", count: number): SharingState => {
      return vis === "SHARED" 
        ? "PUBLIC" 
        : count > 0 
          ? "PRIVATE_SHARED" 
          : "PRIVATE";
    };
    
    expect(calculateSharingState(visibility, shareCount)).toBe("PRIVATE");
  });

  it("determines PRIVATE_SHARED state correctly", () => {
    const visibility: "PRIVATE" | "SHARED" = "PRIVATE";
    const shareCount = 3;
    
    const calculateSharingState = (vis: "PRIVATE" | "SHARED", count: number): SharingState => {
      return vis === "SHARED" 
        ? "PUBLIC" 
        : count > 0 
          ? "PRIVATE_SHARED" 
          : "PRIVATE";
    };
    
    expect(calculateSharingState(visibility, shareCount)).toBe("PRIVATE_SHARED");
  });

  it("determines PUBLIC state correctly", () => {
    const visibility: "PRIVATE" | "SHARED" = "SHARED";
    const shareCount = 0;
    
    const calculateSharingState = (vis: "PRIVATE" | "SHARED", count: number): SharingState => {
      return vis === "SHARED" 
        ? "PUBLIC" 
        : count > 0 
          ? "PRIVATE_SHARED" 
          : "PRIVATE";
    };
    
    expect(calculateSharingState(visibility, shareCount)).toBe("PUBLIC");
  });

  it("PUBLIC state takes precedence over share count", () => {
    const visibility: "PRIVATE" | "SHARED" = "SHARED";
    const shareCount = 5;
    
    const calculateSharingState = (vis: "PRIVATE" | "SHARED", count: number): SharingState => {
      return vis === "SHARED" 
        ? "PUBLIC" 
        : count > 0 
          ? "PRIVATE_SHARED" 
          : "PRIVATE";
    };
    
    expect(calculateSharingState(visibility, shareCount)).toBe("PUBLIC");
  });
});
