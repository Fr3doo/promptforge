import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@/test/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { usePrompts } from "../usePrompts";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Mock toast utilities
vi.mock("@/lib/toastUtils", () => ({
  successToast: vi.fn(),
  errorToast: vi.fn(),
}));

interface WrapperProps {
  children: ReactNode;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  function TestWrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }
  
  return TestWrapper;
}

describe("usePrompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch prompts successfully", async () => {
    const mockPrompts = [
      { 
        id: "1", 
        title: "Prompt 1", 
        content: "Content 1",
        visibility: "PRIVATE",
        version: "1.0.0",
        tags: [],
        owner_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { 
        id: "2", 
        title: "Prompt 2", 
        content: "Content 2",
        visibility: "PRIVATE",
        version: "1.0.0",
        tags: [],
        owner_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockPrompts, error: null }),
      }),
    } as any);

    const { result } = renderHook(() => usePrompts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPrompts);
  });

  it("should handle fetch error", async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Error fetching prompts" },
        }),
      }),
    } as any);

    const { result } = renderHook(() => usePrompts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("should return empty array initially", () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as any);

    const { result } = renderHook(() => usePrompts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });
});
