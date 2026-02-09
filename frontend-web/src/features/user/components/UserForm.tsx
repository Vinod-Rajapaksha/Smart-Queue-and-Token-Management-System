import { useMemo, useState } from "react";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import type { ROLES } from "../../../types/enums";
import type { Branch } from "../../branch/types";
import type { CreateUserInput, UpdateUserInput, UserListItem } from "../types";
import { Eye, EyeOff } from "lucide-react";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  branches: Branch[];
  initial?: UserListItem | null;
  onSubmit: (payload: CreateUserInput | UpdateUserInput) => Promise<void> | void;
  onCancel: () => void;

  currentUserRole?: ROLES | null;
  currentUserBranchId?: string | null;
};

type Touched = Partial<
  Record<"name" | "email" | "telephone" | "password" | "branch", boolean>
>;

export default function UserForm({
  mode,
  branches,
  initial,
  onSubmit,
  onCancel,
  currentUserRole,
  currentUserBranchId,
  }: Props) {
  const isCreate = mode === "create";
  
  const isManager = currentUserRole === "MANAGER";
  const isManagerCreate = isCreate && isManager;

  const hideBranchField = isManagerCreate;

  const initialRole: ROLES = useMemo(() => {
    if (!isCreate) return ((initial?.role as ROLES) ?? ("STAFF" as ROLES));
    if (isManagerCreate) return "STAFF" as ROLES;
    return (initial?.role as ROLES) ?? ("STAFF" as ROLES);
  }, [initial?.role, isCreate, isManagerCreate]);

  const initialBranchValue: string = useMemo(() => {
    if (!isCreate) return normalizeBranch(initial?.branch) ?? "none";
    if (isManagerCreate) return currentUserBranchId || "";
    return normalizeBranch(initial?.branch) ?? "none";
  }, [initial?.branch, isCreate, isManagerCreate, currentUserBranchId]);

  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");

  const [role, setRole] = useState<ROLES>(initialRole);
  const [branch, setBranch] = useState<string>(initialBranchValue);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Touched>({});

  const displayRole: ROLES = isManager ? ("STAFF" as ROLES) : role;
  const displayBranch: string = isManager ? currentUserBranchId ?? "" : branch;

  const VALID_ROLES = useMemo(
    () => ["ADMIN", "MANAGER", "STAFF", "CUSTOMER"] as ROLES[],
    []
  );

  const isEmail = (value: unknown) =>
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isStrongPassword = (value: unknown) =>
    typeof value === "string" &&
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      value
    );

  const isValidTelephone = (value: unknown) =>
    typeof value === "string" && /^\d{9,15}$/.test(value);

  const isValidName = (value: unknown) =>
    typeof value === "string" && /^[A-Za-z ]{2,50}$/.test(value.trim());

  const HINTS = {
    name: "2–50 characters. Letters and spaces only.",
    email: "Example: john@example.com",
    telephone: "9–15 digits. Numbers only.",
    branch: isManager
      ? "Branch is fixed to your branch."
      : "Optional. Select a branch if user belongs to a location.",
    password:
      "At least 8 chars with uppercase, lowercase, number, and special character.",
  } as const;

  const PLACEHOLDERS = {
    name: "John Silva",
    email: "john@example.com",
    telephone: "94771234567",
    password: "Min 8 chars with Aa1!",
  } as const;

  const nameValueOk = isValidName(name);
  const emailValueOk = Boolean(email) && isEmail(email.trim());
  const telValueOk = Boolean(telephone) && isValidTelephone(telephone.trim());
  const roleValueOk = displayRole ? VALID_ROLES.includes(displayRole) : true;

  const branchValueOk = hideBranchField
    ? true
    : displayBranch !== undefined &&
      displayBranch !== null &&
      typeof displayBranch === "string" &&
      displayBranch.length > 0;

  const passwordValueOk = isCreate
    ? Boolean(password) && isStrongPassword(password)
    : true;

  const nameError =
    touched.name && !nameValueOk
      ? "Name is required and should be 2–50 characters (letters and spaces only)"
      : "";

  const emailError =
    touched.email && !emailValueOk ? "A valid email address is required" : "";

  const telephoneError =
    touched.telephone && !telValueOk
      ? "Telephone is required and must have 9–15 digits"
      : "";

  const roleError =
    touched.name && !roleValueOk
      ? `Role must be one of: ${VALID_ROLES.join(", ")}`
      : "";

  const branchError =
    touched.branch && displayBranch !== "none" && typeof displayBranch !== "string"
      ? "Branch must be a valid ID string"
      : "";

  const passwordError =
    isCreate && touched.password && !passwordValueOk
      ? "Password must be at least 8 chars and include uppercase, lowercase, number, and special character"
      : "";

  const canSubmit = isCreate
    ? Boolean(
        nameValueOk &&
          emailValueOk &&
          telValueOk &&
          roleValueOk &&
          branchValueOk &&
          passwordValueOk
      )
    : Boolean(
        nameValueOk && emailValueOk && telValueOk && roleValueOk && branchValueOk
      );

  const roleOptions = useMemo(() => {
    if (isManager) return [{ label: "Staff", value: "STAFF" }];
    return [
      { label: "Manager", value: "MANAGER" },
      { label: "Staff", value: "STAFF" },
    ];
  }, [isManager]);

  const branchOptions = useMemo(() => {
    if (isManager) {
      const my = branches.find((b) => b._id === currentUserBranchId);
      if (!my) return [];
      return [{ label: `${my.name} (${my.code})`, value: my._id }];
    }

    const base = [{ label: "No branch", value: "none" }];
    const items = branches.map((b) => ({
      label: `${b.name} (${b.code})`,
      value: b._id,
    }));
    return [...base, ...items];
  }, [branches, isManager, currentUserBranchId]);

  function touchAll() {
    setTouched((t) => ({
      ...t,
      name: true,
      email: true,
      telephone: true,
      ...(hideBranchField ? {} : { branch: true }), 
      ...(isCreate ? { password: true } : {}),
    }));
  }

  async function submit() {
    touchAll();
    if (!canSubmit) return;

    const finalRole: ROLES = isManager ? ("STAFF" as ROLES) : role;
    const includeBranch = !isManagerCreate;

    const finalBranch: string =
      isManager && !isManagerCreate
        ? currentUserBranchId ?? displayBranch
        : branch;

    if (isCreate) {
      const payload: CreateUserInput = {
        name: name.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        role: finalRole,
        password,
        ...(includeBranch && finalBranch && finalBranch !== "none"
          ? { branch: finalBranch }
          : {}),
      };

      await onSubmit(payload);
      return;
    }

    const updates: UpdateUserInput = {
      name: name.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
      role: finalRole,
      ...(includeBranch && finalBranch && finalBranch !== "none"
        ? { branch: finalBranch }
        : {}),
    };

    await onSubmit(updates);
  }

  return (
    <div className="grid gap-4">
      <Input
        label="Name"
        value={name}
        placeholder={PLACEHOLDERS.name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        error={nameError}
        hint={!nameError ? HINTS.name : ""}
      />

      <Input
        label="Email"
        value={email}
        placeholder={PLACEHOLDERS.email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={emailError}
        hint={!emailError ? HINTS.email : ""}
      />

      <Input
        label="Telephone"
        value={telephone}
        placeholder={PLACEHOLDERS.telephone}
        inputMode="numeric"
        onChange={(e) => setTelephone(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={() => setTouched((t) => ({ ...t, telephone: true }))}
        error={telephoneError}
        hint={!telephoneError ? HINTS.telephone : ""}
      />

      <Select
        label="Role"
        value={displayRole}
        options={roleOptions}
        onChange={(value) => setRole(value as ROLES)}
        disabled={isManager}
      />
      {roleError ? <p className="text-xs text-red-400">{roleError}</p> : null}

      
      {!hideBranchField && (
        <>
          <Select
            label={isManager ? "Branch" : "Branch (optional)"}
            value={displayBranch}
            options={branchOptions}
            onChange={(value) => {
              setBranch(value);
              setTouched((t) => ({ ...t, branch: true }));
            }}
            disabled={isManager}
            hint={HINTS.branch}
          />
          {branchError ? (
            <p className="text-xs text-red-400">{branchError}</p>
          ) : null}
        </>
      )}

      {isCreate && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Password
          </label>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder={PLACEHOLDERS.password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className="pr-10"
              error={passwordError}
              hint={!passwordError ? HINTS.password : ""}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 flex items-center justify-center gap-5 mb-5" />
              ) : (
                <Eye className="h-5 w-5 flex items-center justify-center gap-5 mb-5" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="button" onClick={submit}>
          {isCreate ? "Create User" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBranch(branch: unknown): string | null {
  if (!branch) return null;
  if (typeof branch === "string") return branch;

  if (isRecord(branch)) {
    const id = branch["_id"];
    if (typeof id === "string") return id;
  }

  return null;
}
