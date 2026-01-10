import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePromptPermissionCheck } from "../usePromptPermissionCheck";

// Mock useAuth
const mockUser = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUser(),
}));

// Mock usePrompt
const mockPromptData = vi.fn();
vi.mock("@/hooks/usePrompts", () => ({
  usePrompt: () => mockPromptData(),
}));

// Mock usePromptPermission
const mockPermission = vi.fn();
vi.mock("@/hooks/usePromptPermission", () => ({
  usePromptPermission: () => mockPermission(),
}));

describe("usePromptPermissionCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: authenticated user
    mockUser.mockReturnValue({ user: { id: "user-123" } });
    
    // Default: prompt loaded
    mockPromptData.mockReturnValue({
      data: { id: "prompt-123", owner_id: "user-123" },
      isLoading: false,
    });
    
    // Default: owner permissions
    mockPermission.mockReturnValue({
      canEdit: true,
      isOwner: true,
    });
  });

  describe("checkPermission()", () => {
    it("should return canSave: false with reason NO_USER when not authenticated", () => {
      mockUser.mockReturnValue({ user: null });

      const { result } = renderHook(() => usePromptPermissionCheck("prompt-123"));
      const permissionResult = result.current.checkPermission();

      expect(permissionResult).toEqual({
        canSave: false,
        reason: "NO_USER",
      });
    });

    it("should return canSave: true when no promptId (creation mode)", () => {
      const { result } = renderHook(() => usePromptPermissionCheck(undefined));
      const permissionResult = result.current.checkPermission();

      expect(permissionResult).toEqual({
        canSave: true,
      });
    });

    it("should return canSave: false with reason NO_PROMPT when prompt not loaded", () => {
      mockPromptData.mockReturnValue({
        data: null,
        isLoading: true,
      });

      const { result } = renderHook(() => usePromptPermissionCheck("prompt-123"));
      const permissionResult = result.current.checkPermission();

      expect(permissionResult).toEqual({
        canSave: false,
        reason: "NO_PROMPT",
      });
    });

    it("should return canSave: true when user is owner", () => {
      mockPermission.mockReturnValue({
        canEdit: true,
        isOwner: true,
      });

      const { result } = renderHook(() => usePromptPermissionCheck("prompt-123"));
      const permissionResult = result.current.checkPermission();

      expect(permissionResult).toEqual({
        canSave: true,
      });
    });

    it("should return canSave: true when user has WRITE permission (not owner)", () => {
      mockPermission.mockReturnValue({
        canEdit: true,
        isOwner: false,
      });

      const { result } = renderHook(() => usePromptPermissionCheck("prompt-123"));
      const permissionResult = result.current.checkPermission();

      expect(permissionResult).toEqual({
        canSave: true,
      });
    });

    it("should return canSave: false with reason NO_WRITE_ACCESS when no edit permission", () => {
      mockPermission.mockReturnValue({
        canEdit: false,
        isOwner: false,
      });

      const { result } = renderHook(() => usePromptPermissionCheck("prompt-123"));
      const permissionResult = result.current.checkPermission();

      expect(permissionResult).toEqual({
        canSave: false,
        reason: "NO_WRITE_ACCESS",
      });
    });

    it("should return canSave: true for owner even with canEdit false (edge case)", () => {
      // Edge case: isOwner should override canEdit
      mockPermission.mockReturnValue({
        canEdit: false,
        isOwner: true,
      });

      const { result } = renderHook(() => usePromptPermissionCheck("prompt-123"));
      const permissionResult = result.current.checkPermission();

      expect(permissionResult).toEqual({
        canSave: true,
      });
    });
  });

  describe("exposed properties", () => {
    it("should expose canEdit from usePromptPermission", () => {
      mockPermission.mockReturnValue({
        canEdit: true,
        isOwner: false,
      });

      const { result } = renderHook(() => usePromptPermissionCheck("prompt-123"));

      expect(result.current.canEdit).toBe(true);
    });

    it("should expose isOwner from usePromptPermission", () => {
      mockPermission.mockReturnValue({
        canEdit: true,
        isOwner: true,
      });

      const { result } = renderHook(() => usePromptPermissionCheck("prompt-123"));

      expect(result.current.isOwner).toBe(true);
    });
  });
});
