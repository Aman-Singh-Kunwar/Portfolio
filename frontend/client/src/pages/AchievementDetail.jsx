import { Link, useParams } from "react-router-dom";
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    setActiveIndex(0);
  }, [achievement?.title]);
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

  const photos = (achievement.photos || [])
    .map((photo) => (typeof photo === "string" ? photo.trim() : ""))
    .filter(Boolean);
  const hasPhotos = photos.length > 0;
  const coverImage = typeof achievement.coverImage === "string" ? achievement.coverImage.trim() : "";
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
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {achievement.issuer || "Achievement"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold">{achievement.title}</h1>
            {achievement.date && <p className="mt-2 text-sm text-slate-300">{achievement.date}</p>}
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
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gallery</p>
              {hasPhotos && (
                <div className="flex items-center gap-2">
                  <button type="button" className="btn-secondary" onClick={handlePrev}>
                    Prev
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleNext}>
                    Next
                  </button>
                </div>
              )}
            </div>

            {currentPhoto ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
                <img
                  src={currentPhoto}
                  alt={achievement.title}
                  width="1400"
                  height="788"
                  loading="eager"
                  decoding="async"
                  onError={setAchievementFallbackImage}
                  className="w-full h-auto object-contain"
                />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-10 text-center text-sm text-slate-400">
                Add certificate or event photos to display here.
              </div>
            )}

            {hasPhotos && (
              <div className="mt-4 flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-16 w-20 overflow-hidden rounded-lg border ${
                      index === activeIndex ? "border-amber-300/60" : "border-white/10"
                    }`}
                  >
                    <img
                      src={photo}
                      alt=""
                      width="160"
                      height="128"
                      loading={Math.abs(index - activeIndex) <= 1 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority="low"
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
    </section>
  );
}
