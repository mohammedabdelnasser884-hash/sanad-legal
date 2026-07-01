import React from 'react';
import { I } from '../../constants';
import { MONTHS_AR, PartiesLine, exportSessionToGoogleCalendar, downloadICal } from '../shared';
import { toDateStr } from './constants';
import { db } from '../../supabaseClient';

function SessionCard({ s, cases, clients, onOpenCase, onOpenStandalone }: any) {
    // ⚠️ تصحيح جذري: القضية ممكن تكون موجودة فعليًا في قاعدة البيانات ومربوطة
    // صح بـ case_id، لكن غير موجودة في الـ "cases" array المحلي لأن القضايا
    // بتتحمّل بنظام صفحات (PAGE_SIZE = 15 في useAppData.ts) ومفلترة بحالة معينة.
    // الاستعلامات في CalendarTab/MissedTab/UpcomingWidget بترفق بيانات القضية
    // مباشرة مع كل جلسة عن طريق join باسم cases(...) — وهي مصدر موثوق ودايمًا
    // محدّث بغض النظر عن أي pagination. لازم نستخدمها كأولوية أولى قبل أي حاجة
    // تانية، وبعدها نرجع للـ array المحلي (احتياطي)، وأخيرًا الحقول الخام
    // المخزنة على صف الجلسة نفسه (وهي الحالة الصحيحة فعلاً للجلسات المستقلة).
    const joinedCase = Array.isArray(s.cases) ? s.cases[0] : s.cases;
    const caseForNav = cases.find((c: any) => c.id === s.case_id); // الكائن الكامل، يُستخدم فقط عند الضغط لفتح القضية
    const linkedCase = joinedCase || caseForNav; // للعرض فقط — الأولوية للـ join المرفق مع الجلسة نفسه
    const isStandalone = !s.case_id;
    const plaintiff = linkedCase?.plaintiff || s.plaintiff;
    const defendant = linkedCase?.defendant || s.defendant;
    const caseType  = linkedCase?.type  || linkedCase?.case_type || s.case_type;
    const caseTitle = linkedCase?.title || s.title || s.description;
    const caseNumberRaw = linkedCase?.number || linkedCase?.case_number_official || s.case_number;

    // فصل رقم الدعوى عن السنة (الصيغة المتوقعة: رقم/سنة)
    let caseNum = '', caseYear = '';
    if (caseNumberRaw && caseNumberRaw !== '—') {
        const parts = String(caseNumberRaw).split('/');
        if (parts.length === 2) { caseNum = parts[0]; caseYear = parts[1]; }
        else { caseNum = caseNumberRaw; }
    }

    // السطر الأول: رقم الدعوى لسنة ... - النوع
    let numberLine = '';
    if (caseNum && caseYear) numberLine = `رقم الدعوى ${caseNum} لسنة ${caseYear}`;
    else if (caseNum) numberLine = `رقم الدعوى ${caseNum}`;
    if (caseType) numberLine = numberLine ? `${numberLine} - ${caseType}` : caseType;

    // السطر الثاني: المدعي ضد المدعى عليه (أو نص بديل)
    const partiesFallback = !numberLine ? caseTitle : null;
    const partiesText = (plaintiff && defendant)
        ? plaintiff + ' ضد ' + defendant
        : (plaintiff || defendant || partiesFallback || caseTitle || '— جلسة مستقلة —');

    // السطر الثالث: اسم/موضوع الدعوى (تعويض / طرد / ريع...)
    const titleLine = (caseTitle && caseTitle !== partiesText) ? caseTitle : null;

    return React.createElement('div', {
        className: "bg-premium-card rounded-lg px-2.5 py-1.5 cursor-pointer active:scale-[0.98] transition-all",
        style: { border: isStandalone ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(212,175,55,0.12)' },
        onClick: async () => {
            // ⚠️ مهم: للفتح (navigation) لازم نستخدم الكائن الكامل بتاع القضية
            // (caseForNav) مش الـ join المختصر (joinedCase) لأن شاشة تفاصيل
            // القضية محتاجة حقول زي number/court/status/date/year مش موجودة
            // أصلًا في الـ join المختصر المستخدم للعرض بس.
            if (caseForNav && onOpenCase) { onOpenCase(caseForNav); return; }
            if (s.case_id && onOpenCase) {
                // القضية مش من ضمن الصفحة المحمّلة حاليًا (الـ 15 الأخيرة) — نجيبها مباشرة بمعرفها
                const { data: r, error } = await db.from('cases').select('*').eq('id', s.case_id).maybeSingle();
                if (!error && r) {
                    // نفس التحويل اللي بيحصل في fetchCases عشان شكل البيانات يكون متطابق
                    const mappedCase = {
                        id:             r.id,
                        number:         r.case_number_official || '—',
                        title:          r.title || '—',
                        court:          r.court_name || '—',
                        type:           r.case_type || 'عام',
                        court_level:    r.court_level || null,
                        circuit_number: r.circuit_number || null,
                        status:         r.status || 'نشطة',
                        date:           r.next_hearing || r.next_session || '—',
                        client_id:      r.client_id,
                        plaintiff:      r.plaintiff || null,
                        defendant:      r.defendant || null,
                        year:           r.created_at ? new Date(r.created_at).getFullYear() : new Date().getFullYear(),
                        updated_at:     r.updated_at || null,
                    };
                    onOpenCase(mappedCase);
                    return;
                }
            }
            if (isStandalone && onOpenStandalone) onOpenStandalone(s);
        }
    },
        // سطر رقم الدعوى ونوعها (اختياري)
        numberLine && React.createElement('p', {
            className: "text-[9px] font-bold truncate leading-tight",
            style: { color: '#D4AF37' }
        }, numberLine),

        // سطر الأطراف
        React.createElement(PartiesLine, {
            plaintiff, defendant, fallback: partiesFallback || caseTitle || '— جلسة مستقلة —',
            className: "text-[13px] font-bold text-white" + (numberLine ? " mt-0.5" : "")
        }),

        // سطر اسم/موضوع الدعوى (اختياري)
        titleLine && React.createElement('p', {
            className: "text-[9px] font-medium text-slate-400 truncate leading-tight mt-0.5"
        }, titleLine)
    );
}

// ══════════════════════════════════════════
//  بطاقة مهمة واحدة
// ══════════════════════════════════════════

export default SessionCard;
