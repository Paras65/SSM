declare function isValidAdminPasscode(schoolPasscode: string | undefined, suppliedPasscode: string): boolean;
declare function isValidDeveloperPasscode(suppliedPasscode: string, developerPasscode?: string): boolean;

declare function requireSchoolScope(req: unknown, res: unknown, next: () => void): void;
declare function requireStudentAuth(req: unknown, res: unknown, next: () => void): void;
declare function requirePortalAuth(req: unknown, res: unknown, next: () => void): void;

export { isValidAdminPasscode, isValidDeveloperPasscode, requireSchoolScope, requireStudentAuth, requirePortalAuth };
