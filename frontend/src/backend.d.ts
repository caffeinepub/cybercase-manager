import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IncidentReport {
    id: bigint;
    title: string;
    linkedCaseId: bigint;
    reporterName: string;
    createdAt: bigint;
    description: string;
    affectedSystems: string;
    severity: Severity;
    incidentType: IncidentType;
}
export interface Case {
    id: bigint;
    status: CaseStatus;
    title: string;
    createdAt: bigint;
    description: string;
    updatedAt: bigint;
    notes: Array<Note>;
    severity: Severity;
    reporter: Principal;
    assignedAnalyst?: Principal;
}
export interface UserProfile {
    principal: Principal;
    name: string;
    createdAt: bigint;
    role: Role;
}
export interface Note {
    content: string;
    author: string;
    timestamp: bigint;
}
export enum CaseStatus {
    resolved = "resolved",
    closed = "closed",
    open = "open",
    inProgress = "inProgress"
}
export enum IncidentType {
    dataBreach = "dataBreach",
    unauthorizedAccess = "unauthorizedAccess",
    other = "other",
    ddos = "ddos",
    phishing = "phishing",
    malware = "malware"
}
export enum Role {
    admin = "admin",
    analyst = "analyst"
}
export enum Severity {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNoteToCase(caseId: bigint, content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignCase(caseId: bigint, analystPrincipal: Principal): Promise<void>;
    createCase(title: string, description: string, severity: Severity): Promise<bigint>;
    deleteCase(id: bigint): Promise<void>;
    getAllCases(): Promise<Array<Case>>;
    getAllIncidentReports(): Promise<Array<IncidentReport>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCaseById(id: bigint): Promise<Case | null>;
    getIncidentReportById(id: bigint): Promise<IncidentReport | null>;
    getMyProfile(): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(name: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUserRole(target: Principal, role: Role): Promise<void>;
    submitIncidentReport(title: string, incidentType: IncidentType, description: string, affectedSystems: string, severity: Severity, reporterName: string): Promise<[bigint, bigint]>;
    updateCaseStatus(caseId: bigint, newStatus: CaseStatus): Promise<void>;
}
