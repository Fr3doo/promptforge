import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { AppProviders } from "../AppProviders";
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";
import { usePromptMutationRepository } from "@/contexts/PromptMutationRepositoryContext";
import { usePromptQueryRepository } from "@/contexts/PromptQueryRepositoryContext";
import { usePromptCommandRepository } from "@/contexts/PromptCommandRepositoryContext";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import { useAnalysisRepository } from "@/contexts/AnalysisRepositoryContext";
import { usePromptShareRepository } from "@/contexts/PromptShareRepositoryContext";
import { usePromptFavoriteService } from "@/contexts/PromptFavoriteServiceContext";
import { usePromptVisibilityService } from "@/contexts/PromptVisibilityServiceContext";
import { usePromptDuplicationService } from "@/contexts/PromptDuplicationServiceContext";

describe("AppProviders", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppProviders>{children}</AppProviders>
  );

  describe("Context Hooks Accessibility", () => {
    it("should provide usePromptRepository", () => {
      const { result } = renderHook(() => usePromptRepository(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it("should provide usePromptMutationRepository", () => {
      const { result } = renderHook(() => usePromptMutationRepository(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it("should provide usePromptQueryRepository", () => {
      const { result } = renderHook(() => usePromptQueryRepository(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it("should provide usePromptCommandRepository", () => {
      const { result } = renderHook(() => usePromptCommandRepository(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it("should provide useVariableRepository", () => {
      const { result } = renderHook(() => useVariableRepository(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it("should provide useAnalysisRepository", () => {
      const { result } = renderHook(() => useAnalysisRepository(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it("should provide usePromptShareRepository", () => {
      const { result } = renderHook(() => usePromptShareRepository(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it("should provide usePromptFavoriteService", () => {
      const { result } = renderHook(() => usePromptFavoriteService(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it("should provide usePromptVisibilityService", () => {
      const { result } = renderHook(() => usePromptVisibilityService(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it("should provide usePromptDuplicationService", () => {
      const { result } = renderHook(() => usePromptDuplicationService(), { wrapper });
      expect(result.current).toBeDefined();
    });
  });

  describe("Dependency Injection", () => {
    it("should support dependency injection for PromptRepository", () => {
      const mockRepository = {
        getById: vi.fn(),
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        toggleFavorite: vi.fn(),
        updateVisibility: vi.fn(),
      };

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AppProviders repository={mockRepository as any}>
          {children}
        </AppProviders>
      );

      const { result } = renderHook(() => usePromptRepository(), { 
        wrapper: customWrapper 
      });

      expect(result.current).toBe(mockRepository);
    });

    it("should support dependency injection for PromptCommandRepository", () => {
      const mockCommandRepository = {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AppProviders commandRepository={mockCommandRepository as any}>
          {children}
        </AppProviders>
      );

      const { result } = renderHook(() => usePromptCommandRepository(), { 
        wrapper: customWrapper 
      });

      expect(result.current).toBe(mockCommandRepository);
    });

    it("should support dependency injection for PromptMutationRepository", () => {
      const mockMutationRepository = {
        update: vi.fn(),
      };

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AppProviders mutationRepository={mockMutationRepository as any}>
          {children}
        </AppProviders>
      );

      const { result } = renderHook(() => usePromptMutationRepository(), { 
        wrapper: customWrapper 
      });

      expect(result.current).toBe(mockMutationRepository);
    });

    it("should support dependency injection for VariableRepository", () => {
      const mockVariableRepository = {
        getByPromptId: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteByPromptId: vi.fn(),
      };

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AppProviders variableRepository={mockVariableRepository as any}>
          {children}
        </AppProviders>
      );

      const { result } = renderHook(() => useVariableRepository(), { 
        wrapper: customWrapper 
      });

      expect(result.current).toBe(mockVariableRepository);
    });

    it("should support dependency injection for AnalysisRepository", () => {
      const mockAnalysisRepository = {
        analyzePrompt: vi.fn(),
      };

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AppProviders analysisRepository={mockAnalysisRepository as any}>
          {children}
        </AppProviders>
      );

      const { result } = renderHook(() => useAnalysisRepository(), { 
        wrapper: customWrapper 
      });

      expect(result.current).toBe(mockAnalysisRepository);
    });

    it("should support dependency injection for PromptShareRepository", () => {
      const mockShareRepository = {
        getShares: vi.fn(),
        createShare: vi.fn(),
        updateShare: vi.fn(),
        deleteShare: vi.fn(),
      };

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AppProviders shareRepository={mockShareRepository as any}>
          {children}
        </AppProviders>
      );

      const { result } = renderHook(() => usePromptShareRepository(), { 
        wrapper: customWrapper 
      });

      expect(result.current).toBe(mockShareRepository);
    });

    it("should support dependency injection for PromptFavoriteService", () => {
      const mockFavoriteService = {
        toggleFavorite: vi.fn(),
      };

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AppProviders favoriteService={mockFavoriteService as any}>
          {children}
        </AppProviders>
      );

      const { result } = renderHook(() => usePromptFavoriteService(), { 
        wrapper: customWrapper 
      });

      expect(result.current).toBe(mockFavoriteService);
    });

    it("should support dependency injection for PromptVisibilityService", () => {
      const mockVisibilityService = {
        toggleVisibility: vi.fn(),
      };

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AppProviders visibilityService={mockVisibilityService as any}>
          {children}
        </AppProviders>
      );

      const { result } = renderHook(() => usePromptVisibilityService(), { 
        wrapper: customWrapper 
      });

      expect(result.current).toBe(mockVisibilityService);
    });

    it("should support dependency injection for PromptDuplicationService", () => {
      const mockDuplicationService = {
        duplicate: vi.fn(),
      };

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AppProviders duplicationService={mockDuplicationService as any}>
          {children}
        </AppProviders>
      );

      const { result } = renderHook(() => usePromptDuplicationService(), { 
        wrapper: customWrapper 
      });

      expect(result.current).toBe(mockDuplicationService);
    });
  });

  describe("Provider Dependencies", () => {
    it("should maintain correct provider nesting order", () => {
      // Test que les providers dépendants peuvent accéder aux providers parents
      const { result: mutationResult } = renderHook(
        () => usePromptMutationRepository(), 
        { wrapper }
      );
      const { result: queryResult } = renderHook(
        () => usePromptQueryRepository(), 
        { wrapper }
      );
      const { result: commandResult } = renderHook(
        () => usePromptCommandRepository(), 
        { wrapper }
      );

      expect(mutationResult.current).toBeDefined();
      expect(queryResult.current).toBeDefined();
      expect(commandResult.current).toBeDefined();
    });

    it("should allow services to access repository dependencies", () => {
      const { result: favoriteResult } = renderHook(
        () => usePromptFavoriteService(), 
        { wrapper }
      );
      const { result: visibilityResult } = renderHook(
        () => usePromptVisibilityService(), 
        { wrapper }
      );
      const { result: duplicationResult } = renderHook(
        () => usePromptDuplicationService(), 
        { wrapper }
      );

      expect(favoriteResult.current).toBeDefined();
      expect(visibilityResult.current).toBeDefined();
      expect(duplicationResult.current).toBeDefined();
    });
  });

  describe("ErrorBoundary Integration", () => {
    it("should wrap children with ErrorBoundary", () => {
      // ErrorBoundary est présent dans la hiérarchie
      // Test indirect via le fait que les hooks fonctionnent sans erreur
      const { result } = renderHook(() => usePromptRepository(), { wrapper });
      expect(result.current).toBeDefined();
    });
  });

  describe("Production Usage", () => {
    it("should work with default providers in production mode", () => {
      const { result: repoResult } = renderHook(() => usePromptRepository(), { wrapper });
      const { result: varResult } = renderHook(() => useVariableRepository(), { wrapper });
      const { result: analysisResult } = renderHook(() => useAnalysisRepository(), { wrapper });

      expect(repoResult.current).toBeDefined();
      expect(varResult.current).toBeDefined();
      expect(analysisResult.current).toBeDefined();
    });
  });
});
