import { useRef, useState } from "react";
import { digitsOnly, ribuan } from "../lib/format";

/* ---------------- Penanda grup (aliran form, bukan panel terpisah) -------- */
export function GroupTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2 pt-1.5">
      <span className="whitespace-nowrap text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {children}
      </span>
      {hint && (
        <span className="truncate text-[9.5px] font-medium text-slate-300">
          {hint}
        </span>
      )}
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

/* ---------------- Grid helpers ---------------- */
export function Grid({
  cols = 2,
  children,
}: {
  cols?: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  const map = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" } as const;
  return <div className={`grid gap-1.5 ${map[cols]}`}>{children}</div>;
}

/* ---------------- Field ---------------- */
export function Field({
  label,
  hint,
  warn,
  error,
  required,
  span,
  name,
  children,
}: {
  label: string;
  hint?: string;
  warn?: string;
  error?: string;
  required?: boolean;
  span?: boolean;
  /** kunci data untuk scroll & fokus saat validasi gagal */
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      data-field={name}
      className={`block min-w-0 ${span ? "col-span-full" : ""}`}
    >
      <span className="mb-[1px] flex items-center gap-1 truncate text-[9.5px] font-semibold uppercase tracking-wide text-slate-400">
        <span className="truncate">{label}</span>
        {required && <span className="text-rose-400">*</span>}
        {warn && !error && (
          <span className="ml-auto shrink-0 truncate text-[9px] font-medium normal-case tracking-normal text-amber-500">
            {warn}
          </span>
        )}
      </span>
      {children}
      {error ? (
        <span className="mt-[1px] block text-[9.5px] font-medium text-rose-500">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-[1px] block truncate text-[9.5px] text-slate-400">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

/* ---------------- Input ---------------- */
const inputBase =
  "w-full rounded-md border bg-white px-2 py-[3px] text-[12px] leading-[1.35] text-slate-800 outline-none transition placeholder:text-slate-300";

const inputOk =
  "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const inputBad =
  "border-rose-300 bg-rose-50/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    upper?: boolean;
    invalid?: boolean;
  },
) {
  const { upper, className, onChange, invalid, ...rest } = props;
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={`${inputBase} ${invalid ? inputBad : inputOk} ${
        upper ? "uppercase" : ""
      } ${className ?? ""}`}
      onChange={(e) => {
        if (upper) e.target.value = e.target.value.toUpperCase();
        onChange?.(e);
      }}
    />
  );
}

/* ---------------- Input rupiah — otomatis jadi "652.000" saat diketik ------ */
export function RupiahInput({
  value,
  onValue,
  invalid,
  placeholder,
}: {
  /** angka saja, tanpa "Rp" & pemisah (mis. "652000") */
  value: string;
  onValue: (digits: string) => void;
  invalid?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
        Rp
      </span>
      <TextInput
        invalid={invalid}
        inputMode="numeric"
        className="pl-8 text-right tabular-nums"
        value={ribuan(value)}
        placeholder={placeholder}
        onChange={(e) => onValue(digitsOnly(e.target.value))}
      />
    </div>
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    invalid?: boolean;
  },
) {
  const { className, invalid, ...rest } = props;
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={`${inputBase} resize-y leading-snug ${
        invalid ? inputBad : inputOk
      } ${className ?? ""}`}
    />
  );
}

/* ---------------- Segmented ---------------- */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-md bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 truncate rounded px-1.5 py-[3px] text-[11px] font-medium transition ${
            value === o.value
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Checkbox row ---------------- */
export function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 py-[1px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3 w-3 shrink-0 accent-indigo-600"
      />
      <span className="text-[11px] leading-snug text-slate-600">{children}</span>
    </label>
  );
}

/* ---------------- Upload box (klik / seret) ---------------- */
export function UploadBox({
  label,
  hint,
  images,
  onFiles,
  onRemove,
  invalid,
  icon = "⬆",
}: {
  label: string;
  hint?: string;
  images?: string[];
  onFiles: (files: FileList | null) => void;
  onRemove?: (index: number) => void;
  invalid?: boolean;
  icon?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-[1px] rounded-md border border-dashed px-1 py-2 text-center transition ${
          over
            ? "border-indigo-400 bg-indigo-50 text-indigo-600"
            : invalid
              ? "border-rose-300 bg-rose-50/60 text-rose-400 hover:border-rose-400"
              : "border-slate-300 bg-slate-50 text-slate-400 hover:border-indigo-400 hover:text-indigo-500"
        }`}
      >
        <span className="text-[14px] leading-none">{icon}</span>
        <span className="text-[10.5px] font-semibold">{label}</span>
        <span className="text-[9px] leading-tight">
          {hint ?? "klik / seret gambar"}
        </span>
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />
      {!!images?.length && (
        <div className="mt-1 grid grid-cols-3 gap-1">
          {images.map((src, index) => (
            <div
              key={`${label}-${index}`}
              className="relative overflow-hidden rounded border border-slate-200 bg-white"
            >
              <img
                src={src}
                alt={`${label} ${index + 1}`}
                className="h-12 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove?.(index)}
                title={`Hapus ${label} ${index + 1}`}
                className="absolute right-0.5 top-0.5 rounded bg-white/90 px-1 text-[10px] font-bold leading-4 text-rose-600 shadow-sm transition hover:bg-rose-600 hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Button ---------------- */
export function Btn({
  children,
  variant = "ghost",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "dark";
}) {
  const styles: Record<string, string> = {
    primary: "bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700",
    dark: "bg-slate-900 text-white hover:bg-slate-800",
    ghost:
      "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition active:scale-[0.97] ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
