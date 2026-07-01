import { toast, escapeTelegramHtml, logActivity } from '../utils';
import { db } from '../supabaseClient';

export function useCaseActions(params: {
    sendTelegram: any;
    fetchCases: any;
    cases: any[];
    lawyers: any[];
    clients: any[];
    selectedCase: any;
    setCases: any;
    setLawyers: any;
    setClients: any;
    setProfile: any;
    setAuthUser: any;
    setSelectedCase: any;
    setDeleteConfirm: any;
    setSavingCase: any;
    setShowCaseModal: any;
    casesFilter: any;
    nav: any;
    profile?: any;
}) {
    const {
        sendTelegram, fetchCases, cases, clients, selectedCase,
        setCases, setLawyers, setClients, setProfile, setAuthUser,
        setSelectedCase, setDeleteConfirm, setSavingCase, setShowCaseModal,
        casesFilter, nav, profile,
    } = params;
    const _userName = profile?.full_name || null;

    // ─ تسجيل خروج ─
    const handleLogout = async () => {
        // نسجّل الخروج قبل signOut عشان الـ session لسه شغّالة
        logActivity(db, 'تسجيل خروج', { userName: _userName, entity_type: 'user', details: profile?.email || null });
        await db.auth.signOut();
        setCases([]); setLawyers([]); setClients([]); setProfile(null); setAuthUser(null);
    };

    // ─ حفظ قضية ─
    const handleSaveCase = async (form: any) => {
        setSavingCase(true);
        const payload = {
            case_number_official: form.number || null,
            title: form.title,
            court_name: form.court,
            case_type: form.type,
            status: 'نشطة',
            client_id: form.client_id || null,
            plaintiff: form.plaintiff || null,
            defendant: form.defendant || null,
            court_level: form.court_level || null,
            circuit_number: form.circuit_number || null,
            next_hearing: form.date || null,
            session_hall: form.session_hall || null,
            secretary_hall: form.secretary_hall || null,
            secretary_name: form.secretary_name || null,
        };
        const offlineId = 'offline-' + Date.now();
        const { error, offline, queued, data: insertedCase } = await window.__dbWrite({
            type: 'INSERT', table: 'cases', data: payload, returning: true
        });
        if (offline && queued) {
            // BUG-20 FIX: لو فيه تاريخ جلسة، نحفظها في الـ queue مع _offlineCaseTitle
            // عشان الـ sync handler يقدر يربطها بالـ id الحقيقي بعد ما القضية تتزامن
            if (form.date) {
                await window.__dbWrite({
                    type: 'INSERT',
                    table: 'case_sessions',
                    data: {
                        _offlineCaseTitle: form.title,   // الـ sync handler هيستخدمه
                        case_id: null,                   // هيتملى وقت المزامنة
                        session_date: form.date,
                        session_time: form.session_time || 'صباحي',
                        session_floor: form.court_floor || null,
                        session_hall: form.court_hall || null,
                        description: 'الجلسة الأولى',
                        result: null,
                        next_action: null,
                    },
                });
            }
            toast('📥 محفوظة محلياً — ستُضاف فور عودة الإنترنت');
            setCases((prev: any[]) => [{ ...payload, id: offlineId, ...form, status: 'نشطة', date: form.date || '—' }, ...prev]);
        } else if (error) {
            toast('❌ فشل تسجيل القضية الجديدة — تحقق من الاتصال وأعد المحاولة', true);
            setSavingCase(false);
            return;
        } else {
            // ── تسجيل الجلسة الأولى في case_sessions لو فيه تاريخ ──
            // بناخد id القضية مباشرة من نتيجة الإدراج (بدل التخمين
            // بإعادة استعلام بالعنوان — كان بيسبب ربط غلط لو فيه قضيتين
            // بنفس العنوان اتسجلوا في نفس اللحظة تقريبًا)
            const newCaseId: string | null = insertedCase?.id || null;
            if (form.date && newCaseId) {
                await db.from('case_sessions').insert([{
                    case_id: newCaseId,
                    session_date: form.date,
                    session_time: form.session_time || 'صباحي',
                    session_floor: form.court_floor || null,
                    session_hall: form.court_hall || null,
                    description: 'الجلسة الأولى',
                    result: null,
                    next_action: null,
                }]);
            } else if (form.date && !newCaseId) {
                // حالة نادرة: القضية اتسجلت بنجاح لكن السيرفر معادش الصف
                // المُدرج (مثلاً سياسة RLS بتمنع SELECT بعد INSERT) — القضية
                // موجودة فعليًا، بس الجلسة الأولى محتاجة تتضاف يدويًا.
                toast('⚠️ القضية اتسجلت، بس الجلسة الأولى محتاجة تتضاف يدويًا من صفحة القضية', true);
            }
            toast('✅ تم تقييد الدعوى في السيرفر السحابي!');
            // إشعار تليجرام
            const caseNumLabel = form.caseNum && form.caseYear
                ? `${form.caseNum} لسنة ${form.caseYear}`
                : (form.number || '—');
            logActivity(db, 'إضافة قضية', {
                userName: _userName,
                entity_type: 'case', entity_id: newCaseId,
                details: `${form.title} — رقم القيد: ${caseNumLabel}`,
                case_name: form.title || null,
                case_type: form.type || null,
                client_name: clients.find((cl: any) => cl.id === form.client_id)?.full_name || null,
            });
            let caseMsg = `⚖️ <b>قضية جديدة تم تقييدها</b>\n`;
            caseMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
            caseMsg += `📋 <b>رقم القيد:</b> ${escapeTelegramHtml(caseNumLabel)}\n`;
            caseMsg += `📌 <b>الموضوع:</b> ${escapeTelegramHtml(form.title)}\n`;
            caseMsg += `🏛 <b>المحكمة:</b> ${escapeTelegramHtml(form.court || '—')}\n`;
            caseMsg += `📂 <b>التصنيف:</b> ${escapeTelegramHtml(form.type || '—')}\n`;
            if (form.plaintiff) caseMsg += `🟢 <b>المدعي:</b> ${escapeTelegramHtml(form.plaintiff)}\n`;
            if (form.defendant) caseMsg += `🔴 <b>المدعى عليه:</b> ${escapeTelegramHtml(form.defendant)}\n`;
            if (form.date) caseMsg += `📆 <b>أقرب جلسة:</b> ${escapeTelegramHtml(form.date)}\n`;
            sendTelegram(caseMsg);
            fetchCases(0, casesFilter);
        }
        setSavingCase(false);
        setShowCaseModal(false);
    };

    // ─ حذف قضية — آمن ─
    const handleDeleteCase = async (caseId: any) => {
        const c = cases.find((x: any) => x.id === caseId);
        setDeleteConfirm({
            type: 'case', id: caseId,
            name: c?.title || 'القضية',
            itemType: 'القضية',
            title: 'حذف القضية نهائياً',
            onConfirm: async () => {
                const { error } = await db.from('cases').delete().eq('id', caseId);
                nav.closeModal('delete'); setDeleteConfirm(null);
                if (error) { toast('❌ فشل حذف القضية — تحقق من الاتصال وأعد المحاولة', true); return; }
                toast('🗑 تم حذف القضية نهائياً');
                logActivity(db, 'حذف قضية', {
                    userName: _userName,
                    entity_type: 'case', entity_id: caseId, details: c?.title || null,
                    case_name: c?.title || null,
                    case_type: c?.type || null,
                    client_name: clients.find((cl: any) => cl.id === c?.client_id)?.full_name || null,
                });
                setSelectedCase(null);
                setCases((prev: any[]) => prev.filter((c: any) => c.id !== caseId));
            }
        });
    };

    // ─ تعديل قضية ─
    const handleUpdateCase = async (caseId: any, form: any) => {
        try {
            const payload = {
                case_number_official: form.number || null,
                title: form.title,
                court_name: form.court || null,
                case_type: form.type || null,
                status: form.status || undefined,
                client_id: (form.client_id !== undefined ? form.client_id : cases.find((c: any) => c.id === caseId)?.client_id) || null,
                plaintiff: form.plaintiff || null,
                defendant: form.defendant || null,
                court_level: form.court_level || null,
                circuit_number: form.circuit_number || null,
                next_hearing: form.date || null,
                session_hall: form.session_hall || null,
                secretary_hall: form.secretary_hall || null,
                secretary_name: form.secretary_name || null,
            };
            // FIX: Optimistic Locking لتعديل القضايا — كان `updated_at` بيتجاب
            // ويتخزّن في الـ state (شوف useAppData.ts) خصيصًا للاستخدام هنا، بس
            // مكانش بيتبعت فعليًا لـ __dbWrite، فحماية "تعارض التعديل" كانت
            // معطّلة تمامًا لتعديل القضايا (بعكس الأتعاب/الموكلين/الجلسات).
            const existingCase = cases.find((c: any) => c.id === caseId);
            const knownUpdatedAt = existingCase?.updated_at
                || (selectedCase?.id === caseId ? selectedCase?.updated_at : null)
                || null;

            const { error, offline, queued, conflict, data: writtenRow } = await window.__dbWrite({
                type: 'UPDATE', table: 'cases', data: payload, id: caseId, knownUpdatedAt
            });
            if (offline && queued) {
                toast('📥 التعديل محفوظ محلياً — سيُزامن عند عودة الإنترنت');
                // تحديث فوري في الـ state المحلي
                setCases((prev: any[]) => prev.map((c: any) => c.id === caseId ? { ...c, ...form } : c));
                if (selectedCase?.id === caseId) setSelectedCase((p: any) => ({ ...p, ...form }));
            } else if (conflict) {
                // 💥 حد تاني عدّل نفس القضية بعد ما إحنا فتحناها — منرفضش نكتب
                // فوق تعديله بصمت. بنسيب البيانات المعروضة زي ما هي ونطلب من
                // المستخدم يفتح القضية تاني عشان يشوف آخر نسخة قبل ما يعدّل.
                toast('⚠️ هذه القضية عدّلها شخص آخر بعد ما فتحتها — أعد فتحها وحاول التعديل مرة أخرى', true);
                return;
            } else if (error) {
                toast('❌ فشل تعديل بيانات القضية — تحقق من الاتصال وأعد المحاولة', true);
                return;
            } else {
                // ── تسجيل جلسة جديدة لو تاريخ الجلسة تغيّر ──
                if (form.date) {
                    const oldDate = (selectedCase?.date === '—' ? '' : selectedCase?.date) || '';
                    if (form.date !== oldDate) {
                        const { data: existing } = await db.from('case_sessions')
                            .select('id')
                            .eq('case_id', caseId)
                            .eq('session_date', form.date)
                            .maybeSingle();
                        if (!existing) {
                            await db.from('case_sessions').insert([{
                                case_id: caseId,
                                session_date: form.date,
                                session_time: form.session_time || 'صباحي',
                                session_floor: form.court_floor || null,
                                session_hall: form.court_hall || null,
                                description: 'جلسة محددة',
                                result: null,
                                next_action: null,
                            }]);
                        }
                    }
                }
                toast('✅ تم تحديث القضية');
                logActivity(db, 'تعديل قضية', {
                    userName: _userName,
                    entity_type: 'case', entity_id: caseId, details: form.title || null,
                    case_name: form.title || null,
                    case_type: form.type || cases.find((c: any) => c.id === caseId)?.type || null,
                    client_name: clients.find((cl: any) => cl.id === payload.client_id)?.full_name || null,
                });
                // تحديث فوري للحالة المحلية — عشان الشاشة المفتوحة (CaseDetailView) تعرض القيم الجديدة فورًا
                // ⚠️ بنحدّث updated_at كمان من قيمة السيرفر الفعلية بعد الكتابة (writtenRow) —
                // من غيرها، أي تعديل تاني على نفس القضية بعد التعديل ده مباشرة كان
                // هيتكشف غلط كـ"تعارض" مع نفسه (لأن آخر updated_at محفوظة محليًا
                // كانت هتفضل القديمة من قبل الحفظ، مش الجديدة بعده).
                const freshFields = writtenRow?.updated_at ? { updated_at: writtenRow.updated_at } : {};
                setCases((prev: any[]) => prev.map((c: any) => c.id === caseId ? { ...c, ...form, ...freshFields } : c));
                if (selectedCase?.id === caseId) setSelectedCase((p: any) => ({ ...p, ...form, ...freshFields }));
                // إشعار تليجرام - تعديل قضية
                let updMsg = `✏️ <b>تم تعديل بيانات قضية</b>\n`;
                updMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
                updMsg += `📋 <b>رقم القيد:</b> ${escapeTelegramHtml(form.number || '—')}\n`;
                updMsg += `📌 <b>الموضوع:</b> ${escapeTelegramHtml(form.title)}\n`;
                updMsg += `🏛 <b>المحكمة:</b> ${escapeTelegramHtml(form.court || '—')}\n`;
                if (form.plaintiff) updMsg += `🟢 <b>المدعي:</b> ${escapeTelegramHtml(form.plaintiff)}\n`;
                if (form.defendant) updMsg += `🔴 <b>المدعى عليه:</b> ${escapeTelegramHtml(form.defendant)}\n`;
                if (form.date) updMsg += `📆 <b>الجلسة القادمة:</b> ${escapeTelegramHtml(form.date)}\n`;
                sendTelegram(updMsg);
                fetchCases(0, casesFilter);
            }
        } catch (e) {
            toast('❌ خطأ في الاتصال، تحقق من الإنترنت وأعد المحاولة', true);
        }
    };

    return { handleLogout, handleSaveCase, handleDeleteCase, handleUpdateCase };
}
