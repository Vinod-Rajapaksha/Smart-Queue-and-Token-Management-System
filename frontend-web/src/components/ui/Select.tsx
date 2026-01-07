import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  label?: string;
  error?: string;
  hint?: string;
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function AppSelect({
  label,
  error,
  hint,
  value,
  onChange,
  options,
  placeholder = "Select option",
  disabled = false,
  className = "",
}: Props) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}

      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          className={[
            "flex h-11 w-full items-center justify-between rounded-xl px-4 text-sm text-white",
            "bg-gray-900/40 backdrop-blur-md",
            "border outline-none transition-all",
            error
              ? "border-red-500/50 focus:ring-2 focus:ring-red-500/30"
              : "border-gray-700/60 focus:ring-2 focus:ring-cyan-500/30",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className,
          ].join(" ")}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="
              z-9999 overflow-hidden rounded-xl
              border border-gray-700/60
              bg-gray-900 shadow-xl
            "
          >
            <Select.Viewport className="p-1">
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="
                    relative flex cursor-pointer select-none items-center
                    rounded-lg px-3 py-2 text-sm text-gray-200
                    outline-none
                    data-[highlighted]:bg-cyan-500/15
                    data-[state=checked]:bg-cyan-500/20
                  "
                >
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-3">
                    <Check className="h-4 w-4 text-cyan-400" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}
