import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePromptPermission } from "../usePromptPermission";
import { useAuth } from "../useAuth";
import { usePrompt } from "../usePrompts";
import { usePromptShares } from "../usePromptShares";

vi.mock("../useAuth");
vi.mock("../usePrompts");
vi.mock("../usePromptShares");

describe("usePromptPermission", () => {
  const mockUser = { id: "user-123", email: "user@test.com" };
  const mockPrompt = {
    id: "prompt-1",
    owner_id: "owner-456",
    visibility: "PRIVATE" as const,
    public_permission: "READ" as const,
    title: "Test Prompt",
    content: "Test content",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait retourner OWNER pour le propriétaire", () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(usePrompt).mockReturnValue({
      data: { ...mockPrompt, owner_id: mockUser.id },
    } as any);
    vi.mocked(usePromptShares).mockReturnValue({ data: [] } as any);

    const { result } = renderHook(() => usePromptPermission("prompt-1"));

    expect(result.current.permission).toBe("OWNER");
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canShare).toBe(true);
    expect(result.current.canCreateVersion).toBe(true);
    expect(result.current.isOwner).toBe(true);
  });

  it("devrait retourner WRITE pour un partage privé en écriture", () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(usePrompt).mockReturnValue({ data: mockPrompt } as any);
    vi.mocked(usePromptShares).mockReturnValue({
      data: [{
        id: "share-1",
        prompt_id: "prompt-1",
        shared_with_user_id: mockUser.id,
        permission: "WRITE" as const,
        created_at: "2024-01-01",
      }],
    } as any);

    const { result } = renderHook(() => usePromptPermission("prompt-1"));

    expect(result.current.permission).toBe("WRITE");
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canShare).toBe(false);
    expect(result.current.canCreateVersion).toBe(true);
    expect(result.current.isOwner).toBe(false);
  });

  it("devrait retourner READ pour un partage privé en lecture", () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(usePrompt).mockReturnValue({ data: mockPrompt } as any);
    vi.mocked(usePromptShares).mockReturnValue({
      data: [{
        id: "share-1",
        prompt_id: "prompt-1",
        shared_with_user_id: mockUser.id,
        permission: "READ" as const,
        created_at: "2024-01-01",
      }],
    } as any);

    const { result } = renderHook(() => usePromptPermission("prompt-1"));

    expect(result.current.permission).toBe("READ");
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canShare).toBe(false);
    expect(result.current.canCreateVersion).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });

  it("devrait retourner WRITE pour un partage public en écriture", () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(usePrompt).mockReturnValue({
      data: {
        ...mockPrompt,
        visibility: "SHARED" as const,
        public_permission: "WRITE" as const,
      },
    } as any);
    vi.mocked(usePromptShares).mockReturnValue({ data: [] } as any);

    const { result } = renderHook(() => usePromptPermission("prompt-1"));

    expect(result.current.permission).toBe("WRITE");
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canCreateVersion).toBe(true);
    expect(result.current.isOwner).toBe(false);
  });

  it("devrait retourner READ pour un partage public en lecture", () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(usePrompt).mockReturnValue({
      data: {
        ...mockPrompt,
        visibility: "SHARED" as const,
        public_permission: "READ" as const,
      },
    } as any);
    vi.mocked(usePromptShares).mockReturnValue({ data: [] } as any);

    const { result } = renderHook(() => usePromptPermission("prompt-1"));

    expect(result.current.permission).toBe("READ");
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canCreateVersion).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });

  it("devrait retourner null pour aucun accès", () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(usePrompt).mockReturnValue({ data: mockPrompt } as any);
    vi.mocked(usePromptShares).mockReturnValue({ data: [] } as any);

    const { result } = renderHook(() => usePromptPermission("prompt-1"));

    expect(result.current.permission).toBe(null);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canShare).toBe(false);
    expect(result.current.canCreateVersion).toBe(false);
    expect(result.current.isOwner).toBe(false);
  });

  it("devrait prioriser le partage privé sur le partage public", () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(usePrompt).mockReturnValue({
      data: {
        ...mockPrompt,
        visibility: "SHARED" as const,
        public_permission: "READ" as const,
      },
    } as any);
    vi.mocked(usePromptShares).mockReturnValue({
      data: [{
        id: "share-1",
        prompt_id: "prompt-1",
        shared_with_user_id: mockUser.id,
        permission: "WRITE" as const,
        created_at: "2024-01-01",
      }],
    } as any);

    const { result } = renderHook(() => usePromptPermission("prompt-1"));

    expect(result.current.permission).toBe("WRITE");
    expect(result.current.canEdit).toBe(true);
  });

  it("devrait retourner null si aucun utilisateur connecté", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as any);
    vi.mocked(usePrompt).mockReturnValue({ data: mockPrompt } as any);
    vi.mocked(usePromptShares).mockReturnValue({ data: [] } as any);

    const { result } = renderHook(() => usePromptPermission("prompt-1"));

    expect(result.current.permission).toBe(null);
    expect(result.current.canEdit).toBe(false);
  });

  it("devrait retourner null si pas de prompt", () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(usePrompt).mockReturnValue({ data: undefined } as any);
    vi.mocked(usePromptShares).mockReturnValue({ data: [] } as any);

    const { result } = renderHook(() => usePromptPermission("prompt-1"));

    expect(result.current.permission).toBe(null);
    expect(result.current.canEdit).toBe(false);
  });
});
