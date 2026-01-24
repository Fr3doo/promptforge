import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useRedirectAfterAuth } from "../useRedirectAfterAuth";

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("useRedirectAfterAuth", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe("targetPath", () => {
    it("retourne /dashboard par défaut sans redirectTo", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth"]}>{children}</MemoryRouter>
        ),
      });
      expect(result.current.targetPath).toBe("/dashboard");
    });

    it("retourne le chemin validé si redirectTo est valide", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth?redirectTo=/prompts/123"]}>
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.targetPath).toBe("/prompts/123");
    });

    it("retourne /dashboard si redirectTo est une URL externe", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth?redirectTo=https://evil.com"]}>
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.targetPath).toBe("/dashboard");
    });

    it("retourne /dashboard si redirectTo est scheme-relative", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth?redirectTo=//evil.com"]}>
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.targetPath).toBe("/dashboard");
    });

    it("retourne /dashboard si redirectTo contient javascript:", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter
            initialEntries={["/auth?redirectTo=javascript:alert(1)"]}
          >
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.targetPath).toBe("/dashboard");
    });

    it("préserve les query params valides dans redirectTo", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter
            initialEntries={["/auth?redirectTo=/prompts?filter=recent"]}
          >
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.targetPath).toBe("/prompts?filter=recent");
    });
  });

  describe("rawRedirectTo", () => {
    it("expose le paramètre brut pour debug/logging", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth?redirectTo=/test"]}>
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.rawRedirectTo).toBe("/test");
    });

    it("retourne null sans paramètre redirectTo", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth"]}>{children}</MemoryRouter>
        ),
      });
      expect(result.current.rawRedirectTo).toBeNull();
    });
  });

  describe("redirectToTarget", () => {
    it("navigue vers le targetPath validé", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth?redirectTo=/settings"]}>
            {children}
          </MemoryRouter>
        ),
      });

      act(() => {
        result.current.redirectToTarget();
      });

      expect(mockNavigate).toHaveBeenCalledWith("/settings");
    });

    it("navigue vers /dashboard par défaut", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth"]}>{children}</MemoryRouter>
        ),
      });

      act(() => {
        result.current.redirectToTarget();
      });

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    it("navigue vers /dashboard si redirectTo est malveillant", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth?redirectTo=//evil.com"]}>
            {children}
          </MemoryRouter>
        ),
      });

      act(() => {
        result.current.redirectToTarget();
      });

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("buildLinkWithRedirect", () => {
    it("retourne le basePath seul sans redirectTo", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth"]}>{children}</MemoryRouter>
        ),
      });
      expect(result.current.buildLinkWithRedirect("/signup")).toBe("/signup");
    });

    it("ajoute le redirectTo encodé au basePath", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth?redirectTo=/prompts/123"]}>
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.buildLinkWithRedirect("/signup")).toBe(
        "/signup?redirectTo=%2Fprompts%2F123"
      );
    });

    it("encode correctement les caractères spéciaux", () => {
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter
            initialEntries={["/auth?redirectTo=/prompts?filter=test&sort=desc"]}
          >
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.buildLinkWithRedirect("/signup")).toBe(
        "/signup?redirectTo=%2Fprompts%3Ffilter%3Dtest%26sort%3Ddesc"
      );
    });

    it("préserve le redirectTo brut même s'il est malveillant (pour inter-page links)", () => {
      // Note: buildLinkWithRedirect préserve la valeur brute car la validation
      // se fait côté destination via safeRedirectPath dans targetPath
      const { result } = renderHook(() => useRedirectAfterAuth(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/auth?redirectTo=//evil.com"]}>
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.buildLinkWithRedirect("/signup")).toBe(
        "/signup?redirectTo=%2F%2Fevil.com"
      );
    });
  });
});
