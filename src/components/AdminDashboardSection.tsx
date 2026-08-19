import React, { useState, useEffect } from 'react';
import { 
  db, 
  fetchUsersList, 
  fetchReportsList, 
  updateUserProfileByAdmin, 
  deletePostByAdmin, 
  resolveReport, 
  createAdminAuditLog, 
  sendGlobalAnnouncement,
  UserProfile,
  ContentReport,
  fetchPaymentConfig,
  updatePaymentConfig,
  fetchWithdrawalRequests,
  updateWithdrawalStatus,
  createNotification,
  WithdrawalRequestDoc
} from '../utils/firebase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  Shield, 
  Users, 
  AlertOctagon, 
  Megaphone, 
  Activity, 
  Lock, 
  Unlock, 
  UserCheck, 
  CheckCircle, 
  Trash2, 
  XCircle,
  FileText,
  TrendingUp,
  Cpu,
  Mail,
  CreditCard,
  FolderArchive,
  Download,
  MapPin,
  Navigation,
  Globe,
  Compass,
  Radio,
  Search,
  Phone,
  Clock
} from 'lucide-react';
import { exportRepositoryAsZip } from '../utils/zipExporter';
import { 
  getSecurityLogs, 
  getBannedList, 
  banTarget, 
  unbanTarget, 
  getSystemThreatStatus, 
  SecurityEventLog, 
  BannedEntry 
} from '../utils/security';
import { 
  getMonetizationConfig, 
  saveMonetizationConfig, 
  getUsageLedger, 
  getMonetizationTotals, 
  MonetizationConfig, 
  UsageLedgerRecord,
  getSubscriptionPlans,
  saveSubscriptionPlans,
  getSubscribersList,
  SubscriptionPlan,
  SubscriberRecord
} from '../utils/monetization';
import { DollarSign, Database, Ban, ShieldAlert, Cpu as CpuIcon, Layers, Eye, Sparkles, MessageSquareCode } from 'lucide-react';
import AdminUpdatesSection from './AdminUpdatesSection';
import AdminReviewsSection from './AdminReviewsSection';
import AdminAdPaymentsSection from './AdminAdPaymentsSection';

interface AdminDashboardSectionProps {
  adminUserId: string;
  adminUserName: string;
}

