import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// We reference this file in the build process. Do not remove or rename it.
// Use migration function from migration.mo.

actor {
  // Types
  public type Role = {
    #admin;
    #analyst;
  };

  public type Severity = {
    #critical;
    #high;
    #medium;
    #low;
  };

  public type CaseStatus = {
    #open;
    #inProgress;
    #resolved;
    #closed;
  };

  public type IncidentType = {
    #phishing;
    #malware;
    #ddos;
    #dataBreach;
    #unauthorizedAccess;
    #other;
  };

  public type Note = {
    author : Text;
    timestamp : Int;
    content : Text;
  };

  public type Case = {
    id : Nat;
    title : Text;
    description : Text;
    severity : Severity;
    status : CaseStatus;
    assignedAnalyst : ?Principal;
    reporter : Principal;
    createdAt : Int;
    updatedAt : Int;
    notes : [Note];
  };

  public type IncidentReport = {
    id : Nat;
    title : Text;
    incidentType : IncidentType;
    description : Text;
    affectedSystems : Text;
    severity : Severity;
    reporterName : Text;
    linkedCaseId : Nat;
    createdAt : Int;
  };

  public type UserProfile = {
    principal : Principal;
    name : Text;
    role : Role;
    createdAt : Int;
  };

  // State
  var nextCaseId = 1;
  var nextIncidentId = 1;

  let cases = Map.empty<Nat, Case>();
  let incidentReports = Map.empty<Nat, IncidentReport>();
  let userRegistry = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Internal helpers

  func isAnonymous(caller : Principal) : Bool {
    caller.toText() == "2vxsx-fae";
  };

  func requireRegistered(caller : Principal) {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principals are not allowed");
    };
    if (not userRegistry.containsKey(caller)) {
      Runtime.trap("User not registered. Please register first.");
    };
  };

  func requireAdminRole(caller : Principal) {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principals are not allowed");
    };
    switch (userRegistry.get(caller)) {
      case (null) {
        Runtime.trap("User not registered. Unable to verify privileges.");
      };
      case (?profile) {
        if (profile.role != #admin) {
          Runtime.trap("Must be Admin to perform this action");
        };
      };
    };
  };

  func requireAnalystOrAdminRole(caller : Principal) {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principals are not allowed");
    };
    switch (userRegistry.get(caller)) {
      case (null) {
        Runtime.trap("User not registered. Unable to verify privileges.");
      };
      case (?profile) {
        if (profile.role != #analyst and profile.role != #admin) {
          Runtime.trap("Must be Analyst or Admin to perform this action");
        };
      };
    };
  };

  // User Management

  public shared ({ caller }) func registerUser(name : Text) : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principals cannot register");
    };

    if (userRegistry.containsKey(caller)) {
      Runtime.trap("User already registered");
    };

    let role : Role = if (userRegistry.isEmpty()) {
      #admin;
    } else { #analyst };

    let profile : UserProfile = {
      principal = caller;
      name;
      role;
      createdAt = Time.now();
    };

    userRegistry.add(caller, profile);
  };

  // setUserRole: Admin-only, uses userRegistry for role check
  public shared ({ caller }) func setUserRole(target : Principal, role : Role) : async () {
    requireAdminRole(caller);

    switch (userRegistry.get(target)) {
      case (null) {
        Runtime.trap("User not found: " # target.toText());
      };
      case (?profile) {
        let updatedProfile = {
          profile with role;
        };
        userRegistry.add(target, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async UserProfile {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principals cannot have profiles");
    };
    switch (userRegistry.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found for principal " # caller.toText());
      };
      case (?profile) {
        profile;
      };
    };
  };

  // getAllUsers: Admin-only per implementation plan (User Management page)
  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    requireAdminRole(caller);
    userRegistry.values().toArray();
  };

  // getCallerUserProfile: required by frontend instructions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principals cannot have profiles");
    };
    userRegistry.get(caller);
  };

  // getUserProfile: required by frontend instructions; caller can view own profile, admin can view any
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principals are not allowed");
    };
    if (caller != user) {
      requireAdminRole(caller);
    };
    userRegistry.get(user);
  };

  // saveCallerUserProfile: required by frontend instructions; registered users only
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principals cannot save profiles");
    };
    if (not userRegistry.containsKey(caller)) {
      Runtime.trap("User not registered. Please register first.");
    };
    // Preserve role and principal from existing record; only allow name update
    switch (userRegistry.get(caller)) {
      case (null) {
        Runtime.trap("User not registered. Please register first.");
      };
      case (?existing) {
        let updatedProfile : UserProfile = {
          principal = existing.principal;
          name = profile.name;
          role = existing.role;
          createdAt = existing.createdAt;
        };
        userRegistry.add(caller, updatedProfile);
      };
    };
  };

  // Case Management

  // createCase: callable by Admin and Analyst
  public shared ({ caller }) func createCase(
    title : Text,
    description : Text,
    severity : Severity,
  ) : async Nat {
    requireAnalystOrAdminRole(caller);

    let caseId = nextCaseId;
    nextCaseId += 1;

    let newCase : Case = {
      id = caseId;
      title;
      description;
      severity;
      status = #open;
      assignedAnalyst = ?caller;
      reporter = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
      notes = [];
    };

    cases.add(caseId, newCase);
    caseId;
  };

  // getAllCases: requires registered user (Admin or Analyst)
  public query ({ caller }) func getAllCases() : async [Case] {
    requireRegistered(caller);
    cases.values().toArray();
  };

  // getCaseById: requires registered user (Admin or Analyst)
  public query ({ caller }) func getCaseById(id : Nat) : async ?Case {
    requireRegistered(caller);
    cases.get(id);
  };

  // updateCaseStatus: callable by Admin and Analyst
  public shared ({ caller }) func updateCaseStatus(caseId : Nat, newStatus : CaseStatus) : async () {
    requireAnalystOrAdminRole(caller);

    switch (cases.get(caseId)) {
      case (null) {
        Runtime.trap("Case not found [CaseID=" # caseId.toText() # "]");
      };
      case (?c) {
        let updatedCase = {
          c with status = newStatus;
          updatedAt = Time.now();
        };
        cases.add(caseId, updatedCase);
      };
    };
  };

  // addNoteToCase: callable by Admin and Analyst
  public shared ({ caller }) func addNoteToCase(caseId : Nat, content : Text) : async () {
    requireAnalystOrAdminRole(caller);

    switch (cases.get(caseId)) {
      case (null) {
        Runtime.trap("Case not found [CaseID=" # caseId.toText() # "]");
      };
      case (?c) {
        let note : Note = {
          author = caller.toText();
          timestamp = Time.now();
          content;
        };

        let newNotes = c.notes.concat([note]);
        let updatedCase = {
          c with notes = newNotes;
          updatedAt = Time.now();
        };
        cases.add(caseId, updatedCase);
      };
    };
  };

  // assignCase: Admin-only, uses userRegistry for role check
  public shared ({ caller }) func assignCase(caseId : Nat, analystPrincipal : Principal) : async () {
    requireAdminRole(caller);

    switch (cases.get(caseId)) {
      case (null) {
        Runtime.trap("Case not found [CaseID=" # caseId.toText() # "]");
      };
      case (?c) {
        let updatedCase = {
          c with assignedAnalyst = ?analystPrincipal;
          updatedAt = Time.now();
        };
        cases.add(caseId, updatedCase);
      };
    };
  };

  // deleteCase: Admin-only, uses userRegistry for role check
  public shared ({ caller }) func deleteCase(id : Nat) : async () {
    requireAdminRole(caller);

    if (cases.containsKey(id)) {
      cases.remove(id);
    } else {
      Runtime.trap("Case not found [CaseID=" # id.toText() # "]");
    };
  };

  // Incident Report Management

  // submitIncidentReport: callable by any authenticated (non-anonymous) registered user
  public shared ({ caller }) func submitIncidentReport(
    title : Text,
    incidentType : IncidentType,
    description : Text,
    affectedSystems : Text,
    severity : Severity,
    reporterName : Text,
  ) : async (Nat, Nat) {
    requireRegistered(caller);

    let incidentId = nextIncidentId;
    nextIncidentId += 1;

    let caseId = nextCaseId;
    nextCaseId += 1;

    let newCase : Case = {
      id = caseId;
      title;
      description;
      severity;
      status = #open;
      assignedAnalyst = ?caller;
      reporter = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
      notes = [];
    };

    cases.add(caseId, newCase);

    let newIncident : IncidentReport = {
      id = incidentId;
      title;
      incidentType;
      description;
      affectedSystems;
      severity;
      reporterName;
      linkedCaseId = caseId;
      createdAt = Time.now();
    };

    incidentReports.add(incidentId, newIncident);

    (incidentId, caseId);
  };

  // getAllIncidentReports: requires registered user
  public query ({ caller }) func getAllIncidentReports() : async [IncidentReport] {
    requireRegistered(caller);
    incidentReports.values().toArray();
  };

  // getIncidentReportById: requires registered user
  public query ({ caller }) func getIncidentReportById(id : Nat) : async ?IncidentReport {
    requireRegistered(caller);
    incidentReports.get(id);
  };
};
