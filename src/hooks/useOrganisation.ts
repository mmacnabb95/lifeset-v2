// useOrganisation Hook - Provides organisation data and operations
import { useState, useEffect } from "react";
import { 
  getOrganisation, 
  getUserOrganisation, 
  joinOrganisationByCode, 
  leaveOrganisation,
  Organisation 
} from "../services/firebase/organisation";
import { useFirebaseUser } from "./useFirebaseUser";

export const useOrganisation = () => {
  const { userId } = useFirebaseUser();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadOrganisation();
  }, [userId]);

  const loadOrganisation = async () => {
    try {
      setLoading(true);
      setError(null);
      const org = await getUserOrganisation(userId);
      setOrganisation(org);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load organisation");
      setError(error);
      console.error("Error loading organisation:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinByCode = async (code: string) => {
    if (!userId) throw new Error("User not authenticated");
    
    try {
      setLoading(true);
      setError(null);
      const org = await joinOrganisationByCode(userId, code);
      setOrganisation(org);
      return org;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to join organisation");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const leave = async () => {
    if (!userId) throw new Error("User not authenticated");
    
    try {
      setLoading(true);
      setError(null);
      await leaveOrganisation(userId);
      setOrganisation(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to leave organisation");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    organisation,
    loading,
    error,
    joinByCode,
    leave,
    refetch: loadOrganisation
  };
};