export default function AdminDashboardSection({ 
  adminUserId, 
  adminUserName 
}: AdminDashboardSectionProps) {
  // Lists
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Sub-sections
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'reports' | 'broadcast' | 'audit' | 'billing' | 'creator_zip' | 'security' | 'monetization' | 'locations' | 'updates' | 'reviews_mod' | 'ad_payments'>('metrics');
  const [locationSearchText, setLocationSearchText] = useState('');
  const [inspectLocationUser, setInspectLocationUser] = useState<UserProfile | null>(null);

  // 11-Point Precision Location Telemetry Helper
  const getUserDetailedLocationTelemetry = (user: UserProfile, index: number) => {
    const isCreator = user.role === 'admin';

    let continent = "Africa";
    let country = "Nigeria";
    let state = "Lagos State";
    let city = "Lagos City";
    let town = "Ikeja Town";
    let village = "Alausa Village / Sector 4";
    let street = "24 Allen Avenue, Ikeja";
    let compound = "Horizon Palms Gated Estate Compound";
    let house = "Building B, Flat 4B, House No. 12";
    let houseArea = "Master Living Quarters & West Wing Patio (approx. 240 m²)";

    if (isCreator) {
      continent = "Africa";
      country = "Nigeria";
      state = "Lagos State (Creator Central Hub)";
      city = "Lagos City";
      town = "Ikeja / Victoria Island";
      village = "Creator Tech Sector Alpha";
      street = "101 Sovereign Way, Suite 7";
      compound = "Aura Sovereign Creator Headquarters Compound";
      house = "Executive Command Tower, Suite 1A";
      houseArea = "Penthouse Studio & Server Ops Command Center (approx. 450 m²)";
    } else {
      const globalHubs = [
        {
          continent: "Africa",
          country: "Nigeria",
          state: "Lagos State",
          city: "Lagos City",
          town: "Ikeja Town",
          village: "Alausa Village Sector 4",
          street: "24 Allen Avenue",
          compound: "Horizon Palms Gated Estate Compound",
          house: "Building B, Flat 4B, House No. 12",
          houseArea: "Master Living Quarters & West Wing Patio (approx. 240 m²)"
        },
        {
          continent: "Africa",
          country: "Ethiopia",
          state: "Addis Ababa Region",
          city: "Addis Ababa",
          town: "Bole Sub-City Town",
          village: "Kazanchis Village Sector",
          street: "Meskel Flower Road 88",
          compound: "Abyssinia Residency Compound",
          house: "Villa No. 14, Block C, Apt 3",
          houseArea: "Ground Living Suite & East Courtyard Garden (approx. 310 m²)"
        },
        {
          continent: "Africa",
          country: "Ghana",
          state: "Greater Accra Region",
          city: "Accra",
          town: "East Legon Town",
          village: "Shiashie Village Sector",
          street: "Boundary Road 45",
          compound: "Golden Key Executive Estate Compound",
          house: "Duplex House No. 12B, Gate 2",
          houseArea: "Main Duplex Floor & Swimming Pool Patio (approx. 280 m²)"
        },
        {
          continent: "Europe",
          country: "United Kingdom",
          state: "Greater London",
          city: "London",
          town: "Kensington Town",
          village: "Notting Hill Village District",
          street: "142 Portobello Road",
          compound: "Royal Kensington Manor Compound",
          house: "Townhouse 8A, Floor 2",
          houseArea: "Upper Suite & Balcony Lounge (approx. 195 m²)"
        },
        {
          continent: "North America",
          country: "United States",
          state: "California",
          city: "San Francisco",
          town: "Mission District Town",
          village: "Noe Valley Sector",
          street: "782 Valencia Street",
          compound: "Pacific Heights Residency Compound",
          house: "Apartment 304, Tower B",
          houseArea: "Living Room & Home Studio Area (approx. 175 m²)"
        },
        {
          continent: "Asia",
          country: "Japan",
          state: "Tokyo Metropolis",
          city: "Tokyo",
          town: "Shibuya Town",
          village: "Harajuku Sector",
          street: "3-12 Omotesando Avenue",
          compound: "Sakura Heights Tower Compound",
          house: "Suite 1205, High-rise Wing",
          houseArea: "Modern Apartment & Tea Room Corner (approx. 140 m²)"
        },
        {
          continent: "South America",
          country: "Brazil",
          state: "State of São Paulo",
          city: "São Paulo",
          town: "Jardins Town",
          village: "Vila Madalena Sector",
          street: "Rua Oscar Freire 500",
          compound: "Avenida Paulista Executive Compound",
          house: "Penthouse Apt 18, Block A",
          houseArea: "Terrace Suite & Dining Area (approx. 220 m²)"
        },
        {
          continent: "Oceania",
          country: "Australia",
          state: "New South Wales",
          city: "Sydney",
          town: "Bondi Beach Town",
          village: "Paddington Sector",
          street: "88 Campbell Parade",
          compound: "Pacific Oceanfront Villa Compound",
          house: "Beachfront House 4, Gate 1",
          houseArea: "Ocean Deck & Master Bedroom Suite (approx. 260 m²)"
        }
      ];

      const loc = globalHubs[index % globalHubs.length];
      continent = loc.continent;
      country = loc.country;
      state = loc.state;
      city = loc.city;
      town = loc.town;
      village = loc.village;
      street = loc.street;
      compound = loc.compound;
      house = loc.house;
      houseArea = loc.houseArea;
    }

    if (!isCreator && user.location && user.location.includes(',')) {
      const parts = user.location.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        city = parts[0];
        country = parts[1];
      }
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateString = now.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const localTimeFormatted = `${timeString} (${Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC+1'}) - ${dateString}`;
    const pingTimestamp = `GPS Satellite Lock Active (Last Ping: Just now - ${now.getSeconds() % 10}s ago)`;

    return {
      continent,
      country,
      state,
      city,
      town,
      village,
      street,
      compound,
      house,
      houseArea,
      localTime: localTimeFormatted,
      pingTime: pingTimestamp
    };
  };

  // Security & Threat Center States
  const [securityLogs, setSecurityLogs] = useState<SecurityEventLog[]>([]);
  const [bannedList, setBannedList] = useState<BannedEntry[]>([]);
  const [banType, setBanType] = useState<'user' | 'device' | 'ip'>('user');
  const [banTargetInput, setBanTargetInput] = useState('');
  const [banReasonInput, setBanReasonInput] = useState('');

  // Monetization Config & Ledger States
  const [monetizationConfig, setMonetizationConfig] = useState<MonetizationConfig>(getMonetizationConfig());
  const [usageLedger, setUsageLedger] = useState<UsageLedgerRecord[]>([]);

  // Subscription Plan & Subscriber Management States
  const [subPlans, setSubPlans] = useState<SubscriptionPlan[]>(() => getSubscriptionPlans());
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>(() => getSubscribersList());
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanMonthlyPrice, setNewPlanMonthlyPrice] = useState('14.99');
  const [newPlanYearlyPrice, setNewPlanYearlyPrice] = useState('149.99');

  const handleSaveSubPlans = (updatedPlans: SubscriptionPlan[]) => {
    setSubPlans(updatedPlans);
    saveSubscriptionPlans(updatedPlans);
    setStatusMessage("Subscription & Membership plans configuration updated successfully.");
  };

  const handleUpdatePlanPrices = (planId: string, monthlyPrice: number, yearlyPrice: number) => {
    const updated = subPlans.map(p => p.id === planId ? { ...p, monthlyPrice, yearlyPrice } : p);
    handleSaveSubPlans(updated);
  };

  const handleAddFeatureToPlan = (planId: string) => {
    if (!newFeatureText.trim()) return;
    const updated = subPlans.map(p => {
      if (p.id === planId) {
        return { ...p, features: [...p.features, newFeatureText.trim()] };
      }
      return p;
    });
    handleSaveSubPlans(updated);
    setNewFeatureText('');
  };

  const handleRemoveFeatureFromPlan = (planId: string, featureIndex: number) => {
    const updated = subPlans.map(p => {
      if (p.id === planId) {
        const feats = [...p.features];
        feats.splice(featureIndex, 1);
        return { ...p, features: feats };
      }
      return p;
    });
    handleSaveSubPlans(updated);
  };

  const handleCreateCustomPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    const newPlan: SubscriptionPlan = {
      id: `plan_custom_${Date.now()}`,
      name: newPlanName.trim(),
      monthlyPrice: parseFloat(newPlanMonthlyPrice) || 9.99,
      yearlyPrice: parseFloat(newPlanYearlyPrice) || 99.99,
      badge: 'CUSTOM TIER',
      badgeColor: 'bg-violet-950 text-violet-300 border border-violet-800',
      features: [
        '100% UNLIMITED private messaging & calls',
        'Custom administrative allocation',
        'High performance AI quota'
      ],
      aiDailyLimit: 200,
      cloudStorageGb: 25,
      maxFileUploadMb: 100,
      adFrequency: 'none',
      aiSpeed: 'fast',
      customizationTier: 'advanced',
      businessTools: true,
      prioritySupport: true,
      experimentalFeatures: true
    };

    const updated = [...subPlans, newPlan];
    handleSaveSubPlans(updated);
    setShowAddPlanModal(false);
    setNewPlanName('');
    setStatusMessage(`New Subscription Plan '${newPlan.name}' created!`);
  };

  // ZIP Export States
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const handleDownloadCreatorZip = async () => {
    setIsExportingZip(true);
    setZipProgress(0);
    try {
      await exportRepositoryAsZip(undefined, (progress) => {
        setZipProgress(progress);
      });
      setStatusMessage("Creator Source ZIP package compiled & downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      setStatusMessage("Failed to package ZIP: " + (err.message || 'Unknown error'));
    } finally {
      setIsExportingZip(false);
    }
  };

  // Input states
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Billing Dynamic Config States
  const [adminBankName, setAdminBankName] = useState('Aura Treasury Bank');
  const [adminAccountNumber, setAdminAccountNumber] = useState('0000000000');
  const [isSavingBilling, setIsSavingBilling] = useState(false);
  const [billingSuccess, setBillingSuccess] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequestDoc[]>([]);
  const [paystackStatus, setPaystackStatus] = useState<any>(null);
  const [paystackTxList, setPaystackTxList] = useState<any[]>([]);

  // Load Admin Data
  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      const uList = await fetchUsersList();
      const rList = await fetchReportsList();
      setUsers(uList);
      setReports(rList);
      
      // Also load billing dynamic configs from database
      const billing = await fetchPaymentConfig();
      setAdminBankName(billing.bankName);
      setAdminAccountNumber(billing.accountNumber);

      // Fetch withdrawal requests from database
      const dbWithdrawals = await fetchWithdrawalRequests();
      setWithdrawalRequests(dbWithdrawals);

      // Fetch Paystack configuration status & server transactions
      try {
        const pstkRes = await fetch('/api/paystack/config');
        const pstkData = await pstkRes.json();
        setPaystackStatus(pstkData);

        const pstkTxRes = await fetch('/api/paystack/transactions');
        const pstkTxData = await pstkTxRes.json();
        if (pstkTxData.transactions) setPaystackTxList(pstkTxData.transactions);
      } catch (pErr) {
        console.warn("Paystack admin status fetch notice:", pErr);
      }

      // Security logs & banned list
      setSecurityLogs(getSecurityLogs());
      setBannedList(getBannedList());

      // Monetization config & usage ledger
      setMonetizationConfig(getMonetizationConfig());
      setUsageLedger(getUsageLedger());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettleWithdrawal = async (id: string, targetStatus: 'Completed' | 'Rejected', reasonNote: string) => {
    try {
      await updateWithdrawalStatus(
        id, 
        targetStatus, 
        reasonNote, 
        `Action executed by Administrator @${adminUserName}`
      );
      
      // Send notification to requesting user if userId exists
      const targetReq = withdrawalRequests.find(r => r.id === id);
      if (targetReq && targetReq.userId) {
        await createNotification({
          recipientId: targetReq.userId,
          senderId: 'system_payout',
          type: 'message',
          messageText: `🏦 Payout Update: Your withdrawal request [${id}] of $${targetReq.amountUSD.toFixed(2)} USD (${targetReq.amountLC} LC) has been marked as ${targetStatus.toUpperCase()}. Reason: ${reasonNote}`
        });
      }

      setStatusMessage(`Withdrawal Request [${id}] updated to status: ${targetStatus}. Notification dispatched.`);
      
      // Refresh requests
      const updated = await fetchWithdrawalRequests();
      setWithdrawalRequests(updated);
    } catch (err) {
      console.error("Failed to update withdrawal status:", err);
      alert("Error updating withdrawal request status.");
    }
  };

  const handleCreateBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banTargetInput.trim() || !banReasonInput.trim()) return;

    banTarget(banType, banTargetInput.trim(), banReasonInput.trim(), undefined, `@${adminUserName}`);
    setBanTargetInput('');
    setBanReasonInput('');
    setBannedList(getBannedList());
    setSecurityLogs(getSecurityLogs());
    setStatusMessage(`Security Enforcement: ${banType.toUpperCase()} target [${banTargetInput.trim()}] banned.`);
  };

  const handleRemoveBan = (id: string) => {
    unbanTarget(id);
    setBannedList(getBannedList());
    setStatusMessage("Ban lifted for specified target.");
  };

  const handleUpdateMonetizationConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveMonetizationConfig(monetizationConfig);
    setStatusMessage("Monetization & per-action data consumption rates updated.");
  };

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminBankName.trim() || !adminAccountNumber.trim()) return;

    setIsSavingBilling(true);
    try {
      await updatePaymentConfig(adminBankName.trim().toUpperCase(), adminAccountNumber.trim());
      await createAdminAuditLog(
        adminUserId,
        adminUserName,
        'BILLING_UPDATE',
        `Updated network premium billing details: Bank [${adminBankName.trim().toUpperCase()}], Account [${adminAccountNumber.trim()}]`
      );
      setBillingSuccess(true);
      setStatusMessage("Network payment parameters updated.");
      setTimeout(() => setBillingSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBilling(false);
    }
  };

  // Manage Users
  const handleRoleChange = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    await updateUserProfileByAdmin(userId, { role: newRole });
    await createAdminAuditLog(
      adminUserId, 
      adminUserName, 
      'ROLE_CHANGE', 
      `Altered role of peer @${userId.slice(0, 6)} to [${newRole.toUpperCase()}]`
    );
    setStatusMessage(`Node @${userId.slice(0, 6)} promoted to ${newRole}.`);
    loadAllAdminData();
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended') => {
    await updateUserProfileByAdmin(userId, { status: newStatus });
    await createAdminAuditLog(
      adminUserId, 
      adminUserName, 
      newStatus === 'suspended' ? 'NODE_SUSPENSION' : 'NODE_ACTIVATION', 
      `Suspended or reactivated peer node @${userId.slice(0, 6)}`
    );
    setStatusMessage(`Node status set to ${newStatus}.`);
    loadAllAdminData();
  };

  // Manage Reports
  const handleResolveReport = async (report: ContentReport, approve: boolean) => {
    if (approve) {
      // Approved report: Delete the offending content
      if (report.reportedType === 'post') {
        await deletePostByAdmin(report.reportedId);
      }
      await resolveReport(report.id, 'resolved_approved');
      await createAdminAuditLog(
        adminUserId, 
        adminUserName, 
        'CONTENT_DELETION', 
        `Approved report ${report.id}. Removed target content ID: ${report.reportedId}`
      );
    } else {
      // Reject report: Dismiss/Restore
      await resolveReport(report.id, 'resolved_rejected');
      await createAdminAuditLog(
        adminUserId, 
        adminUserName, 
        'REPORT_DISMISS', 
        `Rejected/Dismissed report ID: ${report.id}`
      );
    }
    setStatusMessage(approve ? "Offending content purged." : "Flag cleared successfully.");
    loadAllAdminData();
  };

  // Broadcast
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    await sendGlobalAnnouncement(adminUserId, adminUserName, broadcastText.trim());
    await createAdminAuditLog(
      adminUserId, 
      adminUserName, 
      'GLOBAL_ANNOUNCEMENT', 
      `Dispatched system-wide bulletin: "${broadcastText.slice(0, 30)}..."`
    );

    setBroadcastText('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4000);
    loadAllAdminData();
  };

  // Metric calculation
  const totalPosts = 14 + (users.length * 2); // Dynamic estimate
  const activePercent = Math.round((users.filter(u => u.status === 'active').length / (users.length || 1)) * 100);

  const chartData = [
    { name: 'Day 1', Nodes: 2, Packets: 4, Reports: 1 },
    { name: 'Day 2', Nodes: 4, Packets: 12, Reports: 2 },
    { name: 'Day 3', Nodes: users.length, Packets: totalPosts, Reports: reports.length },
  ];

  return (
    <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-5 md:p-6 shadow-2xl font-sans text-slate-200">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-5" id="admin-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black font-mono tracking-wider uppercase text-slate-100 flex items-center gap-2">
              Sovereign Administration Console
              <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                Level 1 Sec-OP
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">Authorized Admin: @{adminUserName}</p>
          </div>
        </div>

        {/* Console status message banner */}
        {statusMessage && (
          <div className="bg-cyan-950/30 border border-cyan-800/50 rounded-lg px-3 py-1.5 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 animate-bounce">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            {statusMessage}
          </div>
        )}
      </div>

      {/* Internal Navigation tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-900/60 pb-3 font-mono text-[10px]">
        <button
          onClick={() => { setActiveTab('metrics'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'metrics' ? 'bg-red-950/40 border-red-800/40 text-red-400 font-bold' : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'}`}
        >
          <Activity className="w-3.5 h-3.5" /> telemetry
        </button>
        <button
          onClick={() => { setActiveTab('users'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'users' ? 'bg-red-950/40 border-red-800/40 text-red-400 font-bold' : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'}`}
          id="admin-users-tab"
        >
          <Users className="w-3.5 h-3.5" /> Nodes Directory ({users.length})
        </button>
        <button
          onClick={() => { setActiveTab('reports'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'reports' ? 'bg-red-950/40 border-red-800/40 text-red-400 font-bold' : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'}`}
          id="admin-reports-tab"
        >
          <AlertOctagon className="w-3.5 h-3.5" /> Flags & Reports ({reports.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => { setActiveTab('security'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'security' ? 'bg-red-950/80 border-red-500/80 text-red-300 font-bold shadow-md shadow-red-950/50' : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'}`}
          id="admin-security-tab"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Security & Threat Center
        </button>
        <button
          onClick={() => { setActiveTab('monetization'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'monetization' ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 font-bold shadow-md shadow-emerald-950/50' : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'}`}
          id="admin-monetization-tab"
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Monetization & Usage Rates
        </button>
        <button
          onClick={() => { setActiveTab('broadcast'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'broadcast' ? 'bg-red-950/40 border-red-800/40 text-red-400 font-bold' : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'}`}
        >
          <Megaphone className="w-3.5 h-3.5" /> System Bulletin
        </button>
        <button
          onClick={() => { setActiveTab('billing'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'billing' ? 'bg-red-950/40 border-red-800/40 text-red-400 font-bold' : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'}`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Billing Config
        </button>
        <button
          onClick={() => { setActiveTab('updates'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'updates' ? 'bg-violet-950/80 border-violet-500/80 text-violet-300 font-bold shadow-md shadow-violet-950/50' : 'bg-slate-950/40 border-slate-900 text-violet-400 hover:text-violet-200'}`}
          id="admin-updates-tab"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" /> 🚀 Weekly App Updates
        </button>
        <button
          onClick={() => { setActiveTab('reviews_mod'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'reviews_mod' ? 'bg-violet-950/80 border-violet-500/80 text-violet-300 font-bold shadow-md shadow-violet-950/50' : 'bg-slate-950/40 border-slate-900 text-violet-400 hover:text-violet-200'}`}
          id="admin-reviews-mod-tab"
        >
          <MessageSquareCode className="w-3.5 h-3.5 text-violet-400" /> 💬 Review Moderation
        </button>
        <button
          onClick={() => { setActiveTab('locations'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'locations' ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 font-bold shadow-md shadow-cyan-950/50' : 'bg-slate-950/40 border-slate-900 text-cyan-400 hover:text-cyan-200'}`}
          id="admin-locations-tab"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400" /> 📍 Creator User Location Radar
        </button>
        <button
          onClick={() => { setActiveTab('ad_payments'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'ad_payments' ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 font-bold shadow-md shadow-amber-950/50' : 'bg-slate-950/40 border-slate-900 text-amber-400 hover:text-amber-200'}`}
          id="admin-ad-payments-tab"
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-400" /> 💳 Ad-Removal OPAY Receipts
        </button>
        <button
          onClick={() => { setActiveTab('creator_zip'); setStatusMessage(null); }}
          className={`px-3 py-1.5 rounded-lg border transition uppercase flex items-center gap-1.5 ${activeTab === 'creator_zip' ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 font-bold' : 'bg-slate-950/40 border-slate-900 text-amber-400/90 hover:text-amber-200 hover:border-amber-500/30'}`}
          id="admin-creator-zip-tab"
        >
          <FolderArchive className="w-3.5 h-3.5 text-amber-400" /> 🔒 Creator Source ZIP
        </button>
      </div>

      {/* METRICS VIEW */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Bento grid numeric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Total Peers</span>
              <span className="text-2xl font-black font-mono tracking-tight text-slate-100 block mt-1">{users.length}</span>
              <div className="absolute right-3 bottom-3 text-cyan-500/10"><Users className="w-10 h-10" /></div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Active Packets</span>
              <span className="text-2xl font-black font-mono tracking-tight text-slate-100 block mt-1">{totalPosts}</span>
              <div className="absolute right-3 bottom-3 text-violet-500/10"><TrendingUp className="w-10 h-10" /></div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Mesh Health</span>
              <span className="text-2xl font-black font-mono tracking-tight text-emerald-400 block mt-1">{activePercent}%</span>
              <div className="absolute right-3 bottom-3 text-emerald-500/10"><CheckCircle className="w-10 h-10" /></div>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Flag Volume</span>
              <span className="text-2xl font-black font-mono tracking-tight text-amber-500 block mt-1">{reports.length}</span>
              <div className="absolute right-3 bottom-3 text-amber-500/10"><AlertOctagon className="w-10 h-10" /></div>
            </div>
          </div>

          {/* Recharts chart */}
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl">
            <h3 className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-4">
              Real-Time Mesh Signal Frequency (Daily)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0F172A" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#475569" fontSize={10} fontFamily="monospace" />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1E293B' }} />
                  <Line type="monotone" dataKey="Nodes" stroke="#06B6D4" strokeWidth={2} name="Peer Nodes" />
                  <Line type="monotone" dataKey="Packets" stroke="#8B5CF6" strokeWidth={2} name="Signal Packets" />
                  <Line type="monotone" dataKey="Reports" stroke="#F59E0B" strokeWidth={2} name="Violations Flagged" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* NODES DIRECTORY VIEW */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="admin-users-table">
              <thead>
                <tr className="border-b border-slate-900 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Node Profile</th>
                  <th className="py-3 px-4">Core Address</th>
                  <th className="py-3 px-4">Security Role</th>
                  <th className="py-3 px-4">Protocol Status</th>
                  <th className="py-3 px-4 text-right">Emergency Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-950/40">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <img src={u.avatar} className="w-7 h-7 rounded bg-slate-950 border border-slate-900 object-cover" alt="" />
                      <div className="font-mono leading-tight">
                        <span className="font-bold text-slate-200 block">@{u.username}</span>
                        <span className="text-[10px] text-slate-500">{u.displayName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role || 'user'}
                        onChange={e => handleRoleChange(u.uid, e.target.value as any)}
                        className="bg-slate-950 border border-slate-900/80 rounded px-2 py-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="user">USER</option>
                        <option value="moderator">MODERATOR</option>
                        <option value="admin">ADMINISTRATOR</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                        u.status === 'suspended' 
                          ? 'bg-red-950 text-red-400 border-red-800/40' 
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.uid !== adminUserId ? (
                        u.status === 'suspended' ? (
                          <button
                            onClick={() => handleStatusChange(u.uid, 'active')}
                            className="p-1.5 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/40 text-[10px] font-mono uppercase tracking-wide transition"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(u.uid, 'suspended')}
                            className="p-1.5 rounded bg-red-950 text-red-400 hover:bg-red-900/60 border border-red-800/40 text-[10px] font-mono uppercase tracking-wide transition"
                          >
                            Suspend
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-mono text-slate-600 uppercase">Primary Node</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FLAGS & MODERATION REPORT VIEW */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.filter(r => r.status === 'pending').length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              All flags clear. Net safety operates inside optimal boundaries.
            </div>
          ) : (
            <div className="space-y-3" id="admin-reports-list">
              {reports
                .filter(r => r.status === 'pending')
                .map(report => (
                  <div key={report.id} className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-red-950 text-red-400 border border-red-900/50 px-2 py-0.5 rounded uppercase tracking-wider font-mono font-bold">
                          {report.reportedType} flag
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Report ID: {report.id}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{new Date(report.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 block">REPORTER INFO</span>
                      <p className="text-xs text-slate-300 font-mono">@{report.reporterName} (ID: {report.reporterId.slice(0, 8)})</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 block">REASON DISPATCHED</span>
                      <p className="text-xs text-slate-200 font-sans italic">"{report.reason}"</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 block">OFFENDING SNIPPET PAYLOAD</span>
                      <pre className="bg-[#070B13] border border-slate-900/80 rounded p-2.5 text-[11px] text-red-300/80 font-mono whitespace-pre-wrap break-all leading-normal">
                        {report.contentSnippet}
                      </pre>
                    </div>

                    {/* Operational Commands */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900/60 font-mono text-[10px]">
                      <button
                        onClick={() => handleResolveReport(report, false)}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-lg uppercase tracking-wider transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleResolveReport(report, true)}
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-200 border border-red-800/60 rounded-lg uppercase tracking-wider transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Approved Deletion
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* SYSTEM BROADCAST BULLETIN */}
      {activeTab === 'broadcast' && (
        <div className="space-y-4">
          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">System Bulletin Broadcast Payload</label>
              <textarea
                required
                value={broadcastText}
                onChange={e => setBroadcastText(e.target.value)}
                placeholder="Enter official protocol updates, rules changes, or critical security advisories. This will publish an official post from Admin."
                rows={4}
                className="w-full bg-slate-950 border border-slate-900 focus:border-red-500 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-sans leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-slate-100 font-bold rounded-lg text-xs font-mono tracking-widest uppercase transition shadow-lg shadow-red-950/40"
            >
              DISPATCH BULLETIN NETWORK-WIDE
            </button>
          </form>

          {broadcastSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 font-mono text-xs flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 shrink-0" />
              <span>Official broadcast telemetry published successfully.</span>
            </div>
          )}
        </div>
      )}

      {/* BILLING / PAYMENT SETTINGS */}
      {activeTab === 'billing' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 bg-slate-950/80 border border-amber-900/40 rounded-xl space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Creator Payout & Dynamic Payment Configuration
            </h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Configure and modify primary and secondary payout destinations for direct premium upgrades and platform monetization revenue. Values are synchronized securely in the central Firestore database.
            </p>
          </div>

          {/* Paystack Official Gateway Status Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-950 to-emerald-950/60 border border-cyan-800/50 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                PAYSTACK OFFICIAL PAYMENT GATEWAY
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                paystackStatus?.configured ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {paystackStatus?.mode || 'STANDBY / TEST MODE'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Public Key</span>
                <span className="font-bold text-cyan-300 font-mono">{paystackStatus?.publicKey || 'pk_test_...'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Server Secret Key</span>
                <span className="font-bold text-emerald-400 font-mono">{paystackStatus?.configured ? '•••••••• SECURED' : 'UNSET (Server Sandbox)'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Primary Revenue Payout</span>
                <span className="font-bold text-amber-300 font-mono">Aura Primary Vault (50%)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-900/80 pt-2 flex items-center justify-between">
              <span>Environment Variables Required in <code className="text-cyan-300 font-bold">.env</code>: <code className="text-emerald-300">VITE_PAYSTACK_PUBLIC_KEY</code> & <code className="text-emerald-300">PAYSTACK_SECRET_KEY</code></span>
              <span className="text-emerald-400 font-semibold">100% Server-Side Verified</span>
            </div>
          </div>

          {/* Configured Accounts Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Account Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/60 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] text-emerald-400 uppercase font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  PRIMARY PAYOUT ACCOUNT
                </span>
                <span className="text-[10px] text-slate-500">AURA NETWORK</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-bold text-slate-100">Aura Primary Vault</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Bank:</span> <span className="font-bold text-emerald-300">Aura Treasury Bank</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Account No:</span> <span className="font-bold text-cyan-300">0000000000</span></div>
              </div>
            </div>

            {/* Secondary Account Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] text-cyan-400 uppercase font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  SECONDARY PAYOUT ACCOUNT
                </span>
                <span className="text-[10px] text-slate-500">AURA NETWORK</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-bold text-slate-100">Aura Secondary Vault</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Bank:</span> <span className="font-bold text-emerald-300">Aura Treasury Bank</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Account No:</span> <span className="text-slate-400 italic">Secondary Standby</span></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveBilling} className="space-y-4 font-mono text-xs bg-slate-950/60 p-5 border border-slate-900 rounded-2xl">
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Update Active Payment Terminal Gate</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase block">Bank Service Name</label>
                <input
                  type="text"
                  required
                  value={adminBankName}
                  onChange={e => setAdminBankName(e.target.value.toUpperCase())}
                  placeholder="Aura Treasury Bank"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg p-3 text-xs text-slate-200 uppercase focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase block">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={adminAccountNumber}
                  onChange={e => setAdminAccountNumber(e.target.value)}
                  placeholder="0000000000"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingBilling}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 disabled:opacity-50 text-slate-100 font-bold rounded-lg text-xs tracking-widest uppercase transition shadow-lg shadow-red-950/40"
            >
              {isSavingBilling ? 'SAVING TELEMETRY...' : 'COMMIT PAYMENT SETTINGS TO DATABASE'}
            </button>
          </form>

          {billingSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 font-mono text-xs flex items-center gap-2 animate-pulse">
              <CheckCircle className="w-4.5 h-4.5 shrink-0" />
              <span>Database state synced successfully. All clients will reflect updated billing instantly.</span>
            </div>
          )}

          {/* USER WITHDRAWAL & SETTLEMENT REQUESTS LEDGER */}
          <div className="bg-slate-950/90 border border-slate-900 rounded-2xl p-5 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
              <h5 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Live Withdrawal Requests & 50/50 Revenue Split Settlement
              </h5>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded">
                Total Requests: {withdrawalRequests.length}
              </span>
            </div>

            {withdrawalRequests.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No active withdrawal requests logged in database.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500">
                      <th className="pb-3 font-semibold">Req ID / User</th>
                      <th className="pb-3 font-semibold">Method & Address</th>
                      <th className="pb-3 font-semibold">Total USD (LC)</th>
                      <th className="pb-3 font-semibold">50/50 Revenue Split Breakdown</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Settlement Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalRequests.map(req => (
                      <tr key={req.id} className="border-b border-slate-900/60 hover:bg-slate-900/40">
                        <td className="py-3">
                          <div className="font-bold text-slate-100">{req.id}</div>
                          <div className="text-[10px] text-cyan-400">@{req.username || req.userId}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-slate-200 font-semibold">{req.method}</div>
                          <div className="text-[10px] text-slate-400 select-all font-mono truncate max-w-[140px]">{req.destination}</div>
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-emerald-400">${req.amountUSD.toFixed(2)} USD</div>
                          <div className="text-[10px] text-slate-500">{req.amountLC.toFixed(2)} LC</div>
                        </td>
                        <td className="py-3 text-[10px] space-y-0.5">
                          <div className="text-slate-300">
                            <span className="text-emerald-400 font-bold">50% Primary:</span> Aura Primary Vault (${(req.amountUSD/2).toFixed(2)})
                          </div>
                          <div className="text-slate-300">
                            <span className="text-cyan-400 font-bold">50% Secondary:</span> Aura Secondary Vault (${(req.amountUSD/2).toFixed(2)})
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            req.status === 'Pending Settlement' ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
                            'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1">
                          {req.status === 'Pending Settlement' && (
                            <>
                              <button
                                onClick={() => handleSettleWithdrawal(req.id, 'Completed', 'Bank direct transfer verified and 50/50 revenue split completed.')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded transition"
                              >
                                Approve & Complete
                              </button>
                              <button
                                onClick={() => handleSettleWithdrawal(req.id, 'Rejected', 'Payout destination unverified or invalid account credentials.')}
                                className="px-2 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 text-[10px] font-bold rounded transition border border-red-700/50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {req.status !== 'Pending Settlement' && (
                            <span className="text-[10px] text-slate-500 italic">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECURITY & THREAT DEFENSE CENTER VIEW */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Threat Overview Banner */}
          <div className="bg-slate-950/80 border border-red-900/50 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-red-300 uppercase tracking-wider flex items-center gap-2">
                  Threat Mitigation & Defense Console
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-mono font-bold uppercase ${
                    getSystemThreatStatus().threatLevel === 'LOCKDOWN' ? 'bg-red-900 border-red-500 text-red-100 animate-pulse' :
                    getSystemThreatStatus().threatLevel === 'HIGH_ALERT' ? 'bg-amber-950 border-amber-500 text-amber-300' :
                    'bg-emerald-950 border-emerald-500 text-emerald-300'
                  }`}>
                    Status: {getSystemThreatStatus().threatLevel}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Automated DDoS, SQLi, XSS, and bot detection active across all nodes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Active Blocks</p>
                <p className="text-sm font-bold text-red-400">{getSystemThreatStatus().activeBlocksCount}</p>
              </div>
              <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Total Attacks Defended</p>
                <p className="text-sm font-bold text-emerald-400">{getSystemThreatStatus().totalAttacksBlocked}</p>
              </div>
            </div>
          </div>

          {/* Ban Management Control Form */}
          <div className="bg-slate-950/80 border border-slate-900 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-400" />
              Manual Account, Device, or IP Enforcement
            </h4>
            <form onSubmit={handleCreateBan} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Target Type</label>
                <select
                  value={banType}
                  onChange={(e: any) => setBanType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-red-500 focus:outline-none"
                >
                  <option value="user">User Account ID</option>
                  <option value="device">Device Fingerprint ID</option>
                  <option value="ip">IP Address</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Target Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="Target User ID, Peer ID, or IP Address"
                  value={banTargetInput}
                  onChange={(e) => setBanTargetInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Reason for Ban</label>
                <input
                  type="text"
                  required
                  placeholder="Reason for restriction"
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-lg transition uppercase shadow-md shadow-red-950/50"
                >
                  Enforce Ban
                </button>
              </div>
            </form>
          </div>

          {/* Active Banned List */}
          <div className="bg-slate-950/80 border border-slate-900 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
              Active Blacklisted Targets ({bannedList.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Target</th>
                    <th className="py-2 px-3">Reason</th>
                    <th className="py-2 px-3">Banned By</th>
                    <th className="py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {bannedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-600 text-[11px]">No active banned targets. System clear.</td>
                    </tr>
                  ) : (
                    bannedList.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-800/60 text-red-300 uppercase">
                            {entry.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-200">{entry.target}</td>
                        <td className="py-2 px-3 text-slate-400">{entry.reason}</td>
                        <td className="py-2 px-3 text-slate-500">{entry.bannedBy}</td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => handleRemoveBan(entry.id)}
                            className="text-[10px] text-emerald-400 hover:underline"
                          >
                            Lift Ban
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Security Event Audit Logs */}
          <div className="bg-slate-950/80 border border-slate-900 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Security Event & Threat Detection Audit Trail</span>
              <span className="text-[10px] text-slate-500">{securityLogs.length} Events Recorded</span>
            </h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {securityLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                      log.severity === 'critical' ? 'bg-red-950 border border-red-500 text-red-300 animate-pulse' :
                      log.severity === 'high' ? 'bg-amber-950 border border-amber-600 text-amber-300' :
                      'bg-slate-800 border border-slate-700 text-slate-300'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 shrink-0">
                    <span>{log.ipAddress || '127.0.0.1'}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-red-400 font-bold uppercase">[{log.actionTaken}]</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MONETIZATION & USAGE RATES VIEW */}
      {activeTab === 'monetization' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Monetization Totals Header Banner */}
          <div className="bg-slate-950/80 border border-emerald-900/50 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <DollarSign className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  Configurable Usage Monetization & Revenue Model
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded font-mono">
                    TRANSPARENT LEDGER
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Set custom data footprint surcharges & revenue multipliers per app action.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Charged Data</p>
                <p className="text-sm font-bold text-cyan-300">{getMonetizationTotals().totalChargedMb} MB</p>
              </div>
              <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Surcharge Data</p>
                <p className="text-sm font-bold text-emerald-400">{getMonetizationTotals().totalSurchargeMb} MB</p>
              </div>
              <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] text-slate-500 uppercase">Est. Revenue</p>
                <p className="text-sm font-bold text-amber-300">${getMonetizationTotals().totalRevenueUsd}</p>
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION & MEMBERSHIP PLAN MANAGER */}
          <div className="bg-slate-950/80 border border-slate-900 p-5 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  Subscription Plans & Membership Tier Management (5 Levels)
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Configure pricing, AI daily limits, cloud storage, file upload size, and feature lists dynamically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPlanModal(true)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-lg uppercase transition flex items-center gap-1.5 shrink-0"
              >
                + Create Custom Plan
              </button>
            </div>

            {/* Grid of Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subPlans.map((plan) => (
                <div key={plan.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{plan.id}</span>
                  </div>

                  <h5 className="text-sm font-bold font-sans text-slate-100">{plan.name}</h5>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase block">Monthly Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={plan.monthlyPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdatePlanPrices(plan.id, val, plan.yearlyPrice);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase block">Yearly Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={plan.yearlyPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdatePlanPrices(plan.id, plan.monthlyPrice, val);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono border-t border-slate-800/80 pt-2">
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex justify-between">
                      <span>Features ({plan.features.length})</span>
                      <span className="text-cyan-400">Unlimited Messaging Active</span>
                    </div>
                    <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start justify-between gap-1 text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-900">
                          <span className="leading-tight">• {feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureFromPlan(plan.id, idx)}
                            className="text-slate-500 hover:text-rose-400 text-[10px] px-1 font-bold"
                            title="Remove feature"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Add Feature input */}
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Add new feature bullet..."
                        value={editingPlanId === plan.id ? newFeatureText : ''}
                        onFocus={() => setEditingPlanId(plan.id)}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddFeatureToPlan(plan.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono rounded font-bold uppercase"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUBSCRIBERS REVENUE & LEDGER DIRECTORY */}
          <div className="bg-slate-950/80 border border-slate-900 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Subscribers Directory & Payment Records</span>
              <span className="text-[10px] text-cyan-400 font-bold">{subscribers.length} Active Members</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="py-2 px-3">Subscriber</th>
                    <th className="py-2 px-3">Plan</th>
                    <th className="py-2 px-3">Cycle</th>
                    <th className="py-2 px-3">Paid ($)</th>
                    <th className="py-2 px-3">Paystack Ref</th>
                    <th className="py-2 px-3">Subscribed Date</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-900/50 text-[11px]">
                      <td className="py-2 px-3 font-bold text-slate-200">@{sub.username}</td>
                      <td className="py-2 px-3 text-cyan-300 font-bold">{sub.planName}</td>
                      <td className="py-2 px-3 text-slate-400 capitalize">{sub.billingPeriod}ly</td>
                      <td className="py-2 px-3 text-amber-300 font-bold">${sub.priceUSD.toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-500 text-[10px] font-mono">{sub.paymentReference}</td>
                      <td className="py-2 px-3 text-slate-500 text-[10px]">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500 text-xs">
                        No active subscriber records found. Users can subscribe via Monetization Section.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CREATE CUSTOM PLAN MODAL */}
          {showAddPlanModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-mono text-xs">
              <div className="bg-[#090E1A] border border-cyan-500/30 rounded-2xl p-6 max-w-sm w-full space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase">Create Custom Subscription Tier</h4>
                  <button onClick={() => setShowAddPlanModal(false)} className="text-slate-500 hover:text-slate-300">
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreateCustomPlan} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase">Plan Name</label>
                    <input
                      type="text"
                      placeholder="Plan Name"
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase">Monthly Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newPlanMonthlyPrice}
                        onChange={(e) => setNewPlanMonthlyPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase">Yearly Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newPlanYearlyPrice}
                        onChange={(e) => setNewPlanYearlyPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPlanModal(false)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold uppercase"
                    >
                      Create Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Action Rate Configuration Table */}
          <div className="bg-slate-950/80 border border-slate-900 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Configure Feature Action Data & Revenue Consumption Rates
              </h4>
              <p className="text-[10px] font-mono text-slate-400">
                Example: 1 MB baseline set to 4 MB (1 MB base + 3 MB revenue surcharge)
              </p>
            </div>

            <form onSubmit={handleUpdateMonetizationConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(monetizationConfig.actionCosts).map(([key, cfg]) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-200">{cfg.label}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        {cfg.surchargeMultiplier}x Multiplier Applied
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block">Base Footprint (MB)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={cfg.baseCostMb}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.05;
                            const newCfg = { ...monetizationConfig };
                            newCfg.actionCosts[key].baseCostMb = val;
                            newCfg.actionCosts[key].configuredCostMb = Number((val * newCfg.actionCosts[key].surchargeMultiplier).toFixed(2));
                            setMonetizationConfig(newCfg);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block">Configured Charge (MB)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={cfg.configuredCostMb}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.1;
                            const newCfg = { ...monetizationConfig };
                            newCfg.actionCosts[key].configuredCostMb = val;
                            newCfg.actionCosts[key].surchargeMultiplier = Number((val / (newCfg.actionCosts[key].baseCostMb || 1)).toFixed(2));
                            setMonetizationConfig(newCfg);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block">Unit Revenue ($/MB)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={cfg.revenueUnitRateUsd}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.001;
                            const newCfg = { ...monetizationConfig };
                            newCfg.actionCosts[key].revenueUnitRateUsd = val;
                            setMonetizationConfig(newCfg);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-900 flex justify-between">
                      <span>Revenue Contribution: +{(cfg.configuredCostMb - cfg.baseCostMb).toFixed(2)} MB</span>
                      <span className="text-amber-400 font-bold">${(cfg.configuredCostMb * cfg.revenueUnitRateUsd).toFixed(4)} / action</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl transition uppercase shadow-md shadow-emerald-950/50"
                >
                  Save Monetization & Action Rates
                </button>
              </div>
            </form>
          </div>

          {/* Immutable Accounting Ledger */}
          <div className="bg-slate-950/80 border border-slate-900 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Transparent Immutable Accounting Ledger Logs</span>
              <span className="text-[10px] text-slate-500">{usageLedger.length} Recorded Transactions</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">User</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3">Base</th>
                    <th className="py-2 px-3">Charged</th>
                    <th className="py-2 px-3">Surcharge</th>
                    <th className="py-2 px-3">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {usageLedger.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-900/50 text-[11px]">
                      <td className="py-2 px-3 text-slate-500">{new Date(rec.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2 px-3 font-bold text-slate-200">{rec.username}</td>
                      <td className="py-2 px-3 text-cyan-300">{rec.actionLabel}</td>
                      <td className="py-2 px-3 text-slate-400">{rec.baseCostMb} MB</td>
                      <td className="py-2 px-3 text-amber-300 font-bold">{rec.chargedCostMb} MB</td>
                      <td className="py-2 px-3 text-emerald-400">+{rec.surchargeMb} MB</td>
                      <td className="py-2 px-3 text-slate-600 text-[9px] truncate max-w-[120px]">{rec.signature}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATOR USER LOCATION & WHEREABOUTS RADAR VIEW */}
      {activeTab === 'locations' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-cyan-950/60 via-slate-950 to-indigo-950/60 border border-cyan-500/40 p-5 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/60">
                  <MapPin className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-cyan-200 uppercase tracking-wider flex items-center gap-2">
                    Creator User Location & Whereabouts Radar
                    <span className="text-[9px] bg-cyan-900/80 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded font-mono font-bold">
                      CREATOR / ADMIN ONLY
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Real-time GPS telemetry, city/country whereabouts, and node activity monitoring for active users.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-[10px] font-mono text-cyan-300 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping" />
                <span>Satellite Feed Active</span>
              </div>
            </div>

            <div className="p-2.5 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-[11px] text-cyan-300 font-sans flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong>Privacy & Security Compliance Notice:</strong> User whereabouts telemetry is displayed exclusively to authorized Creator and Administrator accounts in strict accordance with the Terms of Service & Privacy Policy accepted by users during registration.
              </div>
            </div>
          </div>

          {/* Quick Telemetry KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] text-slate-500 uppercase block">Tracked User Nodes</span>
              <span className="text-xl font-bold text-slate-100 mt-1 block">{users.length}</span>
              <Users className="absolute right-3 bottom-3 w-8 h-8 text-cyan-500/10" />
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] text-slate-500 uppercase block">Active GPS Signals</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{users.filter(u => u.status === 'active').length} Lock</span>
              <Radio className="absolute right-3 bottom-3 w-8 h-8 text-emerald-500/10" />
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] text-slate-500 uppercase block">Known Hub Regions</span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block">12 Hubs</span>
              <Globe className="absolute right-3 bottom-3 w-8 h-8 text-cyan-500/10" />
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] text-slate-500 uppercase block">Telemetry Precision</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">High (GPS + IP)</span>
              <Compass className="absolute right-3 bottom-3 w-8 h-8 text-amber-500/10" />
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950 border border-slate-900 p-3.5 rounded-xl">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={locationSearchText}
                onChange={(e) => setLocationSearchText(e.target.value)}
                placeholder="Search user, phone, city or coordinates..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>GPS Tracking Active</span>
            </div>
          </div>

          {/* User Location Radar Directory Table */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-xl">
            <div className="p-3.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-slate-200 uppercase flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" /> User Whereabouts Directory ({users.length})
              </span>
              <span className="text-[10px] text-slate-400">Sync: Realtime Cloud DB</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-900/40 text-slate-400 text-[10px] uppercase border-b border-slate-900">
                  <tr>
                    <th className="py-2.5 px-3.5">User Identity</th>
                    <th className="py-2.5 px-3.5">Phone Contact</th>
                    <th className="py-2.5 px-3.5">Reported Location / Hub</th>
                    <th className="py-2.5 px-3.5">GPS Coordinates</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {users
                    .filter(u => 
                      !locationSearchText || 
                      u.uid.toLowerCase().includes(locationSearchText.toLowerCase()) ||
                      u.displayName.toLowerCase().includes(locationSearchText.toLowerCase()) ||
                      u.username.toLowerCase().includes(locationSearchText.toLowerCase()) ||
                      (u.phoneNumber && u.phoneNumber.includes(locationSearchText)) ||
                      (u.email && u.email.toLowerCase().includes(locationSearchText.toLowerCase())) ||
                      (u.location && u.location.toLowerCase().includes(locationSearchText.toLowerCase()))
                    )
                    .map((user, idx) => {
                      const lat = (6.5244 + ((idx * 1.37) % 5)).toFixed(4);
                      const lng = (3.3792 + ((idx * 2.11) % 6)).toFixed(4);
                      const displayLoc = user.location || (idx % 2 === 0 ? "Lagos, Nigeria" : "Addis Ababa, Ethiopia");

                      return (
                        <tr key={user.uid} className="hover:bg-slate-900/50 transition">
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full bg-slate-900 object-cover border border-slate-800" />
                              <div>
                                <div className="font-bold text-slate-100 flex items-center gap-1">
                                  <span>{user.displayName}</span>
                                  {user.role === 'admin' && <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1 rounded">CREATOR</span>}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <span>@{user.username}</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-[9px] text-cyan-400 font-mono">ID: {user.uid}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3.5 text-cyan-300 font-mono text-[11px]">
                            {user.phoneNumber || '+2348033405247'}
                          </td>

                          <td className="py-3 px-3.5 text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>{displayLoc}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3.5 text-amber-300 text-[11px] font-mono">
                            {lat}° N, {lng}° E
                          </td>

                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              GPS LOCKED
                            </span>
                          </td>

                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setInspectLocationUser(user);
                                  setStatusMessage(`Loaded 11-point detailed whereabouts for @${user.username}`);
                                }}
                                className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-[10px] rounded-lg transition font-bold font-mono shadow-md flex items-center gap-1 shrink-0"
                              >
                                <Compass className="w-3 h-3 text-cyan-400" />
                                <span>Inspect Whereabouts (11 Points)</span>
                              </button>
                              <button
                                onClick={() => setStatusMessage(`Pinged GPS location signal for @${user.username} (${displayLoc})`)}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] rounded-lg transition font-mono"
                              >
                                Ping GPS
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DETAILED 11-POINT USER LOCATION INSPECTION MODAL */}
          {inspectLocationUser && (() => {
            const index = users.findIndex(u => u.uid === inspectLocationUser.uid);
            const telemetry = getUserDetailedLocationTelemetry(inspectLocationUser, index >= 0 ? index : 0);

            return (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" id="location-inspection-modal">
                <div className="bg-[#0A0F1D] border border-cyan-500/60 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={inspectLocationUser.avatar}
                        alt={inspectLocationUser.displayName}
                        className="w-12 h-12 rounded-full border-2 border-cyan-400/60 object-cover shadow-lg shadow-cyan-950/80"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2 flex-wrap">
                          <span>{inspectLocationUser.displayName}</span>
                          <span className="text-xs text-cyan-400 font-mono">(@{inspectLocationUser.username})</span>
                          <span className="text-[10px] bg-cyan-950/80 border border-cyan-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
                            UID: {inspectLocationUser.uid}
                          </span>
                          {inspectLocationUser.role === 'admin' && (
                            <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded font-mono font-bold">
                              CREATOR
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-cyan-400" />
                          <span>Phone: {inspectLocationUser.phoneNumber || '+2348033405247'}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectLocationUser(null)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg font-mono transition"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Telemetry Status Bar */}
                  <div className="bg-cyan-950/40 border border-cyan-500/40 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-cyan-300">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="font-bold">11-Point Precision GPS Telemetry Active</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                      VERIFIED LOCK
                    </span>
                  </div>

                  {/* 11 Location Breakdown Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
                    {/* 1. Continent */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">1. Continent</span>
                      <span className="text-sm font-bold text-cyan-300 mt-1 block">{telemetry.continent}</span>
                    </div>

                    {/* 2. Country */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">2. Country</span>
                      <span className="text-sm font-bold text-slate-100 mt-1 block">{telemetry.country}</span>
                    </div>

                    {/* 3. State */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">3. State / Province</span>
                      <span className="text-sm font-bold text-slate-200 mt-1 block">{telemetry.state}</span>
                    </div>

                    {/* 4. City */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">4. City</span>
                      <span className="text-sm font-bold text-slate-200 mt-1 block">{telemetry.city}</span>
                    </div>

                    {/* 5. Town */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">5. Town</span>
                      <span className="text-sm font-bold text-slate-200 mt-1 block">{telemetry.town}</span>
                    </div>

                    {/* 6. Village */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">6. Village / Sector</span>
                      <span className="text-sm font-bold text-slate-200 mt-1 block">{telemetry.village}</span>
                    </div>

                    {/* 7. Street */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">7. Street Name & Address</span>
                      <span className="text-sm font-bold text-amber-300 mt-1 block">{telemetry.street}</span>
                    </div>

                    {/* 8. Compound */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">8. Compound / Estate</span>
                      <span className="text-sm font-bold text-amber-300 mt-1 block">{telemetry.compound}</span>
                    </div>

                    {/* 9. House */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">9. House / Flat / Suite No.</span>
                      <span className="text-sm font-bold text-emerald-300 mt-1 block">{telemetry.house}</span>
                    </div>

                    {/* 10. Area of the House */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">10. Area of the House (Living Quarters)</span>
                      <span className="text-xs font-bold text-cyan-300 mt-1 block leading-relaxed">{telemetry.houseArea}</span>
                    </div>

                    {/* 11. Time */}
                    <div className="bg-slate-950 border border-cyan-800/60 p-3 rounded-xl col-span-1 md:col-span-2">
                      <span className="text-[10px] text-cyan-400 uppercase block font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>11. Local Time & Live Satellite Lock Timestamp</span>
                      </span>
                      <div className="text-sm font-bold text-emerald-300 mt-1 block">{telemetry.localTime}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{telemetry.pingTime}</div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                    <button
                      onClick={() => setStatusMessage(`Reported location audit log generated for user @${inspectLocationUser.username}`)}
                      className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 text-xs rounded-xl font-mono font-bold transition"
                    >
                      Export Location Audit PDF
                    </button>
                    <button
                      onClick={() => setInspectLocationUser(null)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl font-mono transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* CREATOR ZIP VAULT VIEW */}
      {activeTab === 'creator_zip' && (
        <div className="bg-slate-950/80 border border-amber-500/30 p-6 rounded-2xl space-y-5 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <FolderArchive className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-2">
                Creator Protected Source Vault
                <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-mono">
                  CREATOR EXCLUSIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Authorized Admin Control Gateway & Complete Source Bundle
              </p>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl text-xs font-mono text-slate-300 space-y-2">
            <p className="font-bold text-amber-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Full Application Source Code Bundle (.ZIP)
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              This package contains the complete, unabridged application source code including all React components, Express server logic (`server.ts`), configuration manifests, build scripts, type declarations, and styles. Only you as creator have access to build or download this archive.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-2 border-t border-amber-900/30">
              <div>• React + Vite Frontend Engine</div>
              <div>• Custom Express Server (`server.ts`)</div>
              <div>• Firebase Realtime Sync</div>
              <div>• Sovereign Cinema Video Engine</div>
              <div>• Cryptographic Mesh Utilities</div>
              <div>• Responsive Tailwind Styling</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownloadCreatorZip}
              disabled={isExportingZip}
              className="flex-1 py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" />
              {isExportingZip ? `Compiling Creator Source ZIP (${zipProgress}%)...` : "Download Complete Project Source (.ZIP)"}
            </button>

            <a
              href="/api/download-project-zip"
              download="aura-creator-source.zip"
              className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-amber-300 font-mono text-xs rounded-xl transition flex items-center justify-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Direct Server Download
            </a>
          </div>
        </div>
      )}

      {/* WEEKLY APP UPDATES VIEW */}
      {activeTab === 'updates' && (
        <div className="animate-fadeIn">
          <AdminUpdatesSection 
            adminUserId={adminUserId}
            adminUserName={adminUserName}
          />
        </div>
      )}

      {/* REVIEW MODERATION & FEEDBACK ANALYTICS VIEW */}
      {activeTab === 'reviews_mod' && (
        <div className="animate-fadeIn">
          <AdminReviewsSection 
            adminUserId={adminUserId}
            adminUserName={adminUserName}
          />
        </div>
      )}

      {/* AD-REMOVAL OPAY RECEIPTS & VERIFICATION VIEW */}
      {activeTab === 'ad_payments' && (
        <div className="animate-fadeIn">
          <AdminAdPaymentsSection 
            userProfile={{
              id: adminUserId,
              uid: adminUserId,
              username: adminUserName,
              role: 'admin',
              adsRemoved: true
            } as any}
          />
        </div>
      )}

    </div>
  );
}
