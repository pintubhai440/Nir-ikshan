import React, { useState, useEffect } from 'react';
import { CitizenComplaint } from '../types/nirikshan';
import { computeSLACountdown, SLACountdownInfo } from '../utils/slaTimer';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert, Calendar, Hourglass, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  complaint: CitizenComplaint;
  variant?: 'headerBadge' | 'citizenCard' | 'tableBadge';
}

const SLA_COUNTER_TEXT = {
  en: {
    statutorySlaResolved: '72h Statutory SLA: Resolved in SLA',
    slaBreached: 'SLA Breached',
    slaLabel: '72h SLA:',
    left: 'left',
    resolved: 'Resolved',
    breached: 'Breached',
    filed: 'Filed',
    publicComplaintFiled: 'Public Complaint Filed',
    statutory72h: '72h Statutory SLA',
    filingDate: 'Filing Date',
    timeIst: 'Time (IST)',
    liveElapsed: 'Live Elapsed:',
    ago: 'ago',
    timeLeftToResolve: 'Time Left to Resolve:',
    caseResolved: 'Case Resolved',
    used: 'used',
    targetDeadline: 'Target Deadline:',
  },
  hi: {
    statutorySlaResolved: '72 घंटे वैधानिक एसएलए: समय पर समाधान',
    slaBreached: 'एसएलए उल्लंघन',
    slaLabel: '72 घंटे एसएलए:',
    left: 'शेष',
    resolved: 'समाधान हो गया',
    breached: 'उल्लंघन',
    filed: 'दर्ज',
    publicComplaintFiled: 'नागरिक शिकायत दर्ज विवरण',
    statutory72h: '72 घंटे वैधानिक एसएलए',
    filingDate: 'दर्ज तिथि',
    timeIst: 'समय (IST)',
    liveElapsed: 'बीता हुआ समय:',
    ago: 'पहले',
    timeLeftToResolve: 'समाधान हेतु शेष समय:',
    caseResolved: 'शिकायत का समाधान हुआ',
    used: 'प्रयुक्त',
    targetDeadline: 'अंतिम समय-सीमा:',
  },
  te: {
    statutorySlaResolved: '72 గంటల చట్టబద్ధమైన SLA: సకాలంలో పరిష్కారం',
    slaBreached: 'SLA ఉల్లంఘించబడింది',
    slaLabel: '72 గంటల SLA:',
    left: 'మిగిలి ఉంది',
    resolved: 'పరిష్కరించబడింది',
    breached: 'ఉల్లంఘన',
    filed: 'నమోదు',
    publicComplaintFiled: 'ప్రజా ఫిర్యాదు నమోదు వివరాలు',
    statutory72h: '72 గంటల చట్టబద్ధమైన SLA',
    filingDate: 'నమోదు తేదీ',
    timeIst: 'సమయం (IST)',
    liveElapsed: 'గడిచిన సమయం:',
    ago: 'క్రితం',
    timeLeftToResolve: 'పరిష్కారానికి మిగిలిన సమయం:',
    caseResolved: 'కేసు పరిష్కారమైంది',
    used: 'పూర్తయింది',
    targetDeadline: 'లక్ష్య గడువు:',
  }
};

