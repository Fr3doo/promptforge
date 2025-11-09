import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLoadingState } from "../useLoadingState";

describe("useLoadingState", () => {
  const mockLoadingComponent = <div>Loading...</div>;
  const mockEmptyComponent = <div>No data</div>;
  const mockErrorComponent = (error: Error) => <div>Error: {error.message}</div>;

  it("should return loading state when isLoading is true", () => {
    const { result } = renderHook(() =>
      useLoadingState({
        isLoading: true,
        data: [],
        loadingComponent: mockLoadingComponent,
      })
    );

    expect(result.current.shouldRender).toBe(true);
    expect(result.current.content).toBe(mockLoadingComponent);
  });

  it("should return error state when error is present", () => {
    const mockError = new Error("Test error");
    const { result } = renderHook(() =>
      useLoadingState({
        isLoading: false,
        data: [],
        error: mockError,
        loadingComponent: mockLoadingComponent,
        errorComponent: mockErrorComponent,
      })
    );

    expect(result.current.shouldRender).toBe(true);
    expect(result.current.content).toEqual(mockErrorComponent(mockError));
  });

  it("should return empty state when data is empty", () => {
    const { result } = renderHook(() =>
      useLoadingState({
        isLoading: false,
        data: [],
        loadingComponent: mockLoadingComponent,
        emptyComponent: mockEmptyComponent,
        isEmpty: (data) => data.length === 0,
      })
    );

    expect(result.current.shouldRender).toBe(true);
    expect(result.current.content).toBe(mockEmptyComponent);
  });

  it("should not render fallback when data is available", () => {
    const { result } = renderHook(() =>
      useLoadingState({
        isLoading: false,
        data: [1, 2, 3],
        loadingComponent: mockLoadingComponent,
        emptyComponent: mockEmptyComponent,
        isEmpty: (data) => data.length === 0,
      })
    );

    expect(result.current.shouldRender).toBe(false);
    expect(result.current.content).toBe(null);
  });

  it("should prioritize loading over error and empty", () => {
    const mockError = new Error("Test error");
    const { result } = renderHook(() =>
      useLoadingState({
        isLoading: true,
        data: [],
        error: mockError,
        loadingComponent: mockLoadingComponent,
        errorComponent: mockErrorComponent,
        emptyComponent: mockEmptyComponent,
        isEmpty: (data) => data.length === 0,
      })
    );

    expect(result.current.shouldRender).toBe(true);
    expect(result.current.content).toBe(mockLoadingComponent);
  });

  it("should prioritize error over empty when both are present", () => {
    const mockError = new Error("Test error");
    const { result } = renderHook(() =>
      useLoadingState({
        isLoading: false,
        data: [],
        error: mockError,
        loadingComponent: mockLoadingComponent,
        errorComponent: mockErrorComponent,
        emptyComponent: mockEmptyComponent,
        isEmpty: (data) => data.length === 0,
      })
    );

    expect(result.current.shouldRender).toBe(true);
    expect(result.current.content).toEqual(mockErrorComponent(mockError));
  });

  it("should handle complex isEmpty logic", () => {
    interface DashboardData {
      recentPrompts: any[];
      favoritePrompts: any[];
      usageStats: any[];
    }

    const emptyData: DashboardData = {
      recentPrompts: [],
      favoritePrompts: [],
      usageStats: [],
    };

    const { result } = renderHook(() =>
      useLoadingState({
        isLoading: false,
        data: emptyData,
        loadingComponent: mockLoadingComponent,
        emptyComponent: mockEmptyComponent,
        isEmpty: (data) =>
          !data?.recentPrompts?.length &&
          !data?.favoritePrompts?.length &&
          !data?.usageStats?.length,
      })
    );

    expect(result.current.shouldRender).toBe(true);
    expect(result.current.content).toBe(mockEmptyComponent);
  });

  it("should not render empty state if isEmpty function is not provided", () => {
    const { result } = renderHook(() =>
      useLoadingState({
        isLoading: false,
        data: [],
        loadingComponent: mockLoadingComponent,
        emptyComponent: mockEmptyComponent,
        // isEmpty not provided
      })
    );

    expect(result.current.shouldRender).toBe(false);
    expect(result.current.content).toBe(null);
  });
});
