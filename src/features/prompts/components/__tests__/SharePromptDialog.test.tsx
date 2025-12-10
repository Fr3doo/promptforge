import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils";
import { SharePromptDialog } from "../SharePromptDialog";
import * as promptSharesHooks from "@/hooks/usePromptShares";

vi.mock("@/hooks/usePromptShares");

describe("SharePromptDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    promptId: "prompt-1",
    promptTitle: "Test Prompt",
  };

  const mockShares = [
    {
      id: "share-1",
      prompt_id: "prompt-1",
      shared_with_user_id: "user-2",
      shared_with_profile: { id: "user-2", pseudo: "User2", name: "Test User 2", image: null },
      permission: "READ" as const,
      created_at: "2024-01-01",
      shared_by: "owner-1",
    },
    {
      id: "share-2",
      prompt_id: "prompt-1",
      shared_with_user_id: "user-3",
      shared_with_profile: { id: "user-3", pseudo: "User3", name: "Test User 3", image: null },
      permission: "WRITE" as const,
      created_at: "2024-01-01",
      shared_by: "owner-1",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait afficher les partages existants", () => {
    vi.mocked(promptSharesHooks.usePromptShares).mockReturnValue({
      data: mockShares,
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(promptSharesHooks.useAddPromptShare).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(promptSharesHooks.useDeletePromptShare).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    render(<SharePromptDialog {...defaultProps} />);

    expect(screen.getByText("User2")).toBeInTheDocument();
    expect(screen.getByText("User3")).toBeInTheDocument();
  });

  it("devrait afficher un message si aucun partage", () => {
    vi.mocked(promptSharesHooks.usePromptShares).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(promptSharesHooks.useAddPromptShare).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(promptSharesHooks.useDeletePromptShare).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    render(<SharePromptDialog {...defaultProps} />);

    expect(screen.getByText(/Ce prompt n'est partagé avec aucun utilisateur/i)).toBeInTheDocument();
  });

  it("devrait appeler addShare lors du clic sur Partager", async () => {
    const mockAddShare = vi.fn();
    vi.mocked(promptSharesHooks.usePromptShares).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(promptSharesHooks.useAddPromptShare).mockReturnValue({
      mutate: mockAddShare,
      isPending: false,
    } as any);
    vi.mocked(promptSharesHooks.useDeletePromptShare).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    render(<SharePromptDialog {...defaultProps} />);

    const emailInput = screen.getByPlaceholderText(/utilisateur@exemple.com/i);
    fireEvent.change(emailInput, { target: { value: "new@test.com" } });

    const shareButton = screen.getByRole("button", { name: /partager/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockAddShare).toHaveBeenCalledWith(
        {
          promptId: "prompt-1",
          email: "new@test.com",
          permission: "READ",
        },
        expect.any(Object)
      );
    });
  });

  it("devrait appeler deleteShare lors du clic sur le bouton trash", async () => {
    const mockDeleteShare = vi.fn();
    vi.mocked(promptSharesHooks.usePromptShares).mockReturnValue({
      data: mockShares,
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(promptSharesHooks.useAddPromptShare).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(promptSharesHooks.useDeletePromptShare).mockReturnValue({
      mutate: mockDeleteShare,
    } as any);

    render(<SharePromptDialog {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText(/supprimer le partage/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteShare).toHaveBeenCalledWith("share-1", expect.any(Object));
    });
  });

  it("devrait afficher l'état de chargement", () => {
    vi.mocked(promptSharesHooks.usePromptShares).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: vi.fn(),
    } as any);
    vi.mocked(promptSharesHooks.useAddPromptShare).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(promptSharesHooks.useDeletePromptShare).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    render(<SharePromptDialog {...defaultProps} />);

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("devrait désactiver le bouton Partager pendant l'ajout", () => {
    vi.mocked(promptSharesHooks.usePromptShares).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(promptSharesHooks.useAddPromptShare).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);
    vi.mocked(promptSharesHooks.useDeletePromptShare).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    render(<SharePromptDialog {...defaultProps} />);

    const shareButton = screen.getByRole("button", { name: /partage en cours/i });
    expect(shareButton).toBeDisabled();
  });

  it("devrait permettre de changer la permission avant de partager", async () => {
    const mockAddShare = vi.fn();
    vi.mocked(promptSharesHooks.usePromptShares).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(promptSharesHooks.useAddPromptShare).mockReturnValue({
      mutate: mockAddShare,
      isPending: false,
    } as any);
    vi.mocked(promptSharesHooks.useDeletePromptShare).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    render(<SharePromptDialog {...defaultProps} />);

    const emailInput = screen.getByPlaceholderText(/utilisateur@exemple.com/i);
    fireEvent.change(emailInput, { target: { value: "new@test.com" } });

    const permissionSelect = screen.getByRole("combobox");
    fireEvent.click(permissionSelect);
    
    const writeOption = screen.getByText("Lecture et modification");
    fireEvent.click(writeOption);

    const shareButton = screen.getByRole("button", { name: /partager/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockAddShare).toHaveBeenCalledWith(
        {
          promptId: "prompt-1",
          email: "new@test.com",
          permission: "WRITE",
        },
        expect.any(Object)
      );
    });
  });
});
