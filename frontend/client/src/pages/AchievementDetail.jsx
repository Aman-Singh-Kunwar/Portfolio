import { Link, useParams } from "react";
import { useEffect, useMemo, useState } from "react";

const getSlug = (item) =>
  item.slug || item.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function AchievementDetail({ portfolio }) {
  const { slug } = useParams();
  const achievements = portfolio.achievements || [];
  const achievement = useMemo(
    () => achievements.find((item) => getSlug(item) === slug),
    [achievements, slug]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    setActiveIndex(0);
  }, [achievement?.title]);

  const photos = (achievement?.photos || [])
    .map((photo) => (typeof photo === "string" ? photo.trim() : ""))
    .filter(Boolean);
  const hasPhotos = photos.length > 0;
  const coverImage = typeof achievement?.coverImage === "string" ? achievement.coverImage.trim() : "";
  const currentPhoto = hasPhotos
    ? photos[activeIndex]
    : coverImage || "/images/hackthewinter.jpg";

  const handlePrev = () => {
    if (!hasPhotos) return;
    setActiveIndex((index) => (index - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    if (!hasPhotos) return;
    setActiveIndex((index) => (index + 1) % photos.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, hasPhotos, photos.length]);

  const setAchievementFallbackImage = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/hackthewinter.jpg";
  };

  if (!achievement) {
    return (
      <section className="section">
        <div className="mx-auto max-w-4xl px-6">
          <div className="card p-8 text-center">
            <h1 className="text-2xl font-semibold">Achievement not found</h1>
            <p className="mt-3 text-sm text-slate-300">
              This achievement link might be outdated. Return to the main portfolio.
            </p>
            <Link to="/" className="btn-primary mt-6 inline-flex">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex items-center gap-3 text-sm text-slate-400">
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-200">{achievement.title}</span>
        </div>

        <div className="card card-3d overflow-hidden">
          <div className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">
                {achievement.issuer || "Achievement"}
              </p>
              {achievement.date && <span className="text-xs text-slate-400 font-mono">{achievement.date}</span>}
            </div>
            <h1 className="mt-3 text-3xl font-semibold">{achievement.title}</h1>
            
            {achievement.description && Array.isArray(achievement.description) ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {achievement.description.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : (
              achievement.description && (
                <p className="mt-4 text-sm text-slate-300">{achievement.description}</p>
              )
            )}
          </div>

          <div className="border-t border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Photo Gallery ({photos.length})</p>
              {hasPhotos && (
                <div className="flex items-center gap-2">
                  <button type="button" className="btn-secondary text-xs" onClick={handlePrev}>
                    ← Prev
                  </button>
                  <button type="button" className="btn-secondary text-xs" onClick={handleNext}>
                    Next →
                  </button>
                </div>
              )}
            </div>

            {currentPhoto ? (
              <div
                className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 cursor-zoom-in relative group"
                onClick={() => setIsLightboxOpen(true)}
                title="Click to open fullscreen Lightbox"
              >
                <img
                  src={currentPhoto}
                  alt={achievement.title}
                  width="1400"
                  height="788"
                  loading="eager"
                  decoding="async"
                  onError={setAchievementFallbackImage}
                  className="w-full h-auto object-contain transition group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="rounded-full bg-slate-950/80 border border-white/20 px-4 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md">
                    🔍 View Fullscreen Lightbox
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-10 text-center text-sm text-slate-400">
                Add certificate or event photos to display here.
              </div>
            )}

            {hasPhotos && (
              <div className="mt-4 flex flex-wrap gap-2.5">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-16 w-24 overflow-hidden rounded-xl border transition-all ${
                      index === activeIndex ? "border-amber-400 ring-2 ring-amber-400/30 scale-105" : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={photo}
                      alt=""
                      width="160"
                      height="128"
                      loading={Math.abs(index - activeIndex) <= 1 ? "eager" : "lazy"}
                      decoding="async"
                      onError={setAchievementFallbackImage}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 sm:p-6 animate-fade-in select-none"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          {/* Controls */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
            className="absolute top-4 right-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-slate-900 border border-white/20 text-white hover:bg-white/20 text-lg transition"
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {hasPhotos && photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 grid h-12 w-12 place-items-center rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-white/20 text-xl transition"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 grid h-12 w-12 place-items-center rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-white/20 text-xl transition"
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          {/* Main Photo */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto}
              alt={achievement.title}
              onError={setAchievementFallbackImage}
              className="max-h-[80vh] max-w-[85vw] object-contain rounded-xl border border-white/10 shadow-2xl"
            />
            {hasPhotos && (
              <p className="mt-3 text-xs font-mono text-slate-400">
                Photo {activeIndex + 1} of {photos.length} — Press Esc to exit, Arrow keys to navigate
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
