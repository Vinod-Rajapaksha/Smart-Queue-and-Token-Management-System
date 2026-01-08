import { useMemo, useState } from "react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Badge from "../../../components/ui/Badge";

import type { CounterDto, CounterFormValues } from "../types";

type Props = {
  initial?: CounterDto | null;
  branchOptions: { label: string; value: string }[];
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    branchId: string;
    name: string;
    code: string | null;
    services: string[];
    isActive: boolean;
  }) => void;
};

function toFormValues(c?: CounterDto | null): CounterFormValues {
  return {
    branchId: c?.branch._id ?? "",
    name: c?.name ?? "",
    code: c?.code ?? "",
    servicesText: (c?.services ?? []).join(", "),
    isActive: c?.isActive ?? true,
  };
}

function parseServices(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CounterForm({
  initial,
  branchOptions,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) {
  const isEdit = Boolean(initial?._id);

  const [form, setForm] = useState<CounterFormValues>(() => toFormValues(initial));

  const servicesPreview = useMemo(
    () => parseServices(form.servicesText),
    [form.servicesText]
  );

  const canSubmit =
    form.branchId.trim().length > 0 && form.name.trim().length > 0 && !submitting;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      branchId: form.branchId,
      name: form.name.trim(),
      code: form.code.trim() ? form.code.trim() : null,
      services: servicesPreview,
      isActive: form.isActive,
    };

    onSubmit(payload);
  };

  return (
    <form key={initial?._id ?? "new"} onSubmit={submit} className="space-y-4">
      <Select
        label="Branch"
        value={form.branchId}
        disabled={isEdit}
        onChange={(v) => setForm((p) => ({ ...p, branchId: v }))}
        options={[
          ...branchOptions.map((b) => ({ value: b.value, label: b.label })),
        ]}
        placeholder="Select branch"
      />
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Counter name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder='e.g. "Counter 1"'
        />

        <Input
          label="Code (optional)"
          value={form.code}
          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          placeholder='e.g. "C1", "A-01"'
        />
      </div>

      <Input
        label="Services (comma separated)"
        value={form.servicesText}
        onChange={(e) => setForm((p) => ({ ...p, servicesText: e.target.value }))}
        placeholder="e.g. Deposits, Loans, Customer Care"
        hint="Example: Deposits, Loans, Customer Care"
      />

      {!!servicesPreview.length && (
        <div className="flex flex-wrap gap-2">
          {servicesPreview.map((s) => (
            <Badge key={s} variant="default">
              {s}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-gray-700/60 bg-gray-900/40 p-3">
        <div>
          <p className="text-sm font-medium text-gray-200">Active</p>
          <p className="text-xs text-gray-400">
            {form.isActive ? "Counter is active and usable" : "Counter is disabled"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
          className={[
            "relative inline-flex h-6 w-11 items-center rounded-full transition",
            form.isActive ? "bg-cyan-500/80" : "bg-gray-700",
          ].join(" ")}
          aria-label="Toggle active"
        >
          <span
            className={[
              "inline-block h-5 w-5 transform rounded-full bg-white transition",
              form.isActive ? "translate-x-5" : "translate-x-1",
            ].join(" ")}
          />
        </button>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isEdit ? "Update Counter" : "Create Counter"}
        </Button>
      </div>
    </form>
  );
}
