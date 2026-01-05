import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
};

export default function PageHeader({ title, subtitle, right }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          {title}
        </h2>
        {subtitle ? (
          <div className="mt-1 text-sm text-gray-400">{subtitle}</div>
        ) : null}
      </div>

      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
