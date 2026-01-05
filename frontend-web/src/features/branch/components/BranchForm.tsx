import { useMemo, useState } from "react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import type { Branch, CreateBranchPayload, UpdateBranchPayload } from "../types";

type BaseProps = {
  submitting?: boolean;
  onCancel: () => void;
};

type CreateProps = BaseProps & {
  mode: "create";
  initial?: never;
  onSubmit: (payload: CreateBranchPayload) => void | Promise<void>;
};

type EditProps = BaseProps & {
  mode: "edit";
  initial: Branch;
  onSubmit: (payload: UpdateBranchPayload) => void | Promise<void>;
};

type Props = CreateProps | EditProps;

type FormState = {
  name: string;
  code: string;
  address: string;
  city: string;
  contactNumber: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const onlyDigits = (v: string) => v.replace(/\D/g, "");

function getInitialState(props: Props): FormState {
  if (props.mode === "edit") {
    return {
      name: props.initial.name ?? "",
      code: props.initial.code ?? "",
      address: props.initial.address ?? "",
      city: props.initial.city ?? "",
      contactNumber: props.initial.contactNumber ?? "",
    };
  }
  return { name: "", code: "", address: "", city: "", contactNumber: "" };
}

export default function BranchForm(props: Props) {
  const formKey = props.mode === "edit" ? props.initial._id : "create";

  return <BranchFormInner key={formKey} {...props} />;
}

function BranchFormInner(props: Props) {
  const { submitting, onCancel } = props;

  const initialState = useMemo(() => getInitialState(props), [props]);
  const [form, setForm] = useState<FormState>(() => initialState);
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});

  const setField =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      setForm((prev) => ({
        ...prev,
        [key]: key === "code" ? raw.toUpperCase() : raw,
      }));
    };

  const onBlur = (key: keyof FormState) => () =>
    setTouched((p) => ({ ...p, [key]: true }));

  const errors: Errors = useMemo(() => {
    const e: Errors = {};

    const name = form.name.trim();
    const code = form.code.trim();
    const address = form.address.trim();
    const city = form.city.trim();
    const contactDigits = onlyDigits(form.contactNumber);

    if (!name) e.name = "Branch name is required";
    else if (name.length < 2) e.name = "Branch name is too short";

    if (!code) e.code = "Branch code is required";
    else if (!/^[A-Z0-9_-]{2,12}$/.test(code))
      e.code = "Use 2–12 chars (A-Z, 0-9, _ or -)";

    if (!address) e.address = "Address is required";
    if (!city) e.city = "City is required";

    if (!contactDigits) e.contactNumber = "Contact number is required";
    else if (contactDigits.length < 9 || contactDigits.length > 15)
      e.contactNumber = "Use 9–15 digits";

    return e;
  }, [form]);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    return Object.keys(errors).length === 0;
  }, [errors, submitting]);

  const submit = async () => {
    setTouched({
      name: true,
      code: true,
      address: true,
      city: true,
      contactNumber: true,
    });

    if (!canSubmit) return;

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      address: form.address.trim(),
      city: form.city.trim(),
      contactNumber: onlyDigits(form.contactNumber),
    };

    await props.onSubmit(payload as CreateBranchPayload & UpdateBranchPayload);
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Branch Name"
          value={form.name}
          onChange={setField("name")}
          onBlur={onBlur("name")}
          error={touched.name ? errors.name : undefined}
          placeholder="e.g. Colombo Main"
        />

        <Input
          label="Branch Code"
          value={form.code}
          onChange={setField("code")}
          onBlur={onBlur("code")}
          error={touched.code ? errors.code : undefined}
          hint="2–12 chars (A–Z / 0–9 / _ / -)"
          placeholder="e.g. CMB-01"
        />

        <div className="sm:col-span-2">
          <Input
            label="Address"
            value={form.address}
            onChange={setField("address")}
            onBlur={onBlur("address")}
            error={touched.address ? errors.address : undefined}
            placeholder="Street, area, etc."
          />
        </div>

        <Input
          label="City"
          value={form.city}
          onChange={setField("city")}
          onBlur={onBlur("city")}
          error={touched.city ? errors.city : undefined}
          placeholder="e.g. Colombo"
        />

        <Input
          label="Contact Number"
          value={form.contactNumber}
          onChange={setField("contactNumber")}
          onBlur={onBlur("contactNumber")}
          error={touched.contactNumber ? errors.contactNumber : undefined}
          hint="Numbers only, 9–15 digits"
          placeholder="07XXXXXXXX"
          inputMode="tel"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>

        <Button type="submit" loading={submitting} disabled={!canSubmit}>
          {props.mode === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}
