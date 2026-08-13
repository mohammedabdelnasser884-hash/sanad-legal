import { useState, useCallback, useEffect } from 'react';
import { db } from '../../../../supabaseClient';
import { createFetchGuard } from '../../../../shared/lib/offlineGuard';
import { recordError, recordSuccess } from '../../../../systemHealth';
import { toast } from '../../../../shared/lib/notifications';
import { MONTHS_AR } from '../../../../shared/ui/arabicLocale';
import type { ProfileRow } from '../../../../types';

// ─────────────────────────────────────────────────────────
//  useAdminStats — قسم "الإحصائيات" في لوحة الإدارة (13 أغسطس 2026).
//
//  عدد القضايا/الموكلين بييجوا جاهزين من App.tsx (casesTotal/clientsTotal —
//  نفس الأرقام المعروضة فوق تابات القضايا/الموكلين، مفيش داعي نكررهم هنا).
//  الملخص المالي (إجمالي/محصّل) مختلف: محتاج مجموع كل صفوف case_fees في
//  القاعدة (مش بس الصفحة المحمّلة)، فمنطقه منسوخ عمدًا من
//  fetchGrandSummary في useFeesActions.ts (نفس الاستعلام ونفس نمط
//  offline guard) — بدل ما نجيب useFeesActions كامل (هوك تقيل مربوط
//  بمنطق إضافة/تعديل/حذف الأتعاب بالكامل) لمجرد رقمين هنا.
// ─────────────────────────────────────────────────────────
const ADMIN_STATS_SUMMARY_CACHE_KEY = 'sanad_cached_admin_stats_summary_v1';
const ADMIN_STATS_TREND_CACHE_KEY   = 'sanad_cached_admin_stats_trend_v1';
const TREND_MONTHS = 6;

export interface MonthlyTrendPoint {
    key: string;   // 'YYYY-MM' — للمقارنة/الفرز فقط
    label: string; // 'أغسطس' — للعرض
    total: number; // إجمالي الأتعاب المستحقة (case_fees.total_fees) اللي اتسجلت الشهر ده
    paid: number;  // إجمالي المحصّل فعليًا (fee_payments.amount) الشهر ده
}

// بيبني هيكل الـ6 شهور فاضي (بالترتيب من الأقدم للأحدث) عشان الشهور اللي
// مفيهاش أي بيانات تظهر في الرسم بقيمة صفر بدل ما تختفي تمامًا.
function buildEmptyMonths(count: number): MonthlyTrendPoint[] {
    const out: MonthlyTrendPoint[] = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        out.push({ key, label: MONTHS_AR[d.getMonth()], total: 0, paid: 0 });
    }
    return out;
}

function saveCache<T>(key: string, tenantId: string | null | undefined, data: T) {
    try { localStorage.setItem(key, JSON.stringify({ tenantId: tenantId ?? null, data })); } catch { /* localStorage غير متاح — تجاهل */ }
}
function loadCache<T>(key: string, tenantId: string | null | undefined): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { tenantId: string | null; data: T };
        if (parsed.tenantId !== (tenantId ?? null)) return null;
        return parsed.data;
    } catch { return null; }
}

