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
  INITIAL_CITIZEN_COMPLAINTS 
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
import { useLanguage } from './context/LanguageContext';
import { Droplets, Phone, AlertTriangle, ShieldCheck, Globe, Menu, Layers } from 'lucide-react';

export default function App() {
  const { t, language } = useLanguage();
  // Default to overview landing page (national map and executive command, not user data)
  const [currentRole, setCurrentRole] = useState<UserRoleType>('overview');

  // Cache version to automatically purge stale mock data from previous sessions
  const STORAGE_VERSION = 'v10_vizianagaram_5color_real_telemetry';

  // Load persisted state or initial seed data with version check
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>(() => {
    try {
      const version = localStorage.getItem('nir_storage_version');
      if (version !== STORAGE_VERSION) {
        localStorage.setItem('nir_storage_version', STORAGE_VERSION);
        localStorage.setItem('nir_water_bodies', JSON.stringify(INITIAL_WATER_BODIES));
        return INITIAL_WATER_BODIES;
      }
      const saved = localStorage.getItem('nir_water_bodies');
      return saved ? JSON.parse(saved) : INITIAL_WATER_BODIES;
    } catch {
      return INITIAL_WATER_BODIES;
    }
  });

  const [complaints, setComplaints] = useState<CitizenComplaint[]>(() => {
    try {
      const saved = localStorage.getItem('nir_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_CITIZEN_COMPLAINTS.length) {
          return parsed;
        }
      }
      return INITIAL_CITIZEN_COMPLAINTS;
    } catch {
      return INITIAL_CITIZEN_COMPLAINTS;
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
  const [selectedNodalDistrict, setSelectedNodalDistrict] = useState<string>('Vizianagaram');

  // Auth states for the protected roles
  const [authenticatedRoles, setAuthenticatedRoles] = useState<Record<UserRoleType, boolean>>({
    overview: true,
    user: true,
    admin: true,
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

  // Role selection logic with auth gate
  const handleSelectRole = (role: UserRoleType) => {
    // If not logged in and choosing any protected dashboard, prompt OTP login modal
    if (role !== 'overview' && role !== 'user' && !isLoggedIn) {
      setIsOtpModalOpen(true);
      return;
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

  // --- Complaint & Workflow Handlers ---

  // 1. Citizen submits complaint
  const handleComplaintSubmitted = (newComplaint: CitizenComplaint) => {
    setComplaints([newComplaint, ...complaints]);
  };

  // 2. Nodal Officer assigns Inspector
  const handleAssignInspector = (
    complaintId: string,
    inspectorName: string,
    inspectorPhone: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: 'INSPECTOR_ASSIGNED',
              assignedInspector: inspectorName,
              assignedInspectorPhone: inspectorPhone,
            }
          : c
      )
    );
  };

  // 3. Inspector conducts inspection & logs TDS/Waste source
  const handleSubmitInspectionReport = (complaintId: string, report: InspectorReport) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: 'INSPECTION_COMPLETED',
              inspectionReport: report,
            }
          : c
      )
    );
  };

  // 4. Nodal Officer deploys Action Engineer
  const handleAssignEngineer = (
    complaintId: string,
    engineerName: string,
    engineerPhone: string,
    deadline: string
  ) => {
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
        return {
          ...c,
          status: 'WORKER_IN_PROGRESS',
          assignedEngineer: engineerName,
          assignedEngineerPhone: engineerPhone,
          workExecution: workExec,
        };
      })
    );
  };

  // 5. Engineer accepts task with Before Photo
  const handleAcceptTask = (complaintId: string, beforePhotoUrl: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workExecution) return c;
        return {
          ...c,
          status: 'WORKER_IN_PROGRESS',
          workExecution: {
            ...c.workExecution,
            status: 'ACCEPTED',
            beforePhotoUrl,
            startedAt: new Date().toISOString().slice(0, 10),
          },
        };
      })
    );
  };

  // 6. Engineer blocks task with reason
  const handleBlockTask = (complaintId: string, reason: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workExecution) return c;
        return {
          ...c,
          workExecution: {
            ...c.workExecution,
            status: 'BLOCKED',
            blockReason: reason,
          },
        };
      })
    );
  };

  // 7. Engineer completes work with After Photo
  const handleCompleteTask = (complaintId: string, afterPhotoUrl: string, workSummary: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workExecution) return c;
        return {
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
      })
    );
  };

  // 8. Inspector performs post-work site verification
  const handleSubmitPostWorkVerification = (
    complaintId: string,
    isSatisfactory: boolean,
    photoUrl: string,
    remarks: string
  ) => {
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

        return {
          ...c,
          status: isSatisfactory ? 'RESOLVED' : 'WORKER_IN_PROGRESS',
          inspectionReport: updatedReport,
        };
      })
    );
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
      />

      {/* Main Dashboard Body Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
        {/* Sleek Breadcrumb Bar when viewing any restricted govt sub-dashboard */}
        {currentRole !== 'overview' && currentRole !== 'user' && (
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
                  {currentRole === 'admin' ? t('breadcrumbAdmin') :
                   currentRole === 'nodal_vizianagaram' ? t('breadcrumbNodalVzm') :
                   currentRole === 'nodal_parvathipuram' ? t('breadcrumbNodalPvm') :
                   currentRole === 'nodal_visakhapatnam' ? t('breadcrumbNodalVskp') :
                   currentRole === 'inspector' ? t('breadcrumbInspector') :
                   t('breadcrumbEngineer')}
                </span>
              </span>
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#03045E] hover:bg-[#0077B6] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span>{t('switchPortal')}</span>
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
          />
        )}

        {/* 4. NODAL OFFICER - VIZIANAGARAM */}
        {currentRole === 'nodal_vizianagaram' && (
          <NodalOfficerDashboard
            district="Vizianagaram"
            complaints={complaints}
            waterBodies={waterBodies}
            officers={officers}
            onAssignInspector={handleAssignInspector}
            onAssignEngineer={handleAssignEngineer}
          />
        )}

        {/* 5. NODAL OFFICER - PARVATHIPURAM MANYAM */}
        {currentRole === 'nodal_parvathipuram' && (
          <NodalOfficerDashboard
            district="Parvathipuram Manyam"
            complaints={complaints}
            waterBodies={waterBodies}
            officers={officers}
            onAssignInspector={handleAssignInspector}
            onAssignEngineer={handleAssignEngineer}
          />
        )}

        {/* 6. NODAL OFFICER - VISAKHAPATNAM */}
        {currentRole === 'nodal_visakhapatnam' && (
          <NodalOfficerDashboard
            district="Visakhapatnam"
            complaints={complaints}
            waterBodies={waterBodies}
            officers={officers}
            onAssignInspector={handleAssignInspector}
            onAssignEngineer={handleAssignEngineer}
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

      {/* Lodge Complaint Modal (No login required) */}
      <LodgeComplaintModal
        isOpen={isLodgeModalOpen}
        onClose={() => setIsLodgeModalOpen(false)}
        onComplaintSubmitted={handleComplaintSubmitted}
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
    </div>
  );
}
