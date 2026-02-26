import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Case, CaseStatus, IncidentReport, IncidentType, Role, Severity, UserProfile } from '../backend';
import { toast } from 'sonner';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetMyProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['myProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getMyProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Keep for backward compat with ProfileSetupModal check
export function useGetCallerUserProfile() {
  return useGetMyProfile();
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Failed to register user';
      toast.error(msg);
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, role }: { principal: string; role: Role }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.setUserRole(Principal.fromText(principal), role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User role updated successfully');
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Failed to update user role';
      toast.error(msg);
    },
  });
}

export function useIsCallerAdmin() {
  const { data: profile } = useGetMyProfile();
  return { data: profile?.role === Role.admin };
}

// ─── Cases ───────────────────────────────────────────────────────────────────

export function useGetAllCases() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Case[]>({
    queryKey: ['cases'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCases();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCaseById(caseId: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Case | null>({
    queryKey: ['case', caseId?.toString()],
    queryFn: async () => {
      if (!actor || caseId === undefined) return null;
      return actor.getCaseById(caseId);
    },
    enabled: !!actor && !actorFetching && caseId !== undefined,
  });
}

export function useCreateCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, severity }: { title: string; description: string; severity: Severity }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCase(title, description, severity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Failed to create case';
      toast.error(msg);
    },
  });
}

export function useUpdateCaseStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, status }: { caseId: bigint; status: CaseStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCaseStatus(caseId, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId.toString()] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Failed to update case status';
      toast.error(msg);
    },
  });
}

export function useDeleteCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCase(caseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Failed to delete case';
      toast.error(msg);
    },
  });
}

export function useAddCaseNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, content }: { caseId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNoteToCase(caseId, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Failed to add note';
      toast.error(msg);
    },
  });
}

export function useAssignCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, analyst }: { caseId: bigint; analyst: string }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.assignCase(caseId, Principal.fromText(analyst));
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId.toString()] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Failed to assign case';
      toast.error(msg);
    },
  });
}

// ─── Incidents ───────────────────────────────────────────────────────────────

export function useGetAllIncidentReports() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<IncidentReport[]>({
    queryKey: ['incidents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllIncidentReports();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useReportIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      incidentType: IncidentType;
      description: string;
      affectedSystems: string;
      severity: Severity;
      reporterName: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitIncidentReport(
        params.title,
        params.incidentType,
        params.description,
        params.affectedSystems,
        params.severity,
        params.reporterName
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Failed to report incident';
      toast.error(msg);
    },
  });
}
