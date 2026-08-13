import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchPortfolio, updatePortfolio } from "../api";
import { PlusIcon, TrashIcon, CheckIcon, ExternalLinkIcon, RefreshIcon } from "../components/Icons";

export default function ProjectsPage() {
  const { apiUrl, token } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // null = creating new
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    summary: "",
    image: "",
    featured: false,
    techStack: "",
    demoUrl: "",
    repoUrl: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPortfolio(apiUrl);
      setPortfolio(data);
    } catch (err) {
      setToast(err.message || "Failed to load projects");
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
      slug: "",
      tagline: "",
      summary: "",
      image: "/images/projects/placeholder.jpg",
      featured: true,
      techStack: "React, Node.js, MongoDB",
      demoUrl: "https://",
      repoUrl: "https://github.com/Aman-Singh-Kunwar/"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project, index) => {
    setEditIndex(index);
    const techList = Array.isArray(project.techStack) && project.techStack.length > 0
      ? project.techStack
      : Array.isArray(project.tech) ? project.tech : [];

    setFormData({
      name: project.name || "",
      slug: project.slug || "",
      tagline: project.tagline || project.description || "",
      summary: project.summary || project.description || "",
      image: project.image || "",
      featured: project.featured !== undefined ? !!project.featured : true,
      techStack: techList.join(", "),
      demoUrl: project.links?.demo || "",
      repoUrl: project.links?.repo || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      alert("Project name and slug are required.");
      return;
    }

    const techArray = formData.techStack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const projectObj = {
      name: formData.name,
      slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
      tagline: formData.tagline || formData.name,
      summary: formData.summary || formData.tagline || formData.name,
      description: formData.summary || formData.tagline || formData.name,
      highlights: [formData.summary || formData.tagline || formData.name],
      tech: techArray.length ? techArray : ["React"],
      techStack: techArray.length ? techArray : ["React"],
      image: formData.image || "/images/placeholder.jpg",
      featured: formData.featured,
      links: {
        demo: formData.demoUrl || "",
        repo: formData.repoUrl || ""
      }
    };

    const updatedProjects = [...(portfolio?.projects || [])];
    if (editIndex !== null) {
      updatedProjects[editIndex] = projectObj;
    } else {
      updatedProjects.unshift(projectObj);
    }

    const updatedPortfolio = {
      ...portfolio,
      projects: updatedProjects
    };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setIsModalOpen(false);
      setToast(editIndex !== null ? "Project updated successfully!" : "Project added successfully!");
    } catch (err) {
      alert(err.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (index) => {
    if (!window.confirm(`Delete project "${portfolio.projects[index]?.name}"?`)) return;

    const updatedProjects = portfolio.projects.filter((_, i) => i !== index);
    const updatedPortfolio = {
      ...portfolio,
      projects: updatedProjects
    };

    setSaving(true);
    try {
      await updatePortfolio(apiUrl, token, updatedPortfolio);
      setPortfolio(updatedPortfolio);
      setToast("Project deleted.");
    } catch (err) {
      alert(err.message || "Failed to delete project");
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

  const projects = portfolio?.projects || [];

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
          <h2 className="text-lg font-semibold text-white">Visual Projects Manager</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage portfolio projects, tech tags, live demo URLs, and featured flags
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={loadData} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshIcon className="h-3.5 w-3.5" /> Reload
          </button>
          <button type="button" onClick={handleOpenAdd} className="btn-primary text-xs flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" /> Add Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((proj, idx) => (
          <div key={proj.slug || idx} className="card p-5 space-y-3 flex flex-col justify-between border border-white/10 hover:border-white/20 transition">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-base">{proj.name}</h3>
                    {proj.featured && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">slug: /{proj.slug}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">{proj.summary || proj.description || proj.tagline}</p>

              {/* Tech chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {((Array.isArray(proj.techStack) && proj.techStack.length > 0) ? proj.techStack : (Array.isArray(proj.tech) ? proj.tech : [])).map((tech) => (
                  <span key={tech} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {proj.links?.demo && (
                  <a href={proj.links.demo} target="_blank" rel="noreferrer" className="text-amber-300 hover:text-amber-200 flex items-center gap-1">
                    Live Demo <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                )}
                {proj.links?.repo && (
                  <a href={proj.links.repo} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1">
                    GitHub <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleOpenEdit(proj, idx)} className="btn-secondary text-[11px] px-3 py-1">
                  Edit
                </button>
                <button type="button" onClick={() => handleDeleteProject(idx)} className="text-rose-400 hover:text-rose-300 p-1">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {editIndex !== null ? `Edit Project: ${formData.name}` : "Add New Project"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Project Name *</label>
                <input
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Adhyan AI"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">URL Slug *</label>
                <input
                  required
                  className="input font-mono"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. adhyan-ai"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Short Tagline</label>
                <input
                  className="input"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. AI-powered learning assistant"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Full Summary</label>
                <textarea
                  className="input h-20 resize-none"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Detailed description of features and tech architecture..."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tech Stack (comma separated)</label>
                <input
                  className="input"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="React, Node.js, Express, MongoDB, Tailwind"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-400 mb-1">Live Demo URL</label>
                  <input
                    className="input font-mono text-[11px]"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">GitHub Repo URL</label>
                  <input
                    className="input font-mono text-[11px]"
                    value={formData.repoUrl}
                    onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                    placeholder="https://github.com/user/repo"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="proj-featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-white/20 bg-slate-900 text-amber-400"
                />
                <label htmlFor="proj-featured" className="text-slate-300 select-none cursor-pointer">
                  Feature this project on home page grid
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-xs flex items-center gap-1">
                  {saving ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
