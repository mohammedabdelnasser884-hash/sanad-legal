import React from 'react';
import { formatArNumber } from '../../../shared/ui/arabicLocale';
import { COUNTRY_CONFIGS } from '../../../constants';
import type { MonthlyTrendPoint } from './hooks/useAdminStats';

interface UserStats {
  total: number;
  active: number;
  admins: number;
  portalEnabled: number;
}

interface StatsSectionProps {
  casesTotal: number;
  clientsTotal: number;
  userStats: UserStats;
  grandTotal: number;
  grandPaid: number;
  grandRemaining: number;
  collectedRate: number;
  loadingFeesStats: boolean;
  country: string;
  monthlyTrend: MonthlyTrendPoint[];
}

const fmt = (n: number) => formatArNumber(n, { maximumFractionDigits: 0 });

// بطاقة "هيرو" كبيرة (عدد القضايا / عدد الموكلين) — رقم ضخم في المنتصف
// وأيقونة خلفية شبحية شفافة، بديل عن مربع الإحصائيات الصغير التقليدي.
function HeroCountCard({
  label, value, icon, accent, glow,
}: { label: string; value: number; icon: React.ReactNode; accent: string; glow: string }) {
  return React.createElement('div', {
    style: {
      background: `linear-gradient(160deg, ${accent}14, ${accent}05)`,
      border: `1px solid ${accent}2e`,
      borderRadius: '18px',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '108px',
    },
  },
    // أيقونة خلفية كبيرة شفافة
    React.createElement('div', {
      style: {
        position: 'absolute', left: '-6px', bottom: '-10px',
        width: '64px', height: '64px', color: accent, opacity: 0.12,
      },
    }, icon),
    // خط علوي متوهج
    React.createElement('div', {
      style: {
        position: 'absolute', top: 0, right: '14px', left: '14px',
        height: '2px', borderRadius: '0 0 4px 4px',
        background: accent, boxShadow: `0 0 10px ${glow}`,
      },
    }),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', color: accent } },
      React.createElement('div', { className: 'w-4 h-4' }, icon),
      React.createElement('p', { className: 'text-[10.5px] font-black tracking-wide' }, label)
    ),
    React.createElement('p', {
      className: 'font-black',
      style: { color: '#f1f5f9', fontSize: '30px', lineHeight: 1, marginTop: '14px', direction: 'ltr', textAlign: 'right' },
    }, fmt(value))
  );
}

// أيقونتان بسيطتان محليتان (ميزان للقضايا، مجموعة أشخاص للموكلين) —
// بديل مصغّر يكفي هنا بدل استيراد ملف الأيقونات الرئيسي بالكامل.
const CasesGlyph = () => React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' },
  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 3v18M5 7l-2.5 5A3 3 0 0 0 5 15a3 3 0 0 0 2.5-3L5 7Zm14 0l-2.5 5A3 3 0 0 0 19 15a3 3 0 0 0 2.5-3L19 7ZM5 7h14M9 21h6' }));
const ClientsGlyph = () => React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' },
  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' }));

// رسم بياني بسيط (أعمدة مزدوجة) لمقارنة "المستحق" بـ"المحصّل" شهريًا آخر
// 6 شهور — SVG يدوي بنفس نمط باقي الملف، من غير أي مكتبة رسم بياني خارجية.
const TREND_VB_W = 300, TREND_VB_H = 112, TREND_PLOT_H = 74, TREND_PLOT_TOP = 8;

function TrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  const maxVal = Math.max(1, ...data.flatMap((d) => [d.total, d.paid]));
  const hasAnyData = data.some((d) => d.total > 0 || d.paid > 0);
  const groupW = TREND_VB_W / data.length;
  const barGap = 3;
  const barW = (groupW - barGap * 3) / 2;

  const bars = data.flatMap((m, i) => {
    const x0 = i * groupW + barGap;
    const totalH = (m.total / maxVal) * TREND_PLOT_H;
    const paidH  = (m.paid  / maxVal) * TREND_PLOT_H;
    return [
      React.createElement('rect', {
        key: `t-${m.key}`, x: x0, y: TREND_PLOT_TOP + (TREND_PLOT_H - totalH),
        width: barW, height: Math.max(totalH, 0.5), rx: 2,
        fill: 'rgba(148,163,184,0.35)',
      }),
      React.createElement('rect', {
        key: `p-${m.key}`, x: x0 + barW + barGap, y: TREND_PLOT_TOP + (TREND_PLOT_H - paidH),
        width: barW, height: Math.max(paidH, 0.5), rx: 2,
        fill: '#C9A84C',
      }),
      React.createElement('text', {
        key: `l-${m.key}`, x: x0 + barW + barGap / 2, y: TREND_PLOT_TOP + TREND_PLOT_H + 14,
        fontSize: '7.5', fill: '#64748b', fontWeight: 700, textAnchor: 'middle',
      }, m.label),
    ];
  });

  return React.createElement('div', { style: { marginTop: '14px' } },
    // ── Legend ──
    React.createElement('div', { className: 'flex items-center gap-3 mb-2' },
      React.createElement('div', { className: 'flex items-center gap-1' },
        React.createElement('span', { style: { width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(148,163,184,0.35)', display: 'inline-block' } }),
        React.createElement('span', { className: 'text-[9px] font-bold text-slate-500' }, 'مستحق')
      ),
      React.createElement('div', { className: 'flex items-center gap-1' },
        React.createElement('span', { style: { width: '8px', height: '8px', borderRadius: '2px', background: '#C9A84C', display: 'inline-block' } }),
        React.createElement('span', { className: 'text-[9px] font-bold', style: { color: '#C9A84C' } }, 'محصّل')
      )
    ),
    hasAnyData
      ? React.createElement('svg', { viewBox: `0 0 ${TREND_VB_W} ${TREND_VB_H}`, style: { width: '100%', height: '108px' } }, ...bars)
      : React.createElement('p', { className: 'text-[10px] font-bold text-slate-600 text-center py-6' }, 'لا توجد بيانات كافية آخر 6 شهور')
  );
}

function StatsSection({
  casesTotal, clientsTotal, userStats, grandTotal, grandPaid, grandRemaining, collectedRate, loadingFeesStats, country, monthlyTrend,
}: StatsSectionProps) {
  const currency = COUNTRY_CONFIGS[country || 'EG']?.currency || 'جنيه مصري';

  return React.createElement('div', { className: 'space-y-4' },

    // ── القضايا + الموكلين — بطاقتا هيرو جنب بعض ──
    React.createElement('div', { className: 'grid grid-cols-2 gap-2.5' },
      React.createElement(HeroCountCard, {
        label: 'عدد القضايا', value: casesTotal,
        icon: React.createElement(CasesGlyph), accent: '#60a5fa', glow: 'rgba(96,165,250,0.6)',
      }),
      React.createElement(HeroCountCard, {
        label: 'عدد الموكلين', value: clientsTotal,
        icon: React.createElement(ClientsGlyph), accent: '#a78bfa', glow: 'rgba(167,139,250,0.6)',
      })
    ),

    // ── بطاقة الأتعاب — عريضة، برسم شريط تحصيل ──
    React.createElement('div', {
      'data-testid': 'admin-stats-fees-card',
      style: {
        background: 'linear-gradient(160deg, rgba(201,168,76,0.10), rgba(201,168,76,0.02))',
        border: '1px solid rgba(201,168,76,0.22)',
        borderRadius: '18px', padding: '16px', position: 'relative', overflow: 'hidden',
      },
    },
      React.createElement('div', {
        style: {
          position: 'absolute', top: 0, right: '14px', left: '14px',
          height: '2px', borderRadius: '0 0 4px 4px',
          background: '#C9A84C', boxShadow: '0 0 10px rgba(201,168,76,0.6)',
        },
      }),
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('p', { className: 'text-[10.5px] font-black tracking-wide', style: { color: '#C9A84C' } }, 'إجمالي الأتعاب'),
        loadingFeesStats && React.createElement('span', { className: 'text-[9.5px] text-slate-500 font-medium' }, 'بيتحدّث...')
      ),
      React.createElement('p', {
        className: 'font-black', style: { color: '#f1f5f9', fontSize: '28px', lineHeight: 1, marginTop: '8px', direction: 'ltr', textAlign: 'right' },
      }, `${fmt(grandTotal)} ${currency}`),

      // شريط التحصيل
      React.createElement('div', { style: { marginTop: '14px' } },
        React.createElement('div', {
          style: { height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' },
        },
          React.createElement('div', {
            style: {
              height: '100%', width: `${Math.min(100, Math.max(0, collectedRate))}%`,
              background: 'linear-gradient(90deg,#4ade80,#22c55e)',
              boxShadow: '0 0 8px rgba(74,222,128,0.6)',
              borderRadius: '999px', transition: 'width 0.4s ease',
            },
          })
        ),
        React.createElement('div', { className: 'flex items-center justify-between mt-1.5' },
          React.createElement('span', { className: 'text-[9.5px] font-bold', style: { color: '#4ade80' } }, `نسبة التحصيل ${collectedRate}%`)
        )
      ),

      // محصّل / متبقي
      React.createElement('div', { className: 'grid grid-cols-2 gap-2 mt-3' },
        React.createElement('div', {
          style: { background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '13px', padding: '10px 6px 9px', textAlign: 'center' },
        },
          React.createElement('p', { className: 'text-[9px] font-bold text-slate-500' }, 'محصّل'),
          React.createElement('p', { className: 'font-black mt-0.5', style: { color: '#4ade80', fontSize: '14px', direction: 'ltr' } }, fmt(grandPaid))
        ),
        React.createElement('div', {
          style: { background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)', borderRadius: '13px', padding: '10px 6px 9px', textAlign: 'center' },
        },
          React.createElement('p', { className: 'text-[9px] font-bold text-slate-500' }, 'متبقي'),
          React.createElement('p', { className: 'font-black mt-0.5', style: { color: '#fb7185', fontSize: '14px', direction: 'ltr' } }, fmt(grandRemaining))
        )
      ),

      // اتجاه التحصيل آخر 6 شهور
      React.createElement(TrendChart, { data: monthlyTrend })
    ),

    // ── إحصائيات المستخدمين (منقولة من الشاشة الرئيسية) ──
    React.createElement('div', { className: 'space-y-2' },
      React.createElement('p', { className: 'text-[9px] font-black text-slate-600 tracking-widest px-1' }, 'إحصائيات المستخدمين'),
      React.createElement('div', { className: 'grid grid-cols-4 gap-2' },
        ([
          { label: 'الإجمالي', value: userStats.total,         icon: '👥', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)', numColor: '#e2e8f0', glowColor: 'rgba(255,255,255,0.2)' },
          { label: 'نشط',      value: userStats.active,        icon: '⚡', bg: 'rgba(74,222,128,0.06)',  border: 'rgba(74,222,128,0.15)',  numColor: '#4ade80', glowColor: 'rgba(74,222,128,0.6)' },
          { label: 'مديرون',   value: userStats.admins,        icon: '🛡', bg: 'rgba(96,165,250,0.06)',  border: 'rgba(96,165,250,0.15)',  numColor: '#60a5fa', glowColor: 'rgba(96,165,250,0.6)' },
          { label: 'بوابات',   value: userStats.portalEnabled, icon: '🔑', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.15)',  numColor: '#fbbf24', glowColor: 'rgba(245,158,11,0.6)' },
        ]).map((s) => React.createElement('div', {
          key: s.label,
          style: {
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: '13px', padding: '10px 6px 9px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          },
        },
          React.createElement('div', {
            style: {
              position: 'absolute', top: 0, left: '20%', right: '20%',
              height: '1.5px', borderRadius: '0 0 3px 3px',
              background: s.numColor, boxShadow: `0 0 6px ${s.glowColor}`,
            },
          }),
          React.createElement('p', { className: 'text-sm mb-0.5' }, s.icon),
          React.createElement('p', { className: 'font-black', style: { color: s.numColor, fontSize: '15px' } }, String(s.value)),
          React.createElement('p', { className: 'text-[8.5px] font-bold text-slate-500 mt-0.5' }, s.label)
        ))
      )
    )
  );
}

export default StatsSection;
