import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDraftAutoSave, saveDraft, loadDraft, clearDraft, hasDraft } from "../useDraftAutoSave";

describe("useDraftAutoSave", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("Auto-save functionality", () => {
    it("should save draft to localStorage after interval when enabled", async () => {
      const draftData = {
        title: "Test Title",
        description: "Test Description",
        content: "Test Content",
        tags: ["test", "draft"],
        enabled: true,
      };

      renderHook(() => useDraftAutoSave(draftData));

      // Initially, no draft should exist
      expect(hasDraft()).toBe(false);

      // Advance timers by 5 seconds (auto-save interval)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Draft should now be saved
      expect(hasDraft()).toBe(true);
      
      const savedDraft = loadDraft();
      expect(savedDraft).not.toBeNull();
      expect(savedDraft?.title).toBe("Test Title");
      expect(savedDraft?.description).toBe("Test Description");
      expect(savedDraft?.content).toBe("Test Content");
      expect(savedDraft?.tags).toEqual(["test", "draft"]);
      expect(savedDraft?.timestamp).toBeDefined();
    });

    it("should not save draft when all fields are empty", async () => {
      const emptyDraftData = {
        title: "",
        description: "",
        content: "",
        tags: [],
        enabled: true,
      };

      renderHook(() => useDraftAutoSave(emptyDraftData));

      // Advance timers
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // No draft should be saved
      expect(hasDraft()).toBe(false);
    });

    it("should save draft when at least one field has content", async () => {
      const partialDraftData = {
        title: "Just a title",
        description: "",
        content: "",
        tags: [],
        enabled: true,
      };

      renderHook(() => useDraftAutoSave(partialDraftData));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(hasDraft()).toBe(true);
      const savedDraft = loadDraft();
      expect(savedDraft?.title).toBe("Just a title");
    });

    it("should not save draft when disabled", async () => {
      const draftData = {
        title: "Test Title",
        description: "Test Description",
        content: "Test Content",
        tags: ["test"],
        enabled: false, // Disabled
      };

      renderHook(() => useDraftAutoSave(draftData));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Draft should not be saved when disabled
      expect(hasDraft()).toBe(false);
    });

    it("should update draft data on subsequent saves", async () => {
      const { rerender } = renderHook(
        ({ title, description, content, tags, enabled }) =>
          useDraftAutoSave({ title, description, content, tags, enabled }),
        {
          initialProps: {
            title: "Initial Title",
            description: "Initial Description",
            content: "Initial Content",
            tags: ["initial"],
            enabled: true,
          },
        }
      );

      // First auto-save
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      let savedDraft = loadDraft();
      expect(savedDraft?.title).toBe("Initial Title");

      // Update props
      rerender({
        title: "Updated Title",
        description: "Updated Description",
        content: "Updated Content",
        tags: ["updated"],
        enabled: true,
      });

      // Second auto-save
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      savedDraft = loadDraft();
      expect(savedDraft?.title).toBe("Updated Title");
      expect(savedDraft?.description).toBe("Updated Description");
      expect(savedDraft?.content).toBe("Updated Content");
      expect(savedDraft?.tags).toEqual(["updated"]);
    });

    it("should clean up interval on unmount", async () => {
      const draftData = {
        title: "Test",
        description: "",
        content: "Content",
        tags: [],
        enabled: true,
      };

      const { unmount } = renderHook(() => useDraftAutoSave(draftData));

      // First save
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(hasDraft()).toBe(true);
      clearDraft();

      // Unmount the hook
      unmount();

      // Advance time again
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // No new save should happen after unmount
      expect(hasDraft()).toBe(false);
    });
  });

  describe("Draft utility functions", () => {
    it("should save draft with timestamp", () => {
      const data = {
        title: "Saved Title",
        description: "Saved Description",
        content: "Saved Content",
        tags: ["tag1", "tag2"],
      };

      saveDraft(data);

      const loaded = loadDraft();
      expect(loaded).not.toBeNull();
      expect(loaded?.title).toBe(data.title);
      expect(loaded?.description).toBe(data.description);
      expect(loaded?.content).toBe(data.content);
      expect(loaded?.tags).toEqual(data.tags);
      expect(loaded?.timestamp).toBeDefined();
      expect(typeof loaded?.timestamp).toBe("number");
    });

    it("should return null when no draft exists", () => {
      expect(loadDraft()).toBeNull();
      expect(hasDraft()).toBe(false);
    });

    it("should clear draft from localStorage", () => {
      const data = {
        title: "To be deleted",
        description: "",
        content: "Content",
        tags: [],
      };

      saveDraft(data);
      expect(hasDraft()).toBe(true);

      clearDraft();
      expect(hasDraft()).toBe(false);
      expect(loadDraft()).toBeNull();
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage.setItem to throw an error (quota exceeded)
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });

      const data = {
        title: "Test",
        description: "",
        content: "Content",
        tags: [],
      };

      // Should not throw
      expect(() => saveDraft(data)).not.toThrow();

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });

    it("should handle corrupted data gracefully", () => {
      // Put invalid JSON in localStorage
      localStorage.setItem("prompt_draft_new", "invalid json {");

      // Should return null instead of throwing
      expect(loadDraft()).toBeNull();
    });
  });

  describe("Integration scenarios (Task 17)", () => {
    it("should save data during input, restore on reload, and clear after save", async () => {
      // Step 1: User types data
      const initialData = {
        title: "My New Prompt",
        description: "A detailed description",
        content: "This is the prompt content with {{variable}}",
        tags: ["ai", "testing"],
        enabled: true,
      };

      const { unmount } = renderHook(() => useDraftAutoSave(initialData));

      // Auto-save triggers
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(hasDraft()).toBe(true);

      // Step 2: Simulate closing the tab (unmount)
      unmount();

      // Step 3: Simulate reopening /prompts/new - load draft
      const restoredDraft = loadDraft();
      expect(restoredDraft).not.toBeNull();
      expect(restoredDraft?.title).toBe("My New Prompt");
      expect(restoredDraft?.description).toBe("A detailed description");
      expect(restoredDraft?.content).toBe("This is the prompt content with {{variable}}");
      expect(restoredDraft?.tags).toEqual(["ai", "testing"]);

      // Step 4: After successful save, clear draft
      clearDraft();
      expect(hasDraft()).toBe(false);
      expect(loadDraft()).toBeNull();
    });

    it("should not interfere with edit mode (enabled=false)", async () => {
      const editModeData = {
        title: "Editing existing prompt",
        description: "Some changes",
        content: "Updated content",
        tags: ["edit"],
        enabled: false, // Edit mode - auto-save disabled
      };

      renderHook(() => useDraftAutoSave(editModeData));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // No draft should be saved in edit mode
      expect(hasDraft()).toBe(false);
    });

    it("should preserve whitespace and special characters", async () => {
      const dataWithSpecialChars = {
        title: "  Title with spaces  ",
        description: "Description\nwith\nnewlines",
        content: "Content with {{var1}} and {{var2}}",
        tags: ["tag-with-dash", "tag_with_underscore"],
        enabled: true,
      };

      renderHook(() => useDraftAutoSave(dataWithSpecialChars));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      const saved = loadDraft();
      expect(saved?.title).toBe("  Title with spaces  ");
      expect(saved?.description).toBe("Description\nwith\nnewlines");
      expect(saved?.content).toBe("Content with {{var1}} and {{var2}}");
      expect(saved?.tags).toEqual(["tag-with-dash", "tag_with_underscore"]);
    });

    it("should handle rapid data changes correctly", async () => {
      const { rerender } = renderHook(
        ({ title, description, content, tags, enabled }) =>
          useDraftAutoSave({ title, description, content, tags, enabled }),
        {
          initialProps: {
            title: "Version 1",
            description: "",
            content: "Content 1",
            tags: [],
            enabled: true,
          },
        }
      );

      // Change data rapidly
      rerender({
        title: "Version 2",
        description: "Desc 2",
        content: "Content 2",
        tags: ["v2"],
        enabled: true,
      });

      rerender({
        title: "Version 3",
        description: "Desc 3",
        content: "Content 3",
        tags: ["v3"],
        enabled: true,
      });

      // Trigger auto-save
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should save the latest version
      const saved = loadDraft();
      expect(saved?.title).toBe("Version 3");
      expect(saved?.description).toBe("Desc 3");
      expect(saved?.content).toBe("Content 3");
      expect(saved?.tags).toEqual(["v3"]);
    });
  });
});
