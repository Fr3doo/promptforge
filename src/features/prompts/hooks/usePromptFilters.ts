import { useMemo } from "react";
import type { Prompt } from "../types";

export function usePromptFilters(prompts: Prompt[], searchQuery: string) {
  const filteredPrompts = useMemo(
    () =>
      prompts.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      ),
    [prompts, searchQuery]
  );

  return { filteredPrompts };
}
