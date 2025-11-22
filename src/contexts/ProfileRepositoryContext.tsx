import { createContext, useContext, type ReactNode } from "react";
import {
  ProfileRepository,
  SupabaseProfileRepository,
} from "@/repositories/ProfileRepository";

const ProfileRepositoryContext = createContext<ProfileRepository | null>(null);

export interface ProfileRepositoryProviderProps {
  children: ReactNode;
  repository?: ProfileRepository;
}

/**
 * Provider du repository de profils
 * Permet l'injection de dépendances pour les tests
 */
export function ProfileRepositoryProvider({
  children,
  repository = new SupabaseProfileRepository(),
}: ProfileRepositoryProviderProps) {
  return (
    <ProfileRepositoryContext.Provider value={repository}>
      {children}
    </ProfileRepositoryContext.Provider>
  );
}

/**
 * Hook pour accéder au repository de profils
 * @throws {Error} Si utilisé hors d'un ProfileRepositoryProvider
 */
export function useProfileRepository(): ProfileRepository {
  const context = useContext(ProfileRepositoryContext);
  if (!context) {
    throw new Error(
      "useProfileRepository doit être utilisé dans un ProfileRepositoryProvider"
    );
  }
  return context;
}
