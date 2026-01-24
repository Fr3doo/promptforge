import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le spinner pendant le chargement (loading=true)", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should show spinner
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    // Spinner is rendered (Loader2 with animate-spin)
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("redirige vers /auth?redirectTo=... si non authentifié", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/auth?redirectTo=%2Fdashboard"
      );
    });
  });

  it("préserve les query params dans le redirectTo", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/prompts?filter=favorites"]}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/auth?redirectTo=%2Fprompts%3Ffilter%3Dfavorites"
      );
    });
  });

  it("rend les enfants si authentifié", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("ne redirige pas pendant le chargement même si user=null", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should not redirect while loading
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
