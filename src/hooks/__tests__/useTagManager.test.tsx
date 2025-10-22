import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTagManager } from "../useTagManager";

describe("useTagManager", () => {
  describe("initialization", () => {
    it("should initialize with empty tags by default", () => {
      const { result } = renderHook(() => useTagManager());

      expect(result.current.tags).toEqual([]);
      expect(result.current.tagInput).toBe("");
      expect(result.current.tagError).toBeNull();
    });

    it("should initialize with provided tags", () => {
      const initialTags = ["tag1", "tag2"];
      const { result } = renderHook(() => useTagManager(initialTags));

      expect(result.current.tags).toEqual(initialTags);
    });
  });

  describe("addTag", () => {
    it("should add a new tag successfully", () => {
      const { result } = renderHook(() => useTagManager());

      act(() => {
        result.current.setTagInput("newtag");
        result.current.addTag();
      });

      expect(result.current.tags).toContain("newtag");
      expect(result.current.tagInput).toBe("");
      expect(result.current.tagError).toBeNull();
    });

    it("should not add duplicate tags", () => {
      const { result } = renderHook(() => useTagManager());

      act(() => {
        result.current.setTagInput("tag1");
        result.current.addTag();
        result.current.setTagInput("tag1");
        result.current.addTag();
      });

      expect(result.current.tags.filter((t) => t === "tag1")).toHaveLength(1);
      expect(result.current.tagError).toBe("Ce tag existe déjà");
    });

    it("should trim whitespace from tags", () => {
      const { result } = renderHook(() => useTagManager());

      act(() => {
        result.current.setTagInput("  tag with spaces  ");
        result.current.addTag();
      });

      expect(result.current.tags).toContain("tag with spaces");
      expect(result.current.tagInput).toBe("");
    });

    it("should not add empty tags", () => {
      const { result } = renderHook(() => useTagManager());

      act(() => {
        result.current.setTagInput("   ");
        result.current.addTag();
      });

      expect(result.current.tags).toHaveLength(0);
      expect(result.current.tagError).toBeNull();
    });

    it("should enforce maximum number of tags", () => {
      const { result } = renderHook(() => useTagManager());

      act(() => {
        for (let i = 1; i <= 21; i++) {
          result.current.setTagInput(`tag${i}`);
          result.current.addTag();
        }
      });

      expect(result.current.tags).toHaveLength(20);
      expect(result.current.tagError).toContain("Vous ne pouvez pas avoir plus de 20 tags");
    });

    it("should enforce maximum tag length", () => {
      const { result } = renderHook(() => useTagManager());
      const longTag = "a".repeat(51);

      act(() => {
        result.current.setTagInput(longTag);
        result.current.addTag();
      });

      expect(result.current.tags).toHaveLength(0);
      expect(result.current.tagError).toContain("ne peut pas dépasser 50 caractères");
    });

    it("should validate tag format (alphanumeric, spaces, dashes, underscores only)", () => {
      const { result } = renderHook(() => useTagManager());

      act(() => {
        result.current.setTagInput("invalid@tag!");
        result.current.addTag();
      });

      expect(result.current.tags).toHaveLength(0);
      expect(result.current.tagError).toBeDefined();
    });

    it("should allow valid tag formats", () => {
      const { result } = renderHook(() => useTagManager());
      const validTags = ["tag-123", "tag_456", "tag 789"];

      validTags.forEach((tag) => {
        act(() => {
          result.current.setTagInput(tag);
          result.current.addTag();
        });
      });

      expect(result.current.tags).toHaveLength(validTags.length);
      expect(result.current.tagError).toBeNull();
    });
  });

  describe("removeTag", () => {
    it("should remove a tag successfully", () => {
      const { result } = renderHook(() => useTagManager());

      act(() => {
        result.current.setTagInput("tag1");
        result.current.addTag();
        result.current.setTagInput("tag2");
        result.current.addTag();
      });

      expect(result.current.tags).toHaveLength(2);

      act(() => {
        result.current.removeTag("tag1");
      });

      expect(result.current.tags).toEqual(["tag2"]);
      expect(result.current.tagError).toBeNull();
    });

    it("should clear error when removing a tag", () => {
      const { result } = renderHook(() => useTagManager());

      act(() => {
        result.current.setTagInput("tag1");
        result.current.addTag();
        result.current.setTagInput("tag1");
        result.current.addTag(); // This will set an error
      });

      expect(result.current.tagError).toBeDefined();

      act(() => {
        result.current.removeTag("tag1");
      });

      expect(result.current.tagError).toBeNull();
    });
  });

  describe("clearTagError", () => {
    it("should clear tag error", () => {
      const { result } = renderHook(() => useTagManager());

      act(() => {
        result.current.setTagInput("tag1");
        result.current.addTag();
        result.current.setTagInput("tag1");
        result.current.addTag(); // This will set an error
      });

      expect(result.current.tagError).toBeDefined();

      act(() => {
        result.current.clearTagError();
      });

      expect(result.current.tagError).toBeNull();
    });
  });

  describe("constants", () => {
    it("should expose maxTags constant", () => {
      const { result } = renderHook(() => useTagManager());

      expect(result.current.maxTags).toBe(20);
    });

    it("should expose maxTagLength constant", () => {
      const { result } = renderHook(() => useTagManager());

      expect(result.current.maxTagLength).toBe(50);
    });
  });
});
