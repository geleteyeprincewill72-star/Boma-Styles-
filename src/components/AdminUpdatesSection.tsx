import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Zap, 
  ShieldCheck, 
  Megaphone, 
  Calendar, 
  Eye, 
  Send, 
  Activity, 
  AlertTriangle,
  RefreshCw,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AppUpdate, WeeklyMaintenanceReport } from '../types';
import { 
  fetchAppUpdates, 
  saveAppUpdate, 
  publishAppUpdate, 
  deleteAppUpdate, 
  getCurrentDeployedVersion 
} from '../utils/firebase';

interface AdminUpdatesSectionProps {
  adminUserId: string;
  adminUserName: string;
}

export default function AdminUpdatesSection({
  adminUserId,
  adminUserName
}: AdminUpdatesSectionProps) {
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // Form Fields
  const [versionInput, setVersionInput] = useState('');
  const [releaseDateInput, setReleaseDateInput] = useState(
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  const [titleInput, setTitleInput] = useState('');
  const [summaryInput, setSummaryInput] = useState('');
  const [statusInput, setStatusInput] = useState<'draft' | 'published'>('draft');

  // Dynamic Bullet Items
  const [newFeatures, setNewFeatures] = useState<string[]>(['']);
  const [bugFixes, setBugFixes] = useState<string[]>(['']);
  const [performanceImprovements, setPerformanceImprovements] = useState<string[]>(['']);
  const [securityImprovements, setSecurityImprovements] = useState<string[]>(['']);
  const [announcements, setAnnouncements] = useState<string[]>(['']);

  // Maintenance & System Diagnostic State
  const [isRunningMaintenance, setIsRunningMaintenance] = useState(false);
  const [maintenanceReport, setMaintenanceReport] = useState<WeeklyMaintenanceReport | null>(null);
  const [maintenanceError, setMaintenanceError] = useState('');

  const currentRunningVersion = getCurrentDeployedVersion();

  const loadUpdates = async () => {
    setIsLoading(true);
    try {
      // First try server-side admin endpoint
      const res = await fetch('/api/admin/updates', {
        headers: {
          'x-admin-key': 'geleteyeprincewill72@gmail.com',
          'x-user-role': 'admin'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.updates) {
          setUpdates(data.updates);
          return;
        }
      }

      // Firestore fallback
      const list = await fetchAppUpdates(false);
      setUpdates(list);
    } catch (err) {
      console.warn("Updates fetch fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const resetForm = () => {
    setVersionInput('');
    setReleaseDateInput(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    setTitleInput('');
    setSummaryInput('');
    setStatusInput('draft');
    setNewFeatures(['']);
    setBugFixes(['']);
    setPerformanceImprovements(['']);
    setSecurityImprovements(['']);
    setAnnouncements(['']);
    setActiveEditingId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (u: AppUpdate) => {
    setActiveEditingId(u.id);
    setVersionInput(u.version);
    setReleaseDateInput(u.releaseDate);
    setTitleInput(u.title);
    setSummaryInput(u.summary || '');
    setStatusInput(u.status === 'published' ? 'published' : 'draft');
    setNewFeatures(u.newFeatures.length > 0 ? u.newFeatures : ['']);
    setBugFixes(u.bugFixes.length > 0 ? u.bugFixes : ['']);
    setPerformanceImprovements(u.performanceImprovements.length > 0 ? u.performanceImprovements : ['']);
    setSecurityImprovements(u.securityImprovements.length > 0 ? u.securityImprovements : ['']);
    setAnnouncements(u.importantAnnouncements.length > 0 ? u.importantAnnouncements : ['']);
    setIsFormOpen(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionInput.trim() || !titleInput.trim()) {
      alert("Please specify version and release title.");
      return;
    }

    const cleanFeatures = newFeatures.map(s => s.trim()).filter(Boolean);
    const cleanFixes = bugFixes.map(s => s.trim()).filter(Boolean);
    const cleanPerf = performanceImprovements.map(s => s.trim()).filter(Boolean);
    const cleanSec = securityImprovements.map(s => s.trim()).filter(Boolean);
    const cleanAnn = announcements.map(s => s.trim()).filter(Boolean);

    const updateRecord: AppUpdate = {
      id: activeEditingId || `update_${versionInput.trim().replace(/\./g, '_')}_${Date.now()}`,
      version: versionInput.trim(),
      releaseDate: releaseDateInput.trim(),
      title: titleInput.trim(),
      status: statusInput,
      newFeatures: cleanFeatures,
      bugFixes: cleanFixes,
      performanceImprovements: cleanPerf,
      securityImprovements: cleanSec,
      importantAnnouncements: cleanAnn,
      summary: summaryInput.trim(),
      isCurrentDeployed: versionInput.trim() === currentRunningVersion,
      createdAt: Date.now(),
      publishedAt: statusInput === 'published' ? Date.now() : undefined,
      authorAdminId: adminUserId,
      authorAdminName: adminUserName || 'Creator'
    };

    try {
      // 1. Post to Server API
      await fetch('/api/admin/updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'geleteyeprincewill72@gmail.com',
          'x-user-role': 'admin'
        },
        body: JSON.stringify(updateRecord)
      });

      // 2. Save to Firestore
      await saveAppUpdate(updateRecord);

      resetForm();
      loadUpdates();
      alert(`Update v${updateRecord.version} ${statusInput === 'published' ? 'published live' : 'saved as draft'} successfully!`);
    } catch (err) {
      alert("Error saving update: " + err);
    }
  };

  const handlePublish = async (u: AppUpdate) => {
    if (!window.confirm(`Publish update v${u.version} immediately for all users?`)) return;
    try {
      await fetch('/api/admin/updates/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'geleteyeprincewill72@gmail.com',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ id: u.id })
      });

      await publishAppUpdate(u.id, u.version);
      loadUpdates();
      alert(`Update v${u.version} is now published live!`);
    } catch (err) {
      alert("Error publishing update: " + err);
    }
  };

  const handleDelete = async (u: AppUpdate) => {
    if (!window.confirm(`Are you sure you want to delete update v${u.version}?`)) return;
    try {
      await fetch(`/api/admin/updates/${u.id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': 'geleteyeprincewill72@gmail.com',
          'x-user-role': 'admin'
        }
      });

      await deleteAppUpdate(u.id);
      loadUpdates();
    } catch (err) {
      alert("Error deleting update: " + err);
    }
  };

  // Run automated weekly maintenance and diagnostics
  const handleRunMaintenance = async () => {
    setIsRunningMaintenance(true);
    setMaintenanceError('');
    try {
      const res = await fetch('/api/admin/maintenance-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'geleteyeprincewill72@gmail.com',
          'x-user-role': 'admin'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setMaintenanceReport(json.report);
      } else {
        setMaintenanceError("Maintenance check failed to execute.");
      }
    } catch (err: any) {
      setMaintenanceError(err.message || "Failed to run maintenance check.");
    } finally {
      setIsRunningMaintenance(false);
    }
  };

  // Helper for dynamic bullet lists
  const handleBulletChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleAddBullet = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const handleRemoveBullet = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6" id="admin-updates-section">
      
      {/* Header with Release Trigger and Diagnostics */}
      <div className="bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Weekly Release & App Updates Manager
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-950 text-violet-300 border border-violet-700">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Current Deployed App Version: <strong className="text-emerald-400 font-bold">v{currentRunningVersion}</strong> • Weekly release cycle scheduled every Sunday
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRunMaintenance}
            disabled={isRunningMaintenance}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono font-medium transition flex items-center gap-2 shadow"
          >
            {isRunningMaintenance ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Scanning Subsystems...</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Run System Diagnostics</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Update</span>
          </button>
        </div>
      </div>

      {/* ==================== AUTOMATED MAINTENANCE DIAGNOSTIC REPORT ==================== */}
      {maintenanceReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                Weekly Maintenance & Pre-Release Diagnostic Scan
              </h4>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${
              maintenanceReport.overallStatus === 'passed'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : maintenanceReport.overallStatus === 'warning'
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : 'bg-rose-950 text-rose-300 border-rose-700'
            }`}>
              Status: {maintenanceReport.overallStatus}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {maintenanceReport.generatedSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {maintenanceReport.checks.map((chk, i) => (
              <div key={i} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{chk.name}</span>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                    chk.status === 'pass' ? 'bg-emerald-500/20 text-emerald-300' : chk.status === 'warn' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {chk.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono leading-tight">{chk.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== CREATE / EDIT UPDATE FORM MODAL / DRAWER ==================== */}
      {isFormOpen && (
        <div className="bg-slate-900 border border-violet-500/40 rounded-2xl p-6 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              {activeEditingId ? 'Edit App Update' : 'Author New Weekly Release Notes'}
            </h4>
            <button
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-100 transition"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveUpdate} className="space-y-5">
            
            {/* Version, Date & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Version Number (e.g. 2.5.0) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={versionInput}
                  onChange={e => setVersionInput(e.target.value)}
                  placeholder="2.5.0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-violet-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Release Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={releaseDateInput}
                  onChange={e => setReleaseDateInput(e.target.value)}
                  placeholder="August 23, 2026"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-violet-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Initial Status
                </label>
                <select
                  value={statusInput}
                  onChange={e => setStatusInput(e.target.value as 'draft' | 'published')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                >
                  <option value="draft">Draft (Private to Admin)</option>
                  <option value="published">Published Live</option>
                </select>
              </div>
            </div>

            {/* Title & Summary */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Headline / Release Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  placeholder="Aura 2.5.0 Weekly Milestone: Multimodal AI & Enhanced Security"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Summary Overview (Shown in notification banner)
                </label>
                <textarea
                  rows={2}
                  value={summaryInput}
                  onChange={e => setSummaryInput(e.target.value)}
                  placeholder="Brief summary of the most impactful improvements in this release..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-violet-500 resize-y"
                />
              </div>
            </div>

            {/* 1. New Features Bullets */}
            <div className="space-y-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> New Features & Capabilities
                </label>
                <button
                  type="button"
                  onClick={() => handleAddBullet(setNewFeatures)}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Plus className="w-3 h-3" /> Add Feature Item
                </button>
              </div>
              {newFeatures.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={e => handleBulletChange(setNewFeatures, idx, e.target.value)}
                    placeholder="e.g. Improved AI video generation resolution and prompt reasoning"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  {newFeatures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(setNewFeatures, idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 2. Bug Fixes Bullets */}
            <div className="space-y-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Bug Fixes
                </label>
                <button
                  type="button"
                  onClick={() => handleAddBullet(setBugFixes)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Plus className="w-3 h-3" /> Add Bug Fix
                </button>
              </div>
              {bugFixes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={e => handleBulletChange(setBugFixes, idx, e.target.value)}
                    placeholder="e.g. Fixed login retry token refresh and mobile drawer navigation"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  {bugFixes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(setBugFixes, idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 3. Performance Bullets */}
            <div className="space-y-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-cyan-400 font-mono uppercase flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Performance Improvements
                </label>
                <button
                  type="button"
                  onClick={() => handleAddBullet(setPerformanceImprovements)}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Plus className="w-3 h-3" /> Add Performance Item
                </button>
              </div>
              {performanceImprovements.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={e => handleBulletChange(setPerformanceImprovements, idx, e.target.value)}
                    placeholder="e.g. 50% faster image generation queue turnaround"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  {performanceImprovements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(setPerformanceImprovements, idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 4. Security Bullets */}
            <div className="space-y-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-violet-400 font-mono uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Security Hardening
                </label>
                <button
                  type="button"
                  onClick={() => handleAddBullet(setSecurityImprovements)}
                  className="text-xs text-violet-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Plus className="w-3 h-3" /> Add Security Item
                </button>
              </div>
              {securityImprovements.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={e => handleBulletChange(setSecurityImprovements, idx, e.target.value)}
                    placeholder="e.g. Restricted source code ZIP export strictly to creator"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                  {securityImprovements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(setSecurityImprovements, idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 5. Announcements */}
            <div className="space-y-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-400 font-mono uppercase flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" /> Announcements
                </label>
                <button
                  type="button"
                  onClick={() => handleAddBullet(setAnnouncements)}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Plus className="w-3 h-3" /> Add Announcement
                </button>
              </div>
              {announcements.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={e => handleBulletChange(setAnnouncements, idx, e.target.value)}
                    placeholder="e.g. New creator monetization payout schedule active"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                  {announcements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(setAnnouncements, idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Submit & Actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{activeEditingId ? 'Save Changes' : statusInput === 'published' ? 'Publish Update Live' : 'Save as Draft'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ==================== EXISTING RELEASES LIST ==================== */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
          Managed Application Releases ({updates.length})
        </h4>

        {isLoading ? (
          <div className="text-center py-10 text-slate-500 font-mono text-xs">
            Loading updates registry...
          </div>
        ) : updates.length > 0 ? (
          <div className="grid gap-4">
            {updates.map(u => (
              <div 
                key={u.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition shadow"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white font-mono bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                        v{u.version}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 font-sans">
                        {u.title}
                      </h4>
                      {u.isCurrentDeployed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono font-bold">
                          Current Running Build
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold border ${
                        u.status === 'published' 
                          ? 'bg-violet-950 text-violet-300 border-violet-700' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {u.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Released: {u.releaseDate}</span>
                      {u.authorAdminName && (
                        <span>• Author: {u.authorAdminName}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {u.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(u)}
                        className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleEditClick(u)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition"
                      title="Edit update notes"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(u)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete update"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {u.summary && (
                  <p className="text-xs text-slate-300 leading-relaxed pl-1">
                    {u.summary}
                  </p>
                )}

                {/* Counts Summary */}
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 flex-wrap pt-1 border-t border-slate-800/80">
                  <span className="text-emerald-400 font-medium">✨ {u.newFeatures?.length || 0} Features</span>
                  <span className="text-amber-400 font-medium">🛠️ {u.bugFixes?.length || 0} Fixes</span>
                  <span className="text-cyan-400 font-medium">⚡ {u.performanceImprovements?.length || 0} Performance</span>
                  <span className="text-violet-400 font-medium">🛡️ {u.securityImprovements?.length || 0} Security</span>
                  <span className="text-rose-400 font-medium">📢 {u.importantAnnouncements?.length || 0} Announcements</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No releases found in registry.</p>
          </div>
        )}
      </div>

    </div>
  );
}
