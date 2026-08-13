import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchPortfolio, updatePortfolio } from "../api";
import { PlusIcon, TrashIcon, RefreshIcon } from "../components/Icons";

export default function ExperiencePage() {
  const { apiUrl, token } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState("experience"); // "experience" | "education"

  // Experience Modal state
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expEditIndex, setExpEditIndex] = useState(null);
  const [expFormData, setExpFormData] = useState({
    title: "",
    company: "",
    location: "",
    start: "",
    end: "",
    bulletsText: "",
    techText: ""
  });

  // Education Modal state
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [eduEditIndex, setEduEditIndex] = useState(null);
  const [eduFormData, setEduFormData] = useState({
    degree: "",
    institution: "",
    start: "",
    end: "",
    grade: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPortfolio(apiUrl);
      setPortfolio(data);
    } catch (err) {
      setToast(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- EXPERIENCE HANDLERS ---
  const handleOpenAddExp = () => {
    setExpEditIndex(null);
    setExpFormData({
      title: "",
      company: "",
      location: "",
      start: "",
      end: "Present",
      bulletsText: "",
      techText: "React, Node.js"
    });
    setIsExpModalOpen(true);
  };

  const handleOpenEditExp = (exp, idx) => {
    setExpEditIndex(idx);
    setExpFormData({
      title: exp.title || "",
      company: exp.company || "",
      location: exp.location || "",
      start: exp.start || "",
      end: exp.end || "",
      bulletsText: Array.isArray(exp.bullets) ? exp.bullets.join("\n") : exp.bullets || "",
      techText: Array.isArray(exp.tech) ? exp.tech.join(", ") : exp.tech || ""
    });
    setIsExpModalOpen(true);
  };

  const handleSaveExp = async (e) => {
    e.preventDefault();
    if (!expFormData.title.trim() || !expFormData.company.trim()) {
      alert("Job Title and Company are required.");
      return;
    }

    const bullets = expFormData.bulletsText.split("\n").map((b) => b.trim()).filter(Boolean);
    const tech = expFormData.techText.split(",").map((t) => t.trim()).filter(Boolean);

    const expObj = {
      title: expFormData.title.trim(),
      company: expFormData.company.trim(),
      location: expFormData.location.trim(),
      start: expFormData.start.trim(),
      end: expFormData.end.trim(),
      bullets,
      tech
    };

    const updatedExperience = [...(portfolio?.experience || [])];
    if (expEditIndex !== null) {
      updatedExperience[expEditIndex] = expObj;
    } else {
      updatedExperience.unshift(expObj);
    }

    const updatedPortfolio = { ...portfolio, experience: updatedExperience };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setIsExpModalOpen(false);
      setToast("Work Experience updated!");
    } catch (err) {
      alert(err.message || "Failed to save experience");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExp = async (idx) => {
    if (!window.confirm(`Delete experience "${portfolio.experience[idx]?.title}"?`)) return;

    const updatedExperience = portfolio.experience.filter((_, i) => i !== idx);
    const updatedPortfolio = { ...portfolio, experience: updatedExperience };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setToast("Work Experience deleted.");
    } catch (err) {
      alert(err.message || "Failed to delete experience");
    } finally {
      setSaving(false);
    }
  };

  // --- EDUCATION HANDLERS ---
  const handleOpenAddEdu = () => {
    setEduEditIndex(null);
    setEduFormData({
      degree: "",
      institution: "",
      start: "",
      end: "",
      grade: ""
    });
    setIsEduModalOpen(true);
  };

  const handleOpenEditEdu = (edu, idx) => {
    setEduEditIndex(idx);
    setEduFormData({
      degree: edu.degree || "",
      institution: edu.institution || "",
      start: edu.start || "",
      end: edu.end || "",
      grade: edu.grade || ""
    });
    setIsEduModalOpen(true);
  };

  const handleSaveEdu = async (e) => {
    e.preventDefault();
    if (!eduFormData.degree.trim() || !eduFormData.institution.trim()) {
      alert("Degree/Class and Institution are required.");
      return;
    }

    const eduObj = {
      degree: eduFormData.degree.trim(),
      institution: eduFormData.institution.trim(),
      start: eduFormData.start.trim(),
      end: eduFormData.end.trim(),
      grade: eduFormData.grade.trim()
    };

    const updatedEducation = [...(portfolio?.education || [])];
    if (eduEditIndex !== null) {
      updatedEducation[eduEditIndex] = eduObj;
    } else {
      updatedEducation.push(eduObj);
    }

    const updatedPortfolio = { ...portfolio, education: updatedEducation };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setIsEduModalOpen(false);
      setToast("Education updated!");
    } catch (err) {
      alert(err.message || "Failed to save education");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEdu = async (idx) => {
    if (!window.confirm(`Delete education "${portfolio.education[idx]?.degree}"?`)) return;

    const updatedEducation = portfolio.education.filter((_, i) => i !== idx);
    const updatedPortfolio = { ...portfolio, education: updatedEducation };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setToast("Education entry deleted.");
    } catch (err) {
      alert(err.message || "Failed to delete education");
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

  const experienceList = portfolio?.experience || [];
  const educationList = portfolio?.education || [];

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
          <h2 className="text-lg font-semibold text-white">Experience & Education Manager</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage work internships, volunteer positions, university degrees, and school board scores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={loadData} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshIcon className="h-3.5 w-3.5" /> Reload
          </button>
          {tab === "experience" ? (
            <button type="button" onClick={handleOpenAddExp} className="btn-primary text-xs flex items-center gap-1.5">
              <PlusIcon className="h-4 w-4" /> Add Work Experience
            </button>
          ) : (
            <button type="button" onClick={handleOpenAddEdu} className="btn-primary text-xs flex items-center gap-1.5">
              <PlusIcon className="h-4 w-4" /> Add Education Entry
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setTab("experience")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            tab === "experience"
              ? "bg-amber-400 text-slate-950 shadow-md"
              : "border border-white/10 text-slate-300 hover:text-white"
          }`}
        >
          💼 Work Experience ({experienceList.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("education")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            tab === "education"
              ? "bg-amber-400 text-slate-950 shadow-md"
              : "border border-white/10 text-slate-300 hover:text-white"
          }`}
        >
          🎓 Education & Boards ({educationList.length})
        </button>
      </div>

      {/* --- TAB 1: WORK EXPERIENCE --- */}
      {tab === "experience" && (
        <div className="space-y-4">
          {experienceList.length === 0 ? (
            <div className="card p-10 text-center text-xs text-slate-400">No work experience added yet.</div>
          ) : (
            experienceList.map((exp, idx) => (
              <div key={idx} className="card p-5 space-y-3 border border-white/10 hover:border-white/20 transition">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white text-base">{exp.title}</h3>
                    <p className="text-xs text-amber-300 font-medium mt-0.5">
                      {exp.company} — <span className="text-slate-400">{exp.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10">
                      {exp.start} – {exp.end}
                    </span>
                    <button type="button" onClick={() => handleOpenEditExp(exp, idx)} className="btn-secondary text-[11px] px-3 py-1">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteExp(idx)} className="text-rose-400 hover:text-rose-300 p-1">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300 leading-relaxed">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {Array.isArray(exp.tech) && exp.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                    {exp.tech.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 2: EDUCATION --- */}
      {tab === "education" && (
        <div className="space-y-4">
          {educationList.length === 0 ? (
            <div className="card p-10 text-center text-xs text-slate-400">No education entries added yet.</div>
          ) : (
            educationList.map((edu, idx) => (
              <div key={idx} className="card p-5 space-y-2 border border-white/10 hover:border-white/20 transition">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white text-base">{edu.degree}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{edu.institution}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10">
                      {edu.start} – {edu.end}
                    </span>
                    <button type="button" onClick={() => handleOpenEditEdu(edu, idx)} className="btn-secondary text-[11px] px-3 py-1">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteEdu(idx)} className="text-rose-400 hover:text-rose-300 p-1">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {edu.grade && (
                  <div className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                    {edu.grade}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* EXPERIENCE MODAL */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {expEditIndex !== null ? `Edit: ${expFormData.title}` : "Add Work Experience"}
              </h3>
              <button type="button" onClick={() => setIsExpModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Job Title / Role *</label>
                <input
                  required
                  className="input"
                  value={expFormData.title}
                  onChange={(e) => setExpFormData({ ...expFormData, title: e.target.value })}
                  placeholder="e.g. Web Development Intern"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Company / Organization *</label>
                <input
                  required
                  className="input"
                  value={expFormData.company}
                  onChange={(e) => setExpFormData({ ...expFormData, company: e.target.value })}
                  placeholder="e.g. Evon Technologies"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-slate-400 mb-1">Location</label>
                  <input
                    className="input"
                    value={expFormData.location}
                    onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
                    placeholder="e.g. Dehradun"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Start Date</label>
                  <input
                    className="input font-mono"
                    value={expFormData.start}
                    onChange={(e) => setExpFormData({ ...expFormData, start: e.target.value })}
                    placeholder="June 2026"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date</label>
                  <input
                    className="input font-mono"
                    value={expFormData.end}
                    onChange={(e) => setExpFormData({ ...expFormData, end: e.target.value })}
                    placeholder="August 2026 / Present"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Bullet Points (1 per line)</label>
                <textarea
                  className="input h-24 resize-none leading-relaxed"
                  value={expFormData.bulletsText}
                  onChange={(e) => setExpFormData({ ...expFormData, bulletsText: e.target.value })}
                  placeholder="Contributed to full stack development for live client platforms&#10;Built responsive UI components and customized themes&#10;Performed end to end UI testing and bug fixing"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tech Stack Used (comma separated)</label>
                <input
                  className="input font-mono"
                  value={expFormData.techText}
                  onChange={(e) => setExpFormData({ ...expFormData, techText: e.target.value })}
                  placeholder="React, PHP, WordPress, MySQL"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsExpModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? "Saving..." : "Save Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDUCATION MODAL */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="card p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {eduEditIndex !== null ? `Edit: ${eduFormData.degree}` : "Add Education Entry"}
              </h3>
              <button type="button" onClick={() => setIsEduModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdu} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Degree / Class Name *</label>
                <input
                  required
                  className="input"
                  value={eduFormData.degree}
                  onChange={(e) => setEduFormData({ ...eduFormData, degree: e.target.value })}
                  placeholder="e.g. Bachelor of Technology (CSE)"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Institution / School *</label>
                <input
                  required
                  className="input"
                  value={eduFormData.institution}
                  onChange={(e) => setEduFormData({ ...eduFormData, institution: e.target.value })}
                  placeholder="e.g. Dev Bhoomi Uttarakhand University"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-400 mb-1">Start Year</label>
                  <input
                    className="input font-mono"
                    value={eduFormData.start}
                    onChange={(e) => setEduFormData({ ...eduFormData, start: e.target.value })}
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Year</label>
                  <input
                    className="input font-mono"
                    value={eduFormData.end}
                    onChange={(e) => setEduFormData({ ...eduFormData, end: e.target.value })}
                    placeholder="2028"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Grade / CGPA / Percentage</label>
                <input
                  className="input font-mono"
                  value={eduFormData.grade}
                  onChange={(e) => setEduFormData({ ...eduFormData, grade: e.target.value })}
                  placeholder="e.g. CGPA: 9.29 or Percentage: 93.6%"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsEduModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? "Saving..." : "Save Education"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
