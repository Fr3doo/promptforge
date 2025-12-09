import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { PermissionBadge } from "../PermissionBadge";

describe("PermissionBadge", () => {
  it('affiche "Lecture seule" avec icône pour READ', async () => {
    const user = userEvent.setup();
    render(<PermissionBadge permission="READ" />);

    const badge = screen.getByText(/Lecture seule/i);
    expect(badge).toBeInTheDocument();

    await user.hover(badge);
    expect(
      await screen.findByText(/consulter ce prompt mais pas le modifier/i)
    ).toBeInTheDocument();
  });

  it('affiche "Écriture" avec icône pour WRITE', async () => {
    const user = userEvent.setup();
    render(<PermissionBadge permission="WRITE" />);

    const badge = screen.getByText(/Écriture/i);
    expect(badge).toBeInTheDocument();

    await user.hover(badge);
    expect(
      await screen.findByText(/modifier ce prompt et créer des versions/i)
    ).toBeInTheDocument();
  });

  it("applique les classes de style orange pour READ", () => {
    render(<PermissionBadge permission="READ" />);
    
    const badge = screen.getByText(/Lecture seule/i).closest("div");
    expect(badge).toHaveClass("bg-orange-500/10");
  });

  it("applique les classes de style vert pour WRITE", () => {
    render(<PermissionBadge permission="WRITE" />);
    
    const badge = screen.getByText(/Écriture/i).closest("div");
    expect(badge).toHaveClass("bg-emerald-500/10");
  });
});
