function formatVisitCount(count) {
  if (typeof count !== "number") {
    return "Counting visitors";
  }

  return new Intl.NumberFormat("en-IN").format(count);
}

export default function Footer({ visitCount }) {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto grid max-w-6xl gap-4 px-6 text-sm text-slate-400 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <p className="order-3 md:order-1">Copyright 2026 Aman Singh Kunwar. All rights reserved.</p>

        <div className="order-1 flex justify-center md:order-2">
          <div className="glow-ring group relative inline-flex items-center gap-3 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-amber-100 shadow-lg shadow-amber-950/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300" />
            </span>
            <span className="text-xs uppercase tracking-[0.22em] text-amber-200/80">
              Portfolio Visitors
            </span>
            <span className="text-base font-semibold text-white">{formatVisitCount(visitCount)}</span>
            <button
              type="button"
              className="grid h-6 w-6 place-items-center rounded-full border border-amber-200/30 bg-white/10 text-[11px] font-bold text-amber-100 transition hover:bg-amber-200/20 focus:outline-none focus:ring-2 focus:ring-amber-200/60"
              aria-label="Visitor count information"
            >
              i
            </button>
            <span className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-3 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-slate-950/95 px-4 py-3 text-center text-xs leading-relaxed text-slate-200 opacity-0 shadow-xl shadow-slate-950/40 transition group-hover:opacity-100 group-focus-within:opacity-100">
              Counts one visitor per browser session. Refreshing the page does not add extra views.
            </span>
          </div>
        </div>

        <p className="order-2 md:order-3 md:text-right">
          Built with React, Node.js, MongoDB, and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
