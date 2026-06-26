import { useState, useCallback } from 'react';

export function useAdminActivity(db: any) {
  const ACTIVITY_PAGE_SIZE = 30;
  const [activityLog, setActivityLog] = useState([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityPage, setActivityPage] = useState(0);
  const [activityFilters, setActivityFilters] = useState({
    user_id: '', action: '', from: '', to: ''
  });

  const fetchActivity = useCallback(async (filters = activityFilters, page = activityPage) => {
    setLoadingActivity(true);
    try {
      let q = db.from('activity_log').select('*', { count: 'exact' });

      // فلتر المستخدم
      // بحث حر — Supabase ilike على حقول النص
      if (filters.search) {
        const s = '%' + filters.search + '%';
        q = q.or(`action.ilike.${s},details.ilike.${s},client_name.ilike.${s},case_name.ilike.${s},case_type.ilike.${s},user_name.ilike.${s}`);
      }

      const from = page * ACTIVITY_PAGE_SIZE;
      q = q.order('created_at', { ascending: false })
           .range(from, from + ACTIVITY_PAGE_SIZE - 1);

      const { data, count } = await q;
      if (data) setActivityLog(data);
      if (count !== null) setActivityTotal(count);
    } catch(e) { /* جدول غير موجود بعد */ }
    setLoadingActivity(false);
  }, [db, activityFilters, activityPage]);

  return {
    activityLog, activityTotal, loadingActivity,
    activityPage, setActivityPage,
    activityFilters, setActivityFilters,
    ACTIVITY_PAGE_SIZE,
    fetchActivity
  };
}
