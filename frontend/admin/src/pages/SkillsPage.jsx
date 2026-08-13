import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchPortfolio, updatePortfolio } from "../api";
import { PlusIcon, TrashIcon, RefreshIcon } from "../components/Icons";

const CATEGORIES = ["Frontend", "Backend & DB", "CMS & Core"];

export default function SkillsPage() {
  const { apiUrl, token } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    level: 80,
    category: "Frontend"
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPortfolio(apiUrl);
      setPortfolio(data);
    } catch (err) {
      setToast(err.message || "Failed to load skills");
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
      name: "",
      level: 80,
      category: "Frontend"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill, index) => {
    setEditIndex(index);
    setFormData({
      name: skill.name || "",
      level: typeof skill.level === "number" ? skill.level : 80,
      category: skill.category || "Frontend"
    });
    setIsModalOpen(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Skill name is required.");
      return;
    }

    const skillObj = {
      name: formData.name.trim(),
      level: Math.min(100, Math.max(0, Number(formData.level))),
      category: formData.category
    };

    const updatedSkills = [...(portfolio?.skills || [])];
    if (editIndex !== null) {
      updatedSkills[editIndex] = skillObj;
    } else {
      updatedSkills.push(skillObj);
    }

    const updatedPortfolio = {
      ...portfolio,
      skills: updatedSkills
    };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setIsModalOpen(false);
      setToast(editIndex !== null ? "Skill updated successfully!" : "Skill added successfully!");
    } catch (err) {
      alert(err.message || "Failed to save skill");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (index) => {
    if (!window.confirm(`Delete skill "${portfolio.skills[index]?.name}"?`)) return;

    const updatedSkills = portfolio.skills.filter((_, i) => i !== index);
    const updatedPortfolio = {
      ...portfolio,
      skills: updatedSkills
    };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setToast("Skill deleted.");
    } catch (err) {
      alert(err.message || "Failed to delete skill");
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

  const skills = portfolio?.skills || [];

  // Group by category
  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: skills.map((s, idx) => ({ ...s, originalIndex: idx })).filter((s) => s.category === cat)
  }));

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
          <h2 className="text-lg font-semibold text-white">Visual Skills Manager</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage technical skills, category groups, and proficiency percentage sliders (0-100%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={loadData} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshIcon className="h-3.5 w-3.5" /> Reload
          </button>
          <button type="button" onClick={handleOpenAdd} className="btn-primary text-xs flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" /> Add Technical Skill
          </button>
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-6">
        {grouped.map(({ category, items }) => (
          <div key={category} className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">{category}</h3>
              <span className="text-xs text-slate-400 font-mono">{items.length} skills</span>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No skills in this category yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3.5 rounded-xl border border-white/10 bg-slate-950/60 flex items-center justify-between gap-3 hover:border-white/20 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-white truncate">{skill.name}</span>
                        <span className="font-mono text-amber-300 font-bold">{skill.level}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(skill, skill.originalIndex)}
                        className="btn-secondary text-[11px] px-2.5 py-1"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill.originalIndex)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="card p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {editIndex !== null ? `Edit Skill: ${formData.name}` : "Add Technical Skill"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Skill Name *</label>
                <input
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. React.js, Node.js, Docker"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  className="input bg-slate-900 cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">Proficiency Level</label>
                  <span className="font-mono text-amber-300 font-bold text-sm">{formData.level}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  className="w-full accent-amber-400 cursor-pointer"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? "Saving..." : "Save Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
