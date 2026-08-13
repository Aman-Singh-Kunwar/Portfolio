import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchPortfolio, updatePortfolio } from "../api";
import { PlusIcon, TrashIcon, ExternalLinkIcon, RefreshIcon } from "../components/Icons";

export default function AchievementsPage() {
  const { apiUrl, token } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // null = creating new
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    issuer: "",
    date: "",
    summary: "",
    descriptionText: "", // Joined with newlines
    link: "",
    coverImage: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPortfolio(apiUrl);
      setPortfolio(data);
    } catch (err) {
      setToast(err.message || "Failed to load achievements");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditIndex(null);
    setFormData({
      title: "",
      slug: "",
      issuer: "",
      date: new Date().toISOString().slice(0, 7),
      summary: "",
      descriptionText: "",
      link: "https://www.linkedin.com/posts/",
      coverImage: "/images/placeholder.jpg"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ach, index) => {
    setEditIndex(index);
    const desc = Array.isArray(ach.description)
      ? ach.description.join("\n")
      : ach.description || "";
    setFormData({
      title: ach.title || "",
      slug: ach.slug || "",
      issuer: ach.issuer || "",
      date: ach.date || "",
      summary: ach.summary || "",
      descriptionText: desc,
      link: ach.link || "",
      coverImage: ach.coverImage || ach.image || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      alert("Title and URL Slug are required.");
      return;
    }

    const descArray = formData.descriptionText
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);

    const cover = formData.coverImage.trim() || "/images/placeholder.jpg";

    const achObj = {
      title: formData.title,
      slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
      issuer: formData.issuer,
      date: formData.date,
      summary: formData.summary,
      description: descArray,
      link: formData.link,
      coverImage: cover,
      photos: [cover]
    };

    const updatedAchievements = [...(portfolio?.achievements || [])];
    if (editIndex !== null) {
      updatedAchievements[editIndex] = achObj;
    } else {
      updatedAchievements.unshift(achObj);
    }

    const updatedPortfolio = {
      ...portfolio,
      achievements: updatedAchievements
    };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setIsModalOpen(false);
      setToast(editIndex !== null ? "Achievement updated successfully!" : "Achievement added successfully!");
    } catch (err) {
      alert(err.message || "Failed to save achievement");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAchievement = async (index) => {
    if (!window.confirm(`Delete achievement "${portfolio.achievements[index]?.title}"?`)) return;

    const updatedAchievements = portfolio.achievements.filter((_, i) => i !== index);
    const updatedPortfolio = {
      ...portfolio,
      achievements: updatedAchievements
    };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setToast("Achievement deleted.");
    } catch (err) {
      alert(err.message || "Failed to delete achievement");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400/30 border-t-amber-400" />
      </div>
    );
  }

  const achievements = portfolio?.achievements || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl border border-amber-400/30 bg-amber-400/15 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-amber-200 shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="card p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Achievements & Certificates Manager</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage hackathon wins, internship certificates, awards, and milestone achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={loadData} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshIcon className="h-3.5 w-3.5" /> Reload
          </button>
          <button type="button" onClick={handleOpenAdd} className="btn-primary text-xs flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" /> Add Certificate / Milestone
          </button>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {achievements.map((ach, idx) => (
          <div key={ach.slug || idx} className="card p-5 space-y-3 flex flex-col justify-between border border-white/10 hover:border-white/20 transition">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white text-base leading-snug">{ach.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded border border-amber-400/30 bg-amber-400/10 text-amber-300">
                      {ach.issuer || "Certificate"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{ach.date}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">{ach.summary}</p>

              {Array.isArray(ach.description) && ach.description.length > 0 && (
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400 line-clamp-3">
                  {ach.description.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <div>
                {ach.link && (
                  <a href={ach.link} target="_blank" rel="noreferrer" className="text-amber-300 hover:text-amber-200 flex items-center gap-1">
                    View Certificate / Post <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleOpenEdit(ach, idx)} className="btn-secondary text-[11px] px-3 py-1">
                  Edit
                </button>
                <button type="button" onClick={() => handleDeleteAchievement(idx)} className="text-rose-400 hover:text-rose-300 p-1">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {editIndex !== null ? `Edit: ${formData.title}` : "Add New Achievement / Certificate"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Achievement Title *</label>
                <input
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Developathon Surge x DBUU - 1st Rank"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-400 mb-1">URL Slug *</label>
                  <input
                    required
                    className="input font-mono"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. developathon-surge"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Issuer / Organization</label>
                  <input
                    className="input"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="e.g. EVISPHERE TECH / DBUU"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Date / Month</label>
                <input
                  className="input font-mono"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="e.g. October 2025"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Short Summary</label>
                <input
                  className="input"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="e.g. Secured 1st position in the National Level Hackathon."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description Bullets (1 per line)</label>
                <textarea
                  className="input h-24 resize-none font-sans leading-relaxed"
                  value={formData.descriptionText}
                  onChange={(e) => setFormData({ ...formData, descriptionText: e.target.value })}
                  placeholder="Secured 1st position among 50+ teams&#10;Built EcoCommute sustainable transit app&#10;Presented live pitch to judges"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-400 mb-1">Certificate / Post Link</label>
                  <input
                    className="input font-mono text-[11px]"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://linkedin.com/posts/..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cover Image Path</label>
                  <input
                    className="input font-mono text-[11px]"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="/images/developathon.jpg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? "Saving..." : "Save Achievement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
