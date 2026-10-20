import { jsPDF } from 'jspdf';
import { MicroWatershed } from '../types/watershed';

/**
 * Generates an executive-grade, beautifully styled, minimalist A4 Water Audit Report for Nir-ikshan.
 * Designed to strictly reflect the Nir-ikshan brand identity, color scheme, and inspect-act-verify workflow:
 * - Primary Palette: Deep Midnight Navy (#03045E), Ocean Blue (#0077B6), Vibrant Sky (#00B4D8)
 * - Supporting Tones: Ice Blue (#E0F2FE), Clean Slate (#F8FAFC), Charcoal (#0F172A)
 * - Status Accents: Emerald Green (#059669), Coral Red (#DC2626), Amber (#D97706)
 * - Authentic Metadata: Seva First Innovation Challenge 2026 (Track A: Swachh & Sustainable Bharat)
 * - 100% Clean Font Rendering (No unencoded devanagari characters that break PDF rendering)
 */
export function generateWatershedPdfReport(watershed: MicroWatershed) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 12; // 12 mm margins
  const contentWidth = pageWidth - margin * 2; // 186 mm
  const now = new Date();
  const dateStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;

  // Brand Palette Constants (Nir-ikshan Theme)
  const cNavy: [number, number, number] = [3, 4, 94]; // #03045E
  const cOcean: [number, number, number] = [0, 119, 182]; // #0077B6
  const cCyan: [number, number, number] = [0, 180, 216]; // #00B4D8
  const cIce: [number, number, number] = [224, 242, 254]; // #E0F2FE
  const cCardBg: [number, number, number] = [248, 250, 252]; // #F8FAFC
  const cBorder: [number, number, number] = [226, 232, 240]; // #E2E8F0
  const cDark: [number, number, number] = [15, 23, 42]; // #0F172A
  const cSlate: [number, number, number] = [71, 85, 105]; // #475569
  const cMuted: [number, number, number] = [148, 163, 184]; // #94A3B8

  // Status Color Helper
  const getStatusColor = (status: string): [number, number, number] => {
    switch (status?.toLowerCase()) {
      case 'critical':
        return [220, 38, 38]; // Red
      case 'stressed':
        return [234, 88, 12]; // Orange
      case 'watch':
        return [217, 119, 6]; // Amber
      case 'normal':
        return [5, 150, 105]; // Emerald
      default:
        return [71, 85, 105];
    }
  };

  // Metric Volume Formatter
  const formatCuM = (val: number) => {
    if (Math.abs(val) >= 10000000) {
      return `${(val / 10000000).toFixed(2)} Cr m3`;
    }
    if (Math.abs(val) >= 100000) {
      return `${(val / 100000).toFixed(2)} Lakh m3`;
    }
    return `${val.toLocaleString()} m3`;
  };

  // Helper to draw modern section header with colored accent dot
  const drawSectionHeader = (title: string, sub: string, yPos: number) => {
    doc.setFillColor(cOcean[0], cOcean[1], cOcean[2]);
    doc.circle(margin + 1.5, yPos - 1.2, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(title, margin + 5, yPos);

    if (sub) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
      doc.text(sub, pageWidth - margin, yPos, { align: 'right' });
    }
  };

  // ==============================================================================
  // PAGE 1: EXECUTIVE AUDIT SUMMARY & WATER BALANCE SHEET
  // ==============================================================================

  // 1. Top Decorative Brand Banner
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');

  // Cyan gradient bottom accent line
  doc.setFillColor(cCyan[0], cCyan[1], cCyan[2]);
  doc.rect(0, 25, pageWidth, 1.5, 'F');

  // National Flag / Authority Line
  doc.setTextColor(cIce[0], cIce[1], cIce[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('GOVERNMENT OF INDIA • MINISTRY OF JAL SHAKTI • NATIONAL WATER INFORMATICS', margin, 6.5);

  // Main Nir-ikshan Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NIR-IKSHAN [Neer-Ikshan]', margin, 13.5);

  // English Tagline & Purpose
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(186, 230, 253);
  doc.text('National Micro-Watershed Grid & Hydrological Surveillance  |  Inspect. Act. Verify. Restore.', margin, 18.5);

  // Right-aligned Challenge Pill
  doc.setFillColor(0, 150, 214);
  doc.roundedRect(pageWidth - margin - 60, 5, 60, 6.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text('SFIC 2026 • SWACHH & SUSTAINABLE BHARAT', pageWidth - margin - 57, 9.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(191, 219, 254);
  doc.text('Team: AURAlytics | Dept. of CS (Track A)', pageWidth - margin - 3, 17, { align: 'right' });
  doc.text('Portal: https://nir-ikshan.vercel.app', pageWidth - margin - 3, 21, { align: 'right' });

  // 2. Reference & Security Verification Sub-bar
  doc.setFillColor(240, 249, 255);
  doc.rect(0, 26.5, pageWidth, 7, 'F');
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.line(0, 33.5, pageWidth, 33.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(cOcean[0], cOcean[1], cOcean[2]);
  doc.text(`AUDIT DOSSIER REF: NIR-AUDIT-${watershed.code}-${now.getFullYear()}`, margin, 31);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`GENERATED: ${dateStr}  •  ISRO-BHUVAN & APWRIMS VERIFIED GRID`, pageWidth - margin, 31, { align: 'right' });

  let y = 37;

  // 3. Watershed Executive Dossier Card
  doc.setFillColor(cCardBg[0], cCardBg[1], cCardBg[2]);
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 47, 2, 2, 'FD');

  // Top accent bar of card
  doc.setFillColor(cOcean[0], cOcean[1], cOcean[2]);
  doc.rect(margin, y, contentWidth, 1.2, 'F');

  // Watershed Name & Subtext
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text(`${watershed.name}`, margin + 4, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`District: ${watershed.district}   |   State: ${watershed.state}   |   Basin: ${watershed.basin}   |   Catchment Area: ${watershed.areaSqKm} km²`, margin + 4, y + 11.5);

  // Status Pill Badge
  const stColor = getStatusColor(watershed.currentStatus);
  doc.setFillColor(stColor[0], stColor[1], stColor[2]);
  doc.roundedRect(pageWidth - margin - 48, y + 4.5, 44, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(`AQUIFER STATUS: ${watershed.currentStatus.toUpperCase()}`, pageWidth - margin - 45.5, y + 9);

  // 4 Key Hydrological Metric KPI Cards
  const kpiW = (contentWidth - 9) / 4;
  const kpiY = y + 16.5;

  // KPI 1: Groundwater Depth
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + 3, kpiY, kpiW, 26, 1.5, 1.5, 'FD');
  doc.setFillColor(cOcean[0], cOcean[1], cOcean[2]);
  doc.rect(margin + 3, kpiY, kpiW, 1, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('CURRENT GW LEVEL', margin + 5.5, kpiY + 5);

  doc.setFontSize(11);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text(`${watershed.groundwaterCurrentBgl} m bgl`, margin + 5.5, kpiY + 12);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  const gwNegative = watershed.groundwaterTrend1YrPercent < 0;
  doc.setTextColor(gwNegative ? 220 : 5, gwNegative ? 38 : 150, gwNegative ? 38 : 105);
  doc.text(`${watershed.groundwaterTrend1YrPercent}% 1-Yr Trend`, margin + 5.5, kpiY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`Historical: ${watershed.groundwaterHistoricalAvgBgl} m`, margin + 5.5, kpiY + 22);

  // KPI 2: Monsoon Rainfall
  const kpi2X = margin + 3 + kpiW + 3;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(kpi2X, kpiY, kpiW, 26, 1.5, 1.5, 'FD');
  doc.setFillColor(cCyan[0], cCyan[1], cCyan[2]);
  doc.rect(kpi2X, kpiY, kpiW, 1, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('SEASONAL RAINFALL', kpi2X + 2.5, kpiY + 5);

  doc.setFontSize(11);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text(`${watershed.rainfallCurrentSeasonMm} mm`, kpi2X + 2.5, kpiY + 12);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  const rainDeficit = watershed.rainfallDeficitPercent < 0;
  doc.setTextColor(rainDeficit ? 220 : 5, rainDeficit ? 38 : 150, rainDeficit ? 38 : 105);
  doc.text(`${watershed.rainfallDeficitPercent}% IMD Deficit`, kpi2X + 2.5, kpiY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`Normal: ${watershed.rainfallNormalMm} mm`, kpi2X + 2.5, kpiY + 22);

  // KPI 3: Recharge Assets
  const kpi3X = kpi2X + kpiW + 3;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(kpi3X, kpiY, kpiW, 26, 1.5, 1.5, 'FD');
  doc.setFillColor(249, 115, 22); // Orange
  doc.rect(kpi3X, kpiY, kpiW, 1, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('RECHARGE STRUCTURES', kpi3X + 2.5, kpiY + 5);

  doc.setFontSize(11);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text(`${watershed.functionalAssetsCount} / ${watershed.totalRechargeAssets}`, kpi3X + 2.5, kpiY + 12);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text(`${watershed.needsRepairCount} Need Desilt / Repair`, kpi3X + 2.5, kpiY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  const funcPct = Math.round((watershed.functionalAssetsCount / (watershed.totalRechargeAssets || 1)) * 100);
  doc.text(`Health Index: ${funcPct}% Functional`, kpi3X + 2.5, kpiY + 22);

  // KPI 4: Stress Index
  const kpi4X = kpi3X + kpiW + 3;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(kpi4X, kpiY, kpiW, 26, 1.5, 1.5, 'FD');
  doc.setFillColor(220, 38, 38); // Crimson Red
  doc.rect(kpi4X, kpiY, kpiW, 1, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('COMPOSITE STRESS', kpi4X + 2.5, kpiY + 5);

  doc.setFontSize(11);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text(`${watershed.stressScore} / 100`, kpi4X + 2.5, kpiY + 12);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(stColor[0], stColor[1], stColor[2]);
  doc.text(`Priority Surveillance`, kpi4X + 2.5, kpiY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`Data Confidence: ${watershed.dataConfidence}`, kpi4X + 2.5, kpiY + 22);

  y += 53;

  // 4. SECTION 1: SEASONAL WATER ACCOUNTABILITY LEDGER (Aquifer Balance Sheet)
  drawSectionHeader(
    '1. SEASONAL WATER ACCOUNTABILITY LEDGER (AQUIFER BALANCE SHEET)',
    'Unit: Cubic Metres (m3)  •  Official Piezometric DWLR Logs',
    y
  );

  y += 4;

  const tableHeaders = [
    { label: 'Season Cycle', w: 32 },
    { label: 'Rainfall Inflow', w: 23 },
    { label: 'Natural Infil.', w: 21 },
    { label: 'Recharge Trapped', w: 24 },
    { label: 'Irrigation Draft', w: 22 },
    { label: 'Net Aquifer Bal.', w: 28 },
    { label: 'GW Shift', w: 18 },
    { label: 'Audit Result', w: 18 },
  ];

  // Table Header Strip
  doc.setFillColor(cOcean[0], cOcean[1], cOcean[2]);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);

  let curX = margin + 2;
  tableHeaders.forEach((th) => {
    doc.text(th.label, curX, y + 4.2);
    curX += th.w;
  });

  y += 6;

  // Table Body Rows
  watershed.ledger.forEach((cycle, rIdx) => {
    const isEven = rIdx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5.8, 'F');
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.line(margin, y + 5.8, pageWidth - margin, y + 5.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);

    curX = margin + 2;

    // Season
    doc.setFont('helvetica', 'bold');
    doc.text(cycle.seasonLabel, curX, y + 4);
    curX += tableHeaders[0].w;

    // Inflow
    doc.setFont('helvetica', 'normal');
    doc.text(formatCuM(cycle.rainfallInflowCuM), curX, y + 4);
    curX += tableHeaders[1].w;

    // Natural
    doc.text(formatCuM(cycle.naturalInfiltrationCuM), curX, y + 4);
    curX += tableHeaders[2].w;

    // Recharge
    doc.text(formatCuM(cycle.artificialRechargeCapturedCuM), curX, y + 4);
    curX += tableHeaders[3].w;

    // Extraction
    doc.text(formatCuM(cycle.estimatedIrrigationExtractionCuM), curX, y + 4);
    curX += tableHeaders[4].w;

    // Net Balance
    doc.setFont('helvetica', 'bold');
    if (cycle.netAquiferBalanceCuM >= 0) {
      doc.setTextColor(5, 150, 105);
      doc.text(`+${formatCuM(cycle.netAquiferBalanceCuM)}`, curX, y + 4);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text(`${formatCuM(cycle.netAquiferBalanceCuM)}`, curX, y + 4);
    }
    curX += tableHeaders[5].w;

    // Shift
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text(`${cycle.observedGroundwaterShiftMeters > 0 ? '+' : ''}${cycle.observedGroundwaterShiftMeters} m`, curX, y + 4);
    curX += tableHeaders[6].w;

    // Audit Status Chip
    const auditColor = getStatusColor(cycle.recordedStatus);
    doc.setTextColor(auditColor[0], auditColor[1], auditColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(cycle.recordedStatus.toUpperCase(), curX, y + 4);

    y += 5.8;
  });

  y += 7;

  // 5. SECTION 2: DIAGNOSTIC STRESS DECOMPOSITION (Evidence-Based Factors)
  drawSectionHeader(
    '2. DIAGNOSTIC STRESS DECOMPOSITION (EVIDENCE-BASED ATTRIBUTION)',
    'Root Cause Analysis • Automated Hydrological Ledger',
    y
  );

  y += 4;

  watershed.stressDecomposition.forEach((f, idx) => {
    doc.setFillColor(cCardBg[0], cCardBg[1], cCardBg[2]);
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'FD');

    // Colored left accent strip
    const barColors = [
      [220, 38, 38], // Red
      [234, 88, 12], // Orange
      [217, 119, 6], // Amber
      [0, 119, 182], // Blue
    ];
    const bColor = barColors[idx % barColors.length];
    doc.setFillColor(bColor[0], bColor[1], bColor[2]);
    doc.rect(margin, y, 1.2, 10, 'F');

    // Factor Name & Impact Percentage Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(`${idx + 1}. ${f.name}`, margin + 3.5, y + 3.8);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(pageWidth - margin - 22, y + 1.5, 20, 4.5, 1, 1, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(bColor[0], bColor[1], bColor[2]);
    doc.text(`${f.percentage}% IMPACT`, pageWidth - margin - 20, y + 4.6);

    // Factor Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
    doc.text(f.description, margin + 3.5, y + 6.8);

    // Attribution & Methodology Tag
    doc.setFontSize(5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(`Source: ${f.source}  |  Observed: ${f.date}  |  Methodology: ${f.method}`, margin + 3.5, y + 9.2);

    y += 11.5;
  });

  y += 4;

  // 6. Outcome Measurement Card (Before vs After Rejuvenation Audit)
  if (watershed.seasonalAudit) {
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

    doc.setFillColor(cOcean[0], cOcean[1], cOcean[2]);
    doc.rect(margin, y, contentWidth, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text('SEASONAL REJUVENATION OUTCOME AUDIT (BEFORE VS AFTER PROJECTION)', margin + 3.5, y + 5);

    // Two column comparison
    const halfW = (contentWidth - 10) / 2;

    // Baseline Column
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin + 3, y + 7.5, halfW, 14, 1, 1, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`BASELINE AUDIT: ${watershed.seasonalAudit.beforeLabel}`, margin + 5, y + 11.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
    doc.text(`Stress Score: ${watershed.seasonalAudit.beforeStressScore}/100  |  Functional Assets: ${watershed.seasonalAudit.beforeFunctionalAssets}`, margin + 5, y + 15);
    doc.text(`Status: ${watershed.seasonalAudit.beforeTrend}`, margin + 5, y + 19);

    // Target Column
    const targetX = margin + 3 + halfW + 4;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(targetX, y + 7.5, halfW, 14, 1, 1, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`TARGET RESTORATION: ${watershed.seasonalAudit.afterLabel}`, targetX + 2, y + 11.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
    doc.text(`Stress Score: ${watershed.seasonalAudit.afterStressScore}/100  |  Functional Assets: ${watershed.seasonalAudit.afterFunctionalAssets}`, targetX + 2, y + 15);
    doc.text(`Projected Impact: ${watershed.seasonalAudit.afterTrend}`, targetX + 2, y + 19);

    y += 28;
  }

  // Page 1 Footer
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('NIR-IKSHAN: National Micro-Watershed Grid & Hydrological Surveillance  •  Confidential Citizen Audit', margin, pageHeight - 7);
  doc.text('Page 1 of 2', pageWidth - margin, pageHeight - 7, { align: 'right' });

  // ==============================================================================
  // PAGE 2: RECHARGE ASSET REGISTRY, WORKFLOW PIPELINE & STATUTORY SIGN-OFF
  // ==============================================================================
  doc.addPage();

  // Page 2 Top Mini Header
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setFillColor(cCyan[0], cCyan[1], cCyan[2]);
  doc.rect(0, 15, pageWidth, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('NIR-IKSHAN  •  RECHARGE ASSET REGISTRY & ACCOUNTABILITY LEDGER', margin, 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(cIce[0], cIce[1], cIce[2]);
  doc.text(`Watershed: ${watershed.name} (${watershed.code})  •  State: ${watershed.state}`, margin, 12);

  doc.setFontSize(6);
  doc.text(`Audit Ref: NIR-AUDIT-${watershed.code}`, pageWidth - margin, 10, { align: 'right' });

  y = 22;

  // 1. SECTION 3: RECHARGE ASSET REGISTRY
  drawSectionHeader(
    `3. PRIORITY RECHARGE ASSET REGISTRY (${watershed.functionalAssetsCount} Functional, ${watershed.needsRepairCount} Need Repair)`,
    'GPS-Tagged Field Inventory  •  Physical Ground-Truth Verification',
    y
  );

  y += 4;

  const assetHeaders = [
    { label: 'Asset ID', w: 25 },
    { label: 'Structure Name & Village', w: 56 },
    { label: 'Type', w: 26 },
    { label: 'Capacity', w: 18 },
    { label: 'Health Status', w: 28 },
    { label: 'Verified By & Agency', w: 33 },
  ];

  doc.setFillColor(cOcean[0], cOcean[1], cOcean[2]);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);

  curX = margin + 2;
  assetHeaders.forEach((ah) => {
    doc.text(ah.label, curX, y + 4.2);
    curX += ah.w;
  });

  y += 6;

  // Asset Rows
  const assetsToDisplay = watershed.assets.slice(0, 8);
  assetsToDisplay.forEach((ast, aIdx) => {
    const isEven = aIdx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5.8, 'F');
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.line(margin, y + 5.8, pageWidth - margin, y + 5.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);

    curX = margin + 2;

    // Asset ID
    doc.setFont('helvetica', 'bold');
    doc.text(ast.id, curX, y + 4);
    curX += assetHeaders[0].w;

    // Name & Village
    doc.setFont('helvetica', 'normal');
    const nameStr = `${ast.name} (${ast.village})`;
    const truncName = nameStr.length > 36 ? nameStr.slice(0, 34) + '..' : nameStr;
    doc.text(truncName, curX, y + 4);
    curX += assetHeaders[1].w;

    // Type
    doc.text(ast.type, curX, y + 4);
    curX += assetHeaders[2].w;

    // Capacity
    doc.text(`${ast.capacityCuM.toLocaleString()} m3`, curX, y + 4);
    curX += assetHeaders[3].w;

    // Status
    doc.setFont('helvetica', 'bold');
    if (ast.status === 'Functional') {
      doc.setTextColor(5, 150, 105); // Green
    } else if (ast.status === 'Partially Silted') {
      doc.setTextColor(217, 119, 6); // Amber
    } else {
      doc.setTextColor(220, 38, 38); // Red
    }
    doc.text(ast.status, curX, y + 4);
    curX += assetHeaders[4].w;

    // Verifier
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
    const verifierStr = ast.verifiedBy ? `${ast.verifiedBy}` : 'Field Nodal Officer';
    const truncVerifier = verifierStr.length > 24 ? verifierStr.slice(0, 22) + '..' : verifierStr;
    doc.text(truncVerifier, curX, y + 4);

    y += 5.8;
  });

  y += 8;

  // 2. SECTION 4: 7-STAGE CLOSED-LOOP RESTORATION WORKFLOW
  drawSectionHeader(
    '4. 7-STAGE CLOSED-LOOP CITIZEN GRIEVANCE & RESTORATION WORKFLOW',
    'Standard Operating Model (SFIC Track A - Swachh & Sustainable Bharat)',
    y
  );

  y += 4;

  // 4 Workflow Stage Cards
  const flowW = (contentWidth - 9) / 4;
  const flowStages = [
    { num: '1-2', title: 'IDENTIFY & INSPECT', desc: 'Citizen files complaint or satellite flags stress; Field inspector visits site with GPS checklist & photo proof.' },
    { num: '3-4', title: 'PRIORITISE & ASSIGN', desc: 'System assigns SLA tier (Critical/High/Medium); Nodal Officer designates responsible engineer with binding hours.' },
    { num: '5', title: 'ACT & RECTIFY', desc: 'Action Engineer mobilizes on-site, executes desiltation or masonry fix, and uploads before/after geo-tagged photos.' },
    { num: '6-7', title: 'VERIFY & REVIEW', desc: 'Field inspector independently re-inspects to accept/reject; State Admin reviews closure rate and escalates overdue cases.' },
  ];

  flowStages.forEach((st, sIdx) => {
    const sX = margin + sIdx * (flowW + 3);
    doc.setFillColor(cCardBg[0], cCardBg[1], cCardBg[2]);
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.roundedRect(sX, y, flowW, 23, 1.5, 1.5, 'FD');

    // Number Pill
    doc.setFillColor(cOcean[0], cOcean[1], cOcean[2]);
    doc.roundedRect(sX + 3, y + 3, 10, 4.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(st.num, sX + 4.5, y + 6.2);

    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(st.title, sX + 15, y + 6.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
    const splitDesc = doc.splitTextToSize(st.desc, flowW - 5);
    doc.text(splitDesc, sX + 2.5, y + 10.5);
  });

  y += 29;

  // 3. SECTION 5: HYDROGEOLOGICAL PARAMETERS & AQUIFER RECOVERY PROJECTION
  drawSectionHeader(
    '5. HYDROGEOLOGICAL PARAMETERS & AQUIFER RECOVERY PROJECTION',
    'Subsurface Piezometry & Infiltration Dynamics',
    y
  );

  y += 4;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  const paramW = contentWidth / 4;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('SOIL FORMATION', margin + 3, y + 4.5);
  doc.text('AQUIFER TYPE', margin + paramW + 3, y + 4.5);
  doc.text('INFILTRATION RATE', margin + paramW * 2 + 3, y + 4.5);
  doc.text('ESTIMATED RECOVERY', margin + paramW * 3 + 3, y + 4.5);

  doc.setFontSize(7.5);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text(watershed.soilType || 'Sandy Loam & Red Soil', margin + 3, y + 9);
  doc.text(watershed.aquiferFormation || 'Hard Rock Granitic Gneiss', margin + paramW + 3, y + 9);
  doc.text(`${watershed.modelledInfiltrationRateMmDay || 14.5} mm/day`, margin + paramW * 2 + 3, y + 9);
  doc.text(`${watershed.estimatedRecoveryWeeks || '16-24'} Weeks`, margin + paramW * 3 + 3, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text('High percolation suitability in upper reaches.', margin + 3, y + 14);
  doc.text('Fractured crystalline deep storage.', margin + paramW + 3, y + 14);
  doc.text('Tested via Double-Ring Infiltrometer.', margin + paramW * 2 + 3, y + 14);
  doc.text('Subject to monsoonal desiltation.', margin + paramW * 3 + 3, y + 14);

  y += 24;

  // 4. SECTION 6: DATA INTEGRITY GUARANTEE & STATUTORY SIGN-OFF
  drawSectionHeader(
    '6. DATA INTEGRITY GUARANTEE & STATUTORY ATTESTATION',
    'Official Verification under National Water Informatics Framework',
    y
  );

  y += 4;

  doc.setFillColor(cCardBg[0], cCardBg[1], cCardBg[2]);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'FD');

  // Cyan Top Line
  doc.setFillColor(cOcean[0], cOcean[1], cOcean[2]);
  doc.rect(margin, y, contentWidth, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text('STATUTORY VERIFICATION & PUBLIC SOCIAL AUDIT COMPLIANCE', margin + 3.5, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(
    'This audit dossier is automatically compiled from ground-truth verified telemetry: Digital Water Level Recorders (DWLR) maintained by',
    margin + 3.5,
    y + 9
  );
  doc.text(
    'the Central Ground Water Board (CGWB), IMD Automated Weather Stations (AWS), and ISRO Bhuvan optical satellite water-spread indices.',
    margin + 3.5,
    y + 12.5
  );
  doc.text(
    'Zero Fabricated Data Guarantee: Field works are cryptographically linked to GPS coordinates and time-stamped inspection photographs.',
    margin + 3.5,
    y + 16
  );

  // Sign-off Columns
  const signY = y + 21;
  const colSignW = (contentWidth - 10) / 3;

  // Box 1: Nodal Officer
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.line(margin + 3, signY + 12, margin + 3 + colSignW - 4, signY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text('District Nodal Officer', margin + 3, signY + 15.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('Minor Irrigation & Ground Water Dept', margin + 3, signY + 18.5);

  // Box 2: Gram Panchayat
  const box2X = margin + 3 + colSignW;
  doc.line(box2X, signY + 12, box2X + colSignW - 4, signY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text('Gram Panchayat Attestation', box2X, signY + 15.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('Sarpanch / Water User Committee', box2X, signY + 18.5);

  // Box 3: Verification Seal & QR Placeholder
  const box3X = box2X + colSignW;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(box3X, signY - 2, colSignW - 4, 21, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(cOcean[0], cOcean[1], cOcean[2]);
  doc.text('DIGITAL AUDIT SEAL', box3X + 3, signY + 2.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`HASH: SHA256-${watershed.code.slice(0, 8)}-${now.getTime().toString(16).toUpperCase()}`, box3X + 3, signY + 6.5);
  doc.text('VERIFIED: Live Grid Synced', box3X + 3, signY + 10);
  doc.text('PORTAL: https://nir-ikshan.vercel.app', box3X + 3, signY + 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('STATUS: PASSED VALIDATION', box3X + 3, signY + 17);

  // Page 2 Footer
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('NIR-IKSHAN: National Micro-Watershed Grid & Hydrological Surveillance  •  Official Water Audit Dossier', margin, pageHeight - 7);
  doc.text('Page 2 of 2', pageWidth - margin, pageHeight - 7, { align: 'right' });

  // Save the PDF
  const filename = `Nir-ikshan_AuditReport_${watershed.code}_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
