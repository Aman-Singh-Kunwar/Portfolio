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
          <div className="glow-ring inline-flex items-center gap-3 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-amber-100 shadow-lg shadow-amber-950/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300" />
            </span>
            <span className="text-xs uppercase tracking-[0.22em] text-amber-200/80">
              Portfolio Visitors
            </span>
            <span className="text-base font-semibold text-white">{formatVisitCount(visitCount)}</span>
          </div>
        </div>

        <p className="order-2 md:order-3 md:text-right">
          Built with React, Node.js, MongoDB, and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
