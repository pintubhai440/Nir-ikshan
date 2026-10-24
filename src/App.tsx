/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserRoleType, 
  WaterBody, 
  CitizenComplaint, 
  OfficerContact, 
  InspectorReport,
  EngineerWorkExecution
} from './types/nirikshan';
import { 
  INITIAL_WATER_BODIES, 
  INITIAL_OFFICER_CONTACTS, 
  INITIAL_CITIZEN_COMPLAINTS,
  SAMPLE_CITIZEN_COMPLAINTS
} from './data/nirikshanData';
import { NirikshanHeader } from './components/NirikshanHeader';
import { NirikshanSlideDrawer } from './components/NirikshanSlideDrawer';
import { OtpLoginModal } from './components/OtpLoginModal';
import { MainPortalDashboard } from './components/MainPortalDashboard';
import { CitizenDashboard } from './components/CitizenDashboard';
import { NodalOfficerDashboard } from './components/NodalOfficerDashboard';
import { InspectorDashboard } from './components/InspectorDashboard';
import { EngineerDashboard } from './components/EngineerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LodgeComplaintModal } from './components/LodgeComplaintModal';
import { OfficerDirectoryModal } from './components/OfficerDirectoryModal';
import { AuthModal } from './components/AuthModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { SubmissionDossierModal } from './components/SubmissionDossierModal';
import { 
  isSupabaseConfigured, 
  fetchComplaintsFromSupabase, 
  saveComplaintToSupabase, 
  subscribeToComplaints 
} from './lib/supabase';
import { useLanguage } from './context/LanguageContext';
import { Droplets, Phone, AlertTriangle, ShieldCheck, Globe, Menu, Layers, Database, ArrowLeft } from 'lucide-react';

