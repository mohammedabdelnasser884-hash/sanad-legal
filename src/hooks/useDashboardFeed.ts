import React, { useState, useEffect, useCallback } from 'react';
import { db, SUPA_URL, SUPA_KEY } from '../supabaseClient';

export function useDashboardFeed(profile: any) {
    const [todaySessions, setTodaySessions] = useState([]);       // جلسات اليوم فقط
    const [upcomingSessions, setUpcomingSessions] = useState([]); // بكره + 6 أيام
    const [missedSessions, setMissedSessions] = useState([]);     // فائتة بدون تحديث
    const [loadingUrgent, setLoadingUrgent] = useState(false);

    // ── المهام (reminders) ──
    const [upcomingTasks, setUpcomingTasks]   = useState([]); // due_date >= اليوم، غير منجزة
    const [missedTasks,   setMissedTasks]     = useState([]); // due_date < اليوم، غير منجزة
    const [upcomingTasksOpen, setUpcomingTasksOpen] = useState(false); // مقفول افتراضياً
    const [todayOpen,         setTodayOpen]         = useState(true);
    const [upcomingOpen,      setUpcomingOpen]      = useState(true);

    const [dbOnline, setDbOnline] = useState(null); // null=checking, true=online, false=offline
    const [casesFilter, setCasesFilter] = useState('نشطة');
    // ── Pagination حقيقي للقضايا ──
    const PAGE_SIZE = 15;
    const [casesPage,  setCasesPage]   = useState(0); // 0-based
    const [casesTotal, setCasesTotal]  = useState(0);
    const [casesLoading, setCasesLoading] = useState(false);
    // ── Pagination حقيقي للموكلين ──
    const [clientsPage,  setClientsPage]  = useState(0);
    const [clientsTotal, setClientsTotal] = useState(0);
    const [clientsLoading, setClientsLoading] = useState(false);

    // ─ فحص حالة الاتصال بـ Supabase (فحص حقيقي بدون تضليل من كاش الـ Service Worker) ─
    useEffect(()=>{
        if(!profile) return;

        const check = async () => {
            // لو الجهاز نفسه مقطوع عن الشبكة، اتأكد فورًا بلا طلب شبكة
            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                setDbOnline(false);
                return;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 8000);
            try {
                const { data: sessionData } = await db.auth.getSession();
                const token = sessionData?.session?.access_token || SUPA_KEY;
                const res = await fetch(`${SUPA_URL}/rest/v1/profiles?select=id&limit=1`, {
                    method: 'GET',
                    cache: 'no-store',
                    signal: controller.signal,
                    headers: {
                        apikey: SUPA_KEY,
                        Authorization: `Bearer ${token}`,
                        'X-Health-Check': '1', // يخلي الـ Service Worker يتجاهل الكاش ويطلب الشبكة فعليًا
                    },
                });
                setDbOnline(res.ok);
            } catch {
                setDbOnline(false);
            } finally {
                clearTimeout(timeoutId);
            }
        };

        check();
        const interval = setInterval(check, 30000);
        // تحديث فوري لحظة ما الجهاز يفصل/يرجع للنت، من غير انتظار الـ 30 ثانية
        const handleOnline  = () => check();
        const handleOffline = () => setDbOnline(false);
        window.addEventListener('online',  handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online',  handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    },[profile]);

    // ─ helper: date formatter ─
    const fmtDate = (d: Date) => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    // تنسيق رقم القيد: "1542/2026" → "1542 لسنة 2026"
    const fmtCaseNum = (num: string) => {
        if(!num || num === '—') return num;
        const parts = num.split('/');
        return parts.length === 2 ? `${parts[0]} لسنة ${parts[1]}` : num;
    };

    // ─ جلب جلسات اليوم ─
    const fetchTodaySessions = useCallback(async () => {
        if(!profile) return;
        setLoadingUrgent(true);
        const todayStr = fmtDate(new Date());
        const { data } = await db.from('case_sessions')
            .select('id, session_date, session_time, session_floor, session_hall, description, case_id, result, next_action')
            .eq('session_date', todayStr)
            .order('session_date', { ascending: true });
        setTodaySessions(data || []);
        setLoadingUrgent(false);
    }, [profile]);

    // ─ جلب جلسات الأسبوع القادم (بكره + 6 أيام) ─
    const fetchUpcomingSessions = useCallback(async () => {
        if(!profile) return;
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
        const endDay = new Date(today); endDay.setDate(today.getDate()+7);
        const { data } = await db.from('case_sessions')
            .select('id, session_date, session_time, session_floor, session_hall, description, case_id, result, next_action')
            .gte('session_date', fmtDate(tomorrow))
            .lte('session_date', fmtDate(endDay))
            .order('session_date', { ascending: true });
        setUpcomingSessions(data || []);
    }, [profile]);

    // ─ جلب الجلسات الفائتة ─
    // جلسة فائتة = تاريخها قبل اليوم + هي آخر جلسة في قضيتها (مافيش جلسة جديدة بعدها)
    const fetchMissedSessions = useCallback(async () => {
        if(!profile) return;
        const todayStr = fmtDate(new Date());
        // نجيب كل الجلسات اللي قبل اليوم
        const { data: pastData } = await db.from('case_sessions')
            .select('id, session_date, description, case_id, result, next_action')
            .lt('session_date', todayStr)
            .order('session_date', { ascending: false })
            .limit(200);
        // نجيب كل الجلسات اللي >= اليوم عشان نعرف القضايا اللي عندها جلسة جديدة
        const { data: futureData } = await db.from('case_sessions')
            .select('case_id')
            .gte('session_date', todayStr);
        const caseIdsWithFuture = new Set((futureData||[]).map(s => s.case_id));
        // الفائتة = جلسة ماضية في قضية مافيهاش أي جلسة قادمة أو حالية
        const missed = (pastData || []).filter(s =>
            !caseIdsWithFuture.has(s.case_id)
        );
        // خلي جلسة واحدة بس لكل قضية (الأحدث)
        const seenCases = new Set();
        const uniqueMissed = missed.filter(s => {
            if(seenCases.has(s.case_id)) return false;
            seenCases.add(s.case_id);
            return true;
        });
        setMissedSessions(uniqueMissed);
    }, [profile]);

    // ─ جلب المهام ─
    const fetchTasks = useCallback(async () => {
        if(!profile) return;
        const todayStr = fmtDate(new Date());
        const { data } = await db.from('reminders').select('id,title,due_date,notes,done').eq('done',false).order('due_date',{ascending:true});
        const all = data || [];
        setUpcomingTasks(all.filter(r => r.due_date >= todayStr));
        setMissedTasks(all.filter(r => r.due_date < todayStr));
    }, [profile]);


  return {
    todaySessions, setTodaySessions,
    upcomingSessions, setUpcomingSessions,
    missedSessions, setMissedSessions,
    upcomingTasks, setUpcomingTasks,
    missedTasks, setMissedTasks,
    loadingUrgent,
    upcomingTasksOpen, setUpcomingTasksOpen,
    todayOpen, setTodayOpen,
    upcomingOpen, setUpcomingOpen,
    fetchTodaySessions, fetchUpcomingSessions, fetchMissedSessions, fetchTasks
  };
}