export const ComplaintLiveSLACounter: React.FC<Props> = ({ complaint, variant = 'headerBadge' }) => {
  const { language } = useLanguage();
  const langKey = (language === 'hi' || language === 'te') ? language : 'en';
  const txt = SLA_COUNTER_TEXT[langKey];

  // 1-second ticking state for live countdown
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => (prev + 1) % 1000000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const slaInfo: SLACountdownInfo = computeSLACountdown(
    complaint.submittedAt,
    complaint.status,
    complaint.workExecution?.deadline,
    72
  );

  const isResolved = complaint.status === 'RESOLVED';

  // VARIANT 1: DOCKET HEADER BADGE
  if (variant === 'headerBadge') {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`text-[11px] font-mono font-bold px-3 py-1 rounded-xl border flex items-center gap-2 shadow-2xs transition-colors ${slaInfo.badgeBg} ${slaInfo.badgeText} ${slaInfo.badgeBorder}`}
          title={`Filed on: ${slaInfo.formattedFull} • Deadline: ${slaInfo.deadlineFormatted}`}
        >
          {isResolved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{txt.statutorySlaResolved}</span>
            </>
          ) : slaInfo.isOverdue ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="font-bold text-rose-800">
                {txt.slaBreached}: {slaInfo.overdueFormatted}
              </span>
            </>
          ) : (
            <>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  slaInfo.urgencyLevel === 'critical'
                    ? 'bg-red-500 animate-ping'
                    : slaInfo.urgencyLevel === 'warning'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <Clock
                className={`w-3.5 h-3.5 shrink-0 ${
                  slaInfo.urgencyLevel === 'critical'
                    ? 'text-red-600'
                    : slaInfo.urgencyLevel === 'warning'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              />
              <span className="font-semibold text-slate-800">{txt.slaLabel}</span>
              <span className="font-bold">
                ⏳ {slaInfo.remainingFormatted} {txt.left}
              </span>
            </>
          )}
        </span>
      </div>
    );
  }

  // VARIANT 2: TABLE VIEW BADGE (ACCOUNTABILITY MATRIX)
  if (variant === 'tableBadge') {
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isResolved
                ? 'bg-teal-500'
                : slaInfo.isOverdue
                ? 'bg-rose-500 animate-ping'
                : slaInfo.urgencyLevel === 'warning'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
          <span
            className={`text-[10px] font-mono font-bold ${
              isResolved
                ? 'text-teal-700'
                : slaInfo.isOverdue
                ? 'text-rose-700 font-extrabold'
                : slaInfo.urgencyLevel === 'warning'
                ? 'text-amber-800'
                : 'text-emerald-700'
            }`}
          >
            {isResolved
              ? txt.resolved
              : slaInfo.isOverdue
              ? `${txt.breached} (${slaInfo.overdueFormatted})`
              : `${slaInfo.remainingFormatted} ${txt.left}`}
          </span>
        </div>
        <div className="text-[9px] text-slate-400 font-mono">
          {txt.filed}: {slaInfo.formattedDate}
        </div>
      </div>
    );
  }

  // VARIANT 3: CAM 01 CITIZEN CARD COMPACT REAL-TIME FILING & SLA COUNTDOWN
  return (
    <div className="pt-2 mt-2 border-t border-slate-200/90 space-y-1.5">
      {/* Filing & Statutory SLA Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-[#0077B6]" />
          <span>{txt.publicComplaintFiled}</span>
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {slaInfo.formattedDate} • {slaInfo.formattedTime}
        </span>
      </div>

      {/* SLA Countdown & Health Bar */}
      <div
        className={`rounded-xl p-2 border space-y-1.5 transition-colors shadow-2xs ${
          isResolved
            ? 'bg-teal-50/80 border-teal-200 text-teal-900'
            : slaInfo.isOverdue
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : slaInfo.urgencyLevel === 'critical'
            ? 'bg-red-50 border-red-300 text-red-950'
            : slaInfo.urgencyLevel === 'warning'
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-extrabold flex items-center gap-1">
            <Hourglass
              className={`w-3.5 h-3.5 ${
                isResolved
                  ? 'text-teal-600'
                  : slaInfo.isOverdue
                  ? 'text-rose-600'
                  : slaInfo.urgencyLevel === 'warning'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            />
            <span>{isResolved ? txt.caseResolved : slaInfo.isOverdue ? txt.slaBreached : txt.timeLeftToResolve}</span>
          </span>
          <span className="font-mono font-black text-xs">
            {isResolved ? (
              <span className="text-teal-700 font-bold">✓ On SLA</span>
            ) : slaInfo.isOverdue ? (
              <span className="text-rose-700 font-extrabold">⚠️ {slaInfo.overdueFormatted}</span>
            ) : (
              <span className={slaInfo.urgencyLevel === 'critical' ? 'text-red-700 font-bold' : slaInfo.urgencyLevel === 'warning' ? 'text-amber-800 font-bold' : 'text-emerald-800 font-bold'}>
                ⏳ {slaInfo.remainingFormatted}
              </span>
            )}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isResolved
                ? 'bg-teal-500'
                : slaInfo.isOverdue
                ? 'bg-rose-600'
                : slaInfo.urgencyLevel === 'critical'
                ? 'bg-red-600'
                : slaInfo.urgencyLevel === 'warning'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${isResolved ? 100 : slaInfo.percentConsumed}%` }}
          />
        </div>

        <div className="text-[9px] font-mono flex items-center justify-between text-slate-500 pt-0.5">
          <span>{slaInfo.elapsedFormatted} {txt.ago} ({slaInfo.percentConsumed}% {txt.used})</span>
          <span className="font-semibold text-slate-700">{txt.targetDeadline} {slaInfo.deadlineFormatted}</span>
        </div>
      </div>
    </div>
  );
};
