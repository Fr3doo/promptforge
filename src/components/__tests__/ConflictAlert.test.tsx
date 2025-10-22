import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/utils";
import { ConflictAlert } from "../ConflictAlert";

describe("ConflictAlert", () => {
  const defaultProps = {
    serverUpdatedAt: "2024-01-01T12:00:00Z",
    onRefresh: vi.fn(),
  };

  it("devrait afficher le message de conflit", () => {
    render(<ConflictAlert {...defaultProps} />);

    expect(screen.getByText("Conflit détecté")).toBeInTheDocument();
    expect(screen.getByText(/Ce prompt a été modifié par un autre utilisateur/i)).toBeInTheDocument();
  });

  it("devrait afficher le temps écoulé depuis la modification", () => {
    const serverUpdatedAt = new Date(Date.now() - 1000 * 60 * 5).toISOString(); // Il y a 5 minutes
    
    render(<ConflictAlert {...defaultProps} serverUpdatedAt={serverUpdatedAt} />);

    expect(screen.getByText(/il y a/i)).toBeInTheDocument();
  });

  it("devrait appeler onRefresh au clic sur le bouton Recharger", () => {
    const onRefresh = vi.fn();
    
    render(<ConflictAlert {...defaultProps} onRefresh={onRefresh} />);

    const refreshButton = screen.getByText("Recharger la dernière version");
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("devrait afficher le bouton Continuer si onDismiss est fourni", () => {
    const onDismiss = vi.fn();
    
    render(<ConflictAlert {...defaultProps} onDismiss={onDismiss} />);

    expect(screen.getByText("Continuer malgré tout")).toBeInTheDocument();
  });

  it("devrait appeler onDismiss au clic sur le bouton Continuer", () => {
    const onDismiss = vi.fn();
    
    render(<ConflictAlert {...defaultProps} onDismiss={onDismiss} />);

    const dismissButton = screen.getByText("Continuer malgré tout");
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("ne devrait pas afficher le bouton Continuer si onDismiss n'est pas fourni", () => {
    render(<ConflictAlert {...defaultProps} />);

    expect(screen.queryByText("Continuer malgré tout")).not.toBeInTheDocument();
  });

  it("devrait avoir une variante destructive", () => {
    render(<ConflictAlert {...defaultProps} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("border-destructive");
  });

  it("devrait afficher l'icône AlertCircle", () => {
    render(<ConflictAlert {...defaultProps} />);

    const icon = screen.getByRole("alert").querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
