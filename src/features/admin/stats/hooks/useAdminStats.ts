import { useState, useCallback, useEffect } from 'react';
import { db } from '../../../../supabaseClient';
import { createFetchGuard } from '../../../../shared/lib/offlineGuard';
import { recordError, recordSuccess } from '../../../../systemHealth';
import { toast } from '../../../../shared/lib/notifications';
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
        } catch (err) {
            const msg = guard.didTimeOut() ? 'timeout' : (err as { message?: string })?.message || 'fetch failed';
            recordError('db_admin_stats', msg);
            const cached = loadCache<{ total: number; paid: number }>(ADMIN_STATS_SUMMARY_CACHE_KEY, profile.tenant_id);
            if (cached) { setGrandTotal(cached.total); setGrandPaid(cached.paid); }
        } finally {
            guard.cleanup();
            setLoadingFeesStats(false);
        }
    }, [profile]);

    return { grandTotal, grandPaid, grandRemaining, collectedRate, loadingFeesStats, fetchStatsSummary };
}