export function useAdminStats(profile: ProfileRow | null) {
    const [grandTotal, setGrandTotal]         = useState(0);
    const [grandPaid, setGrandPaid]           = useState(0);
    const [loadingFeesStats, setLoadingFeesStats] = useState(false);
    const [monthlyTrend, setMonthlyTrend]     = useState<MonthlyTrendPoint[]>(() => buildEmptyMonths(TREND_MONTHS));

    const grandRemaining = grandTotal - grandPaid;
    const collectedRate  = grandTotal > 0 ? Math.round((grandPaid / grandTotal) * 100) : 0;

    const fetchStatsSummary = useCallback(async () => {
        if (!profile) return;
        setLoadingFeesStats(true);
        const guard = createFetchGuard();
        if (guard.offline) {
            recordError('db_admin_stats', 'offline');
            const cached = loadCache<{ total: number; paid: number }>(ADMIN_STATS_SUMMARY_CACHE_KEY, profile.tenant_id);
            if (cached) { setGrandTotal(cached.total); setGrandPaid(cached.paid); toast('أنت أوف لاين — بتشوف آخر نسخة محفوظة من إحصائيات الأتعاب'); }
            setLoadingFeesStats(false);
            return;
        }
        try {
            const { data, error } = await db.from('case_fees').select('total_fees,paid_fees').is('deleted_at', null).abortSignal(guard.controller.signal);
            if (error) throw error;
            const t = (data || []).reduce((s: number, f: { total_fees: number | null }) => s + (f.total_fees || 0), 0);
            const p = (data || []).reduce((s: number, f: { paid_fees: number | null }) => s + (f.paid_fees  || 0), 0);
            setGrandTotal(t);
            setGrandPaid(p);
            saveCache(ADMIN_STATS_SUMMARY_CACHE_KEY, profile.tenant_id, { total: t, paid: p });
            recordSuccess('db_admin_stats');

            // ── الرسم البياني: مستحق/محصّل شهريًا آخر 6 شهور ──
            // total: مجموع case_fees.total_fees حسب شهر created_at (شهر تسجيل
            // سجل الأتعاب). paid: مجموع fee_payments.amount حسب شهر الدفعة
            // الفعلية (payment_date) — من جدول الدفعات نفسه (مش paid_fees
            // التراكمي في case_fees) عشان نعرف الشهر ده بالذات اتحصّل فيه قد إيه.
            const months = buildEmptyMonths(TREND_MONTHS);
            const sinceDate = new Date(); sinceDate.setDate(1); sinceDate.setMonth(sinceDate.getMonth() - (TREND_MONTHS - 1));
            const sinceISO = sinceDate.toISOString().slice(0, 10);
            const monthKeyOf = (iso: string) => iso.slice(0, 7);

            const [feesRes, paymentsRes] = await Promise.all([
                db.from('case_fees').select('total_fees,created_at').is('deleted_at', null).gte('created_at', sinceISO).abortSignal(guard.controller.signal),
                db.from('fee_payments').select('amount,payment_date').gte('payment_date', sinceISO).abortSignal(guard.controller.signal),
            ]);
            if (feesRes.error) throw feesRes.error;
            if (paymentsRes.error) throw paymentsRes.error;

            const byKey = new Map(months.map((m) => [m.key, m]));
            for (const f of (feesRes.data || []) as { total_fees: number | null; created_at: string | null }[]) {
                if (!f.created_at) continue;
                const bucket = byKey.get(monthKeyOf(f.created_at));
                if (bucket) bucket.total += f.total_fees || 0;
            }
            for (const p2 of (paymentsRes.data || []) as { amount: number | null; payment_date: string | null }[]) {
                if (!p2.payment_date) continue;
                const bucket = byKey.get(monthKeyOf(p2.payment_date));
                if (bucket) bucket.paid += p2.amount || 0;
            }
            setMonthlyTrend(months);
            saveCache(ADMIN_STATS_TREND_CACHE_KEY, profile.tenant_id, months);
        } catch (err) {
            const msg = guard.didTimeOut() ? 'timeout' : (err as { message?: string })?.message || 'fetch failed';
            recordError('db_admin_stats', msg);
            const cached = loadCache<{ total: number; paid: number }>(ADMIN_STATS_SUMMARY_CACHE_KEY, profile.tenant_id);
            if (cached) { setGrandTotal(cached.total); setGrandPaid(cached.paid); }
            const cachedTrend = loadCache<MonthlyTrendPoint[]>(ADMIN_STATS_TREND_CACHE_KEY, profile.tenant_id);
            if (cachedTrend) setMonthlyTrend(cachedTrend);
        } finally {
            guard.cleanup();
            setLoadingFeesStats(false);
        }
    }, [profile]);

    return { grandTotal, grandPaid, grandRemaining, collectedRate, loadingFeesStats, monthlyTrend, fetchStatsSummary };
}
