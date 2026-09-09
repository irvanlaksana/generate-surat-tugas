import { DOCS } from "../lib/modules";
import type { DocId, PreviewTab, RouteId } from "../lib/modules";

interface Props {
  route: RouteId;
  tab: PreviewTab;
  onRoute: (r: RouteId) => void;
  /** buka halaman isian, langsung ke tab dokumen tertentu */
  onOpenDoc: (t: PreviewTab) => void;
  docCounts: Record<DocId, { error: number; warning: number }>;
  formCounts: { error: number; warning: number };
  onContoh: () => void;
  onReset: () => void;
}

function dotClass(count: { error: number; warning: number }): string {
  if (count.error > 0) return "bg-rose-400";
  if (count.warning > 0) return "bg-amber-400";
  return "bg-emerald-400";
}

/** Navigasi: Beranda, form isian tunggal, dan pintasan dokumen. */
export default function SidebarNav({
  route,
  tab,
  onRoute,
  onOpenDoc,
  docCounts,
  formCounts,
  onContoh,
  onReset,
}: Props) {
  const isianActive = route === "isian";

  return (
    <>
      {/* ================== DESKTOP ================== */}
      <aside className="no-print hidden lg:flex lg:w-[218px] lg:shrink-0 lg:flex-col bg-slate-900 text-slate-100">
        <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[16px] shadow-lg shadow-indigo-950/40">
            📝
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[13.5px] font-bold leading-tight tracking-tight">
              Generator Surat
            </h1>
            <p className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
              Satu isian · 4 dokumen
            </p>
          </div>
        </div>

        <nav className="thin-scroll flex-1 space-y-0.5 overflow-y-auto px-2 pb-2 pt-1">
          <NavItem
            icon="🏠"
            label="Beranda"
            active={route === "home"}
            onClick={() => onRoute("home")}
          />
          <NavItem
            icon="🗂️"
            label="Isian Surat"
            active={isianActive && tab === "semua"}
            dot={dotClass(formCounts)}
            onClick={() => onOpenDoc("semua")}
          />

          <p className="px-2.5 pb-1 pt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Pratinjau Dokumen
          </p>
          {DOCS.map((d) => (
            <NavItem
              key={d.id}
              icon={d.icon}
              label={d.label}
              active={isianActive && tab === d.id}
              dot={dotClass(docCounts[d.id])}
              onClick={() => onOpenDoc(d.id)}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onContoh}
              className="flex-1 rounded-lg bg-white/5 px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Contoh
            </button>
            <button
              type="button"
              onClick={onReset}
              className="flex-1 rounded-lg bg-white/5 px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-rose-500/20 hover:text-rose-200"
            >
              Reset
            </button>
          </div>
          <p className="mt-2 px-1 text-[9px] leading-relaxed text-slate-500">
            Semua isian tersimpan otomatis di browser.
          </p>
        </div>
      </aside>

      {/* ================== MOBILE ================== */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-800 bg-slate-900 text-slate-100 lg:hidden">
        <div className="flex items-center gap-2 px-3 pb-1 pt-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px]">
            📝
          </div>
          <span className="text-[13px] font-bold tracking-tight">Generator Surat</span>
          <span className="ml-auto text-[9.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Satu isian
          </span>
        </div>
        <div className="thin-scroll flex gap-1 overflow-x-auto px-2 pb-2 pt-1">
          <Chip
            icon="🏠"
            label="Beranda"
            active={route === "home"}
            onClick={() => onRoute("home")}
          />
          <Chip
            icon="🗂️"
            label="Isian Surat"
            active={isianActive && tab === "semua"}
            dot={dotClass(formCounts)}
            onClick={() => onOpenDoc("semua")}
          />
          {DOCS.map((d) => (
            <Chip
              key={d.id}
              icon={d.icon}
              label={d.short}
              active={isianActive && tab === d.id}
              dot={dotClass(docCounts[d.id])}
              onClick={() => onOpenDoc(d.id)}
            />
          ))}
        </div>
      </header>
    </>
  );
}

function NavItem({
  icon,
  label,
  active,
  dot,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  dot?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium transition ${
        active
          ? "bg-white/10 text-white shadow-inner ring-1 ring-white/10"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-indigo-400" />
      )}
      <span className="w-[17px] shrink-0 text-center text-[14px]">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {dot && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      )}
    </button>
  );
}

function Chip({
  icon,
  label,
  active,
  dot,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  dot?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium transition ${
        active
          ? "bg-indigo-500 text-white shadow-sm shadow-indigo-950/50"
          : "bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      <span className="text-[12px] leading-none">{icon}</span>
      {label}
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
    </button>
  );
}