export default function App() {
  const { t, language } = useLanguage();
  // Default to overview landing page (national map and executive command, not user data)
  const [currentRole, setCurrentRole] = useState<UserRoleType>('overview');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSubmissionDossierOpen, setIsSubmissionDossierOpen] = useState(false);

  // Load persisted state or initial seed data
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>(() => {
    try {
      const saved = localStorage.getItem('nir_water_bodies');
      return saved ? JSON.parse(saved) : INITIAL_WATER_BODIES;
    } catch {
      return INITIAL_WATER_BODIES;
    }
  });

  // Complaints state: Clean complaints from database, strictly deduplicated by ID (Zero fake data)
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(() => {
    try {
      const saved = localStorage.getItem('nir_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const legacyMockIds = new Set([
            'CMP-AP-2026-112', 'CMP-AP-2026-215', 'CMP-AP-2026-340', 'CMP-AP-2026-478',
            'CMP-AP-2026-512', 'CMP-AP-2026-589', 'CMP-AP-2026-621', 'CMP-AP-2026-680',
            'CMP-AP-2026-733', 'CMP-AP-2026-805', 'CMP-AP-2026-867', 'CMP-AP-2026-921',
            'CMP-AP-2026-954', 'CMP-AP-2026-1021', 'CMP-AP-2026-1077', 'CMP-AP-2026-1132',
            'CMP-AP-2026-1188', 'CMP-AP-2026-1244', 'CMP-AP-2026-1301', 'CMP-AP-2026-1365',
            'CMP-AP-2026-1420', 'CMP-AP-2026-1488', 'CMP-AP-2026-1540', 'CMP-AP-2026-1600'
          ]);
          const cleaned = parsed.filter(c => c && c.id && !legacyMockIds.has(c.id));
          if (cleaned.length > 0) {
            return cleaned;
          }
        }
      }
      return SAMPLE_CITIZEN_COMPLAINTS;
    } catch {
      return SAMPLE_CITIZEN_COMPLAINTS;
    }
  });

  const [officers] = useState<OfficerContact[]>(INITIAL_OFFICER_CONTACTS);

  // User Authentication State (from Mobile OTP Login)
  const [currentUser, setCurrentUser] = useState<{ name: string; phone: string } | null>(() => {
    try {
      const u = localStorage.getItem('nir_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('nir_user'));
    } catch {
      return false;
    }
  });

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [selectedNodalDistrict, setSelectedNodalDistrict] = useState<string>('');

  // Auth states for the protected roles
  const [authenticatedRoles, setAuthenticatedRoles] = useState<Record<UserRoleType, boolean>>({
    overview: true,
    user: true,
    admin: true,
    nodal: true,
    nodal_vizianagaram: true,
    nodal_parvathipuram: true,
    nodal_visakhapatnam: true,
    inspector: true,
    engineer: true,
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAuthRole, setPendingAuthRole] = useState<UserRoleType>('admin');
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nir_water_bodies', JSON.stringify(waterBodies));
  }, [waterBodies]);

  useEffect(() => {
    localStorage.setItem('nir_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Realtime Supabase Database Synchronization across all connected devices
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const syncLiveComplaints = () => {
      if (isSupabaseConfigured()) {
        fetchComplaintsFromSupabase().then((remoteComplaints) => {
          if (remoteComplaints && remoteComplaints.length > 0) {
            // Strictly deduplicate remote complaints by ID
            const uniqueRemoteMap = new Map<string, CitizenComplaint>();
            for (const item of remoteComplaints) {
              if (item && item.id && !uniqueRemoteMap.has(item.id)) {
                uniqueRemoteMap.set(item.id, item);
              }
            }
            const deduplicated = Array.from(uniqueRemoteMap.values());
            setComplaints(deduplicated);
            try {
              localStorage.setItem('nir_complaints', JSON.stringify(deduplicated));
            } catch (e) {
              console.error('Failed to sync complaints to localStorage cache', e);
            }
          }
        });

        if (!unsubscribe) {
          unsubscribe = subscribeToComplaints(
            (inserted) => {
              setComplaints((prev) => {
                if (prev.some((c) => c.id === inserted.id)) return prev;
                const updated = [inserted, ...prev];
                localStorage.setItem('nir_complaints', JSON.stringify(updated));
                return updated;
              });
            },
            (updated) => {
              setComplaints((prev) => {
                const next = prev.map((c) => (c.id === updated.id ? updated : c));
                localStorage.setItem('nir_complaints', JSON.stringify(next));
                return next;
              });
            }
          );
        }
      }
    };

    syncLiveComplaints();

    const handleConfigChange = () => {
      syncLiveComplaints();
    };

    window.addEventListener('supabase-config-changed', handleConfigChange);

    return () => {
      window.removeEventListener('supabase-config-changed', handleConfigChange);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Role selection logic with auth gate
  const handleSelectRole = (role: UserRoleType) => {
    // If not logged in and choosing any protected dashboard, prompt OTP login modal
    // Note: overview, user, and nodal selection grid are directly accessible without login
    if (role !== 'overview' && role !== 'user' && role !== 'nodal' && !isLoggedIn) {
      setIsOtpModalOpen(true);
      return;
    }
    if (role === 'nodal') {
      setSelectedNodalDistrict('');
    }
    setCurrentRole(role);
  };

  const handleOtpLoginSuccess = (userData: { name: string; phone: string }) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('nir_user', JSON.stringify(userData));
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('nir_user');
    setCurrentRole('overview');
  };

  const handleLoginSuccess = (role: UserRoleType) => {
    setAuthenticatedRoles((prev) => ({ ...prev, [role]: true }));
    setCurrentRole(role);
  };

  const handleLogoutRole = (role: UserRoleType) => {
    setAuthenticatedRoles((prev) => ({ ...prev, [role]: false }));
    setCurrentRole('overview');
  };


  // --- Complaint & Workflow Handlers (Synced to Supabase Cloud) ---

  // 1. Citizen submits complaint (Permanently persisted without duplicates)
  const handleComplaintSubmitted = (newComplaint: CitizenComplaint) => {
    // 1. Check ID collision
    if (complaints.some((c) => c.id === newComplaint.id)) {
      console.warn('[Anti-Duplicate] Skipped complaint with existing ID:', newComplaint.id);
      return;
    }

    // 2. Check identical duplicate submission (same phone, landmark/desc within 2 mins)
    const isRapidDuplicate = complaints.some((c) => {
      const sameUser = c.citizenPhone === newComplaint.citizenPhone;
      const sameDesc = c.shortDescription?.trim().toLowerCase() === newComplaint.shortDescription?.trim().toLowerCase();
      const sameLandmark = c.locationLandmark?.trim().toLowerCase() === newComplaint.locationLandmark?.trim().toLowerCase();
      const timeDiff = Math.abs(new Date(c.submittedAt).getTime() - new Date(newComplaint.submittedAt).getTime());
      return sameUser && (sameDesc || sameLandmark) && (isNaN(timeDiff) || timeDiff < 120000);
    });

    if (isRapidDuplicate) {
      console.warn('[Anti-Duplicate] Blocked duplicate submission with identical content');
      return;
    }

    setComplaints((prev) => {
      if (prev.some((c) => c.id === newComplaint.id)) {
        return prev;
      }
      const updated = [newComplaint, ...prev];
      try {
        localStorage.setItem('nir_complaints', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to write complaint to localStorage', err);
      }
      return updated;
    });

    // Save permanently in Supabase PostgreSQL (only non-duplicate records)
    saveComplaintToSupabase(newComplaint);
  };

  // 2. Nodal Officer assigns Inspector
  const handleAssignInspector = (
    complaintId: string,
    inspectorName: string,
    inspectorPhone: string
  ) => {
    let targetComplaint: CitizenComplaint | null = null;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const updated: CitizenComplaint = {
            ...c,
            status: 'INSPECTOR_ASSIGNED',
            assignedInspector: inspectorName,
            assignedInspectorPhone: inspectorPhone,
          };
          targetComplaint = updated;
          return updated;
        }
        return c;
      })
    );
    if (targetComplaint) {
      saveComplaintToSupabase(targetComplaint);
    }
  };

  // 3. Inspector conducts inspection & logs TDS/Waste source
  const handleSubmitInspectionReport = (complaintId: string, report: InspectorReport) => {
    let targetComplaint: CitizenComplaint | null = null;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const updated: CitizenComplaint = {
            ...c,
            status: 'INSPECTION_COMPLETED',
            inspectionReport: report,
          };
          targetComplaint = updated;
          return updated;
        }
        return c;
      })
    );
    if (targetComplaint) {
      saveComplaintToSupabase(targetComplaint);
    }
  };

  // 4. Nodal Officer deploys Action Engineer
  const handleAssignEngineer = (
    complaintId: string,
    engineerName: string,
    engineerPhone: string,
    deadline: string
  ) => {
    let targetComplaint: CitizenComplaint | null = null;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const workExec: EngineerWorkExecution = {
          id: `WRK-2026-${Math.floor(100 + Math.random() * 900)}`,
          engineerName,
          engineerPhone,
          assignedAt: new Date().toISOString().slice(0, 10),
          deadline,
          status: 'PENDING_ACCEPTANCE',
          beforePhotoUrl: c.photoUrl,
        };
        const updated: CitizenComplaint = {
          ...c,
          status: 'WORKER_IN_PROGRESS',
          assignedEngineer: engineerName,
          assignedEngineerPhone: engineerPhone,
          workExecution: workExec,
        };
        targetComplaint = updated;
        return updated;
      })
    );
    if (targetComplaint) {
      saveComplaintToSupabase(targetComplaint);
    }
  };

  // 5. Engineer accepts task with Before Photo
  const handleAcceptTask = (complaintId: string, beforePhotoUrl: string) => {
    let targetComplaint: CitizenComplaint | null = null;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workExecution) return c;
        const updated: CitizenComplaint = {
          ...c,
          status: 'WORKER_IN_PROGRESS',
          workExecution: {
            ...c.workExecution,
            status: 'ACCEPTED',
            beforePhotoUrl,
            startedAt: new Date().toISOString().slice(0, 10),
          },
        };
        targetComplaint = updated;
        return updated;
      })
    );
    if (targetComplaint) {
      saveComplaintToSupabase(targetComplaint);
    }
  };

  // 6. Engineer blocks task with reason
  const handleBlockTask = (complaintId: string, reason: string) => {
    let targetComplaint: CitizenComplaint | null = null;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workExecution) return c;
        const updated: CitizenComplaint = {
          ...c,
          workExecution: {
            ...c.workExecution,
            status: 'BLOCKED',
            blockReason: reason,
          },
        };
        targetComplaint = updated;
        return updated;
      })
    );
    if (targetComplaint) {
      saveComplaintToSupabase(targetComplaint);
    }
  };

  // 7. Engineer completes work with After Photo
  const handleCompleteTask = (complaintId: string, afterPhotoUrl: string, workSummary: string) => {
    let targetComplaint: CitizenComplaint | null = null;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workExecution) return c;
        const updated: CitizenComplaint = {
          ...c,
          status: 'VERIFICATION_PENDING',
          workExecution: {
            ...c.workExecution,
            status: 'COMPLETED',
            afterPhotoUrl,
            workSummary,
            completedAt: new Date().toISOString().slice(0, 10),
          },
        };
        targetComplaint = updated;
        return updated;
      })
    );
    if (targetComplaint) {
      saveComplaintToSupabase(targetComplaint);
    }
  };

  // 8. Inspector performs post-work site verification
  const handleSubmitPostWorkVerification = (
    complaintId: string,
    isSatisfactory: boolean,
    photoUrl: string,
    remarks: string
  ) => {
    let targetComplaint: CitizenComplaint | null = null;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;

        const updatedReport: InspectorReport | undefined = c.inspectionReport
          ? {
              ...c.inspectionReport,
              postWorkVerification: {
                verifiedAt: new Date().toISOString().slice(0, 10),
                isSatisfactory,
                verificationPhotoUrl: photoUrl,
                remarks,
              },
            }
          : undefined;

        const updated: CitizenComplaint = {
          ...c,
          status: isSatisfactory ? 'RESOLVED' : 'WORKER_IN_PROGRESS',
          inspectionReport: updatedReport,
        };
        targetComplaint = updated;
        return updated;
      })
    );
    if (targetComplaint) {
      saveComplaintToSupabase(targetComplaint);
    }
  };

  // State Admin updates complaint / appends directive memo
  const handleUpdateComplaint = (updated: CitizenComplaint) => {
    setComplaints((prev) => {
      const next = prev.map((c) => (c.id === updated.id ? updated : c));
      try {
        localStorage.setItem('nir_complaints', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to sync updated complaint', e);
      }
      return next;
    });
    saveComplaintToSupabase(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] w-full">
      {/* Top Navigation Bar with Language Toggle & Login / Hamburger Button */}
      <NirikshanHeader
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsOtpModalOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenSubmissionDossier={() => setIsSubmissionDossierOpen(true)}
      />

      {/* Main Dashboard Body Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
        {/* Sleek Breadcrumb Bar when viewing any restricted govt sub-dashboard (hidden on State Admin, Portal Home & Nodal) */}
        {currentRole !== 'overview' && currentRole !== 'user' && currentRole !== 'admin' && currentRole !== 'nodal' && !currentRole.startsWith('nodal_') && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <button 
                onClick={() => setCurrentRole('overview')}
                className="font-semibold text-slate-500 hover:text-[#0077B6] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t('breadcrumbPortalHome')}</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-[#03045E] bg-[#CAF0F8] px-3 py-1 rounded-full border border-[#00B4D8]/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {currentRole === 'inspector' ? t('breadcrumbInspector') : t('breadcrumbEngineer')}
                </span>
              </span>
            </div>

            <button
              onClick={() => setCurrentRole('overview')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#03045E] hover:bg-[#0077B6] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
              title="Back to Portal Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-200" />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* 1. PORTAL HOME / OVERVIEW (DEFAULT ON FIRST VISIT - NO CITIZEN COMPLAINT CARDS HERE) */}
        {currentRole === 'overview' && (
          <MainPortalDashboard
            waterBodies={waterBodies}
            complaints={complaints}
            onSelectRole={handleSelectRole}
            onOpenLodgeModal={() => setIsLodgeModalOpen(true)}
            onOpenDirectoryModal={() => setIsDirectoryModalOpen(true)}
          />
        )}

        {/* 2. CITIZEN / NORMAL USER DASHBOARD (SHOWN ONLY WHEN USER CLICKS ON 'NORMAL USER') */}
        {currentRole === 'user' && (
          <CitizenDashboard
            complaints={complaints}
            waterBodies={waterBodies}
            currentUser={currentUser}
            isLoggedIn={isLoggedIn}
            onOpenLoginModal={() => setIsOtpModalOpen(true)}
            onOpenLodgeModal={() => setIsLodgeModalOpen(true)}
            onOpenDirectoryModal={() => setIsDirectoryModalOpen(true)}
          />
        )}

        {/* 3. STATE ADMIN DASHBOARD (AP STATE AUDIT & PDF EXPORT) */}
        {currentRole === 'admin' && (
          <AdminDashboard
            waterBodies={waterBodies}
            complaints={complaints}
            officers={officers}
            onOpenDirectoryModal={() => setIsDirectoryModalOpen(true)}
            onOpenLodgeModal={() => setIsLodgeModalOpen(true)}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onUpdateComplaint={handleUpdateComplaint}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            onBackToHome={() => setCurrentRole('overview')}
          />
        )}

        {/* 4. NODAL OFFICER - ALL 26 DISTRICTS OF ANDHRA PRADESH */}
        {(currentRole === 'nodal' ||
          currentRole === 'nodal_vizianagaram' ||
          currentRole === 'nodal_parvathipuram' ||
          currentRole === 'nodal_visakhapatnam') && (
          <NodalOfficerDashboard
            district={
              currentRole === 'nodal_vizianagaram'
                ? 'Vizianagaram'
                : currentRole === 'nodal_parvathipuram'
                ? 'Parvathipuram Manyam'
                : currentRole === 'nodal_visakhapatnam'
                ? 'Visakhapatnam'
                : selectedNodalDistrict || undefined
            }
            initialSelectingDistrict={currentRole === 'nodal'}
            onSelectDistrict={(d) => setSelectedNodalDistrict(d)}
            complaints={complaints}
            waterBodies={waterBodies}
            officers={officers}
            onAssignInspector={handleAssignInspector}
            onAssignEngineer={handleAssignEngineer}
            onUpdateComplaint={handleUpdateComplaint}
            onBackToHome={() => setCurrentRole('overview')}
          />
        )}

        {/* 6. FIELD INSPECTOR MOBILE WORKSTATION */}
        {currentRole === 'inspector' && (
          <InspectorDashboard
            complaints={complaints}
            waterBodies={waterBodies}
            onSubmitInspectionReport={handleSubmitInspectionReport}
            onSubmitPostWorkVerification={handleSubmitPostWorkVerification}
          />
        )}

        {/* 7. ACTION WORKER / ENGINEER MOBILE WORKSTATION */}
        {currentRole === 'engineer' && (
          <EngineerDashboard
            complaints={complaints}
            waterBodies={waterBodies}
            onAcceptTask={handleAcceptTask}
            onBlockTask={handleBlockTask}
            onCompleteTask={handleCompleteTask}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0b1b36] text-slate-300 text-xs py-7 border-t border-blue-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">
                  {t('footerTitle')}
                </h4>
                <p className="text-blue-300 text-[11px]">
                  {t('footerSubtitle')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDirectoryModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('verifiedOfficerContacts')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-blue-900/60 pt-3">
            <div>
              {t('footerPortalsList')}
            </div>
            <div className="font-mono text-emerald-400">
              {t('footerStaffCredentials')}
            </div>
          </div>
        </div>
      </footer>

      {/* Lodge Complaint Modal (Login Required Flow) */}
      <LodgeComplaintModal
        isOpen={isLodgeModalOpen}
        onClose={() => setIsLodgeModalOpen(false)}
        onComplaintSubmitted={handleComplaintSubmitted}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onOpenLoginModal={() => {
          setIsLodgeModalOpen(false);
          setIsOtpModalOpen(true);
        }}
        onLoginSuccess={handleOtpLoginSuccess}
      />

      {/* Officer Directory Modal */}
      <OfficerDirectoryModal
        isOpen={isDirectoryModalOpen}
        onClose={() => setIsDirectoryModalOpen(false)}
        officers={officers}
      />

      {/* Slide-out Navigation Drawer (Hamburger Menu) */}
      <NirikshanSlideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        currentUser={currentUser}
        onLogout={handleUserLogout}
        onOpenLodgeModal={() => setIsLodgeModalOpen(true)}
        onOpenDirectoryModal={() => setIsDirectoryModalOpen(true)}
        selectedNodalDistrict={selectedNodalDistrict}
        onSelectNodalDistrict={setSelectedNodalDistrict}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setIsOtpModalOpen(true)}
        onOpenSubmissionDossier={() => setIsSubmissionDossierOpen(true)}
      />

      {/* Citizen Mobile OTP Login Modal (Image 3 -> Login Page Flow) */}
      <OtpLoginModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onLoginSuccess={handleOtpLoginSuccess}
      />

      {/* Authentication Gate Modal (admin@nir.com / 1234) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        targetRole={pendingAuthRole}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Supabase Cloud Database Status & Configuration Guide Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        complaintCount={complaints.length}
        onRefresh={() => {
          if (isSupabaseConfigured()) {
            fetchComplaintsFromSupabase().then((data) => {
              if (data && data.length > 0) setComplaints(data);
            });
          }
        }}
      />

      {/* Hackathon Supporting Materials Dossier Modal (System Architecture, Workflow, Screenshots Guide) */}
      <SubmissionDossierModal
        isOpen={isSubmissionDossierOpen}
        onClose={() => setIsSubmissionDossierOpen(false)}
        onNavigateToScreen={(role) => {
          handleSelectRole(role);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
