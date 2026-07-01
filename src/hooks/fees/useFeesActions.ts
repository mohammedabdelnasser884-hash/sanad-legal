import React, { useState, useEffect, useCallback } from 'react';
import { toast, escapeHtml, safeUpdate, logActivity } from '../../utils';
import { COUNTRY_CONFIGS } from '../../constants';
import { db } from '../../supabaseClient';

const PAGE_SIZE = 15;

export function useFeesActions(cases: any[], clients: any[], country?: string, profile?: any) {
    const [fees, setFees] = useState([]);
    const [payments, setPayments] = useState({}); // keyed by fee_id
    const [expandedPayments, setExpandedPayments] = useState({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({case_id:'', client_id:'', client_name_manual:'', client_name_text:'', receiver:'', total:'', paid:'', payment_date:'', notes:''});
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [addPaymentFor, setAddPaymentFor] = useState(null);
    const [payAmount, setPayAmount] = useState('');
    const [payDate, setPayDate] = useState('');
    const [payNote, setPayNote] = useState('');
    const [confirmDeletePay, setConfirmDeletePay] = useState(null);
    const [confirmDeleteFee, setConfirmDeleteFee] = useState(null);
    const [invoiceModal, setInvoiceModal] = useState(null);
    const [payReceiver, setPayReceiver] = useState('');
    const [payClientName, setPayClientName] = useState('');
    const [payClientNameText, setPayClientNameText] = useState('');
    const [feesSearch, setFeesSearch] = useState('');
    const [feesFilter, setFeesFilter] = useState<'collected'|'deferred'|'open'>('deferred');

    // ── pagination state ──
    const [feesPage, setFeesPage]   = useState(0);
    const [feesTotal, setFeesTotal] = useState(0);
    const [feesMore, setFeesMore]   = useState(false);

    // ── عملة الدولة المختارة ──
    const currency = COUNTRY_CONFIGS[country||'EG']?.currency || 'جنيه مصري';

    // ── FIX (1.3): حساب حالة الأتعاب (status) من الأرقام الفعلية ──
    // ⚠️ قبل الإصلاح ده، عمود status في case_fees كان بيتحدد مرة واحدة
    // بس عند الإنشاء (بالـ DEFAULT بتاع القاعدة) ومبيتغيّرش تاني أبداً —
    // حتى لو الموكل سدد بالكامل، الأتعاب كانت بتفضل ظاهرة في تاب "مؤجلة"
    // للأبد لأن مفيش كود كان بيكتب status الجديد. دلوقتي بنحسبها هنا بنفس
    // منطق getFeeCategory تحت، ونكتبها صراحةً مع كل عملية بتأثر على
    // paid_fees/total_fees (إنشاء، إضافة دفعة، حذف دفعة، تعديل الإجمالي).
    const computeFeeStatus = (total: number, paid: number): 'collected'|'deferred'|'open' => {
        const t = total || 0, p = paid || 0;
        if (t <= 0) return 'open';
        if (p >= t) return 'collected';
        return 'deferred';
    };

    // ── جلب الأتعاب من DB (paginated + server-side search + status filter) ──
    const fetchFees = useCallback(async (page = 0, status = feesFilter, search = feesSearch, append = false) => {
        if (!profile) return;
        setLoading(true);
        const from = page * PAGE_SIZE;
        const to   = from + PAGE_SIZE - 1;

        let q = db.from('case_fees')
            .select('*', { count: 'exact' })
            .eq('status', status)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search.trim()) {
            const s = search.trim();
            q = q.or(`client_name.ilike.%${s}%,notes.ilike.%${s}%`);
        }

        const { data, error, count } = await q;
        if (error) { setLoading(false); return; }

        const list = data || [];

        // جلب الدفعات للصفحة الحالية بس
        const feeIds = list.map((f: any) => f.id);
        let grouped = {};
        if (feeIds.length > 0) {
            const { data: pays } = await db.from('fee_payments')
                .select('*')
                .in('fee_id', feeIds)
                .order('payment_date', { ascending: false });
            (pays || []).forEach((p: any) => {
                if (!grouped[p.fee_id]) grouped[p.fee_id] = [];
                grouped[p.fee_id].push(p);
            });
        }

        if (append) {
            setFees((prev: any) => [...prev, ...list]);
            setPayments((prev: any) => ({ ...prev, ...grouped }));
        } else {
            setFees(list);
            setPayments(grouped);
        }

        setFeesTotal(count || 0);
        setFeesPage(page);
        setFeesMore((page + 1) * PAGE_SIZE < (count || 0));
        setLoading(false);
    }, [profile, feesFilter, feesSearch]);

    useEffect(() => { fetchFees(0, feesFilter, feesSearch, false); }, [fetchFees]);

    // ── عند تغيير التاب أو البحث ──
    const handleFilterChange = (newFilter: 'collected'|'deferred'|'open') => {
        setFeesFilter(newFilter);
        setFeesSearch('');
        fetchFees(0, newFilter, '', false);
    };

    const handleSearch = (term: string) => {
        setFeesSearch(term);
        fetchFees(0, feesFilter, term, false);
    };

    const handleSave = async () => {
        if(!form.case_id||!form.total){ toast('يرجى اختيار القضية وإدخال إجمالي الأتعاب',true); return; }
        setSaving(true);
        // BUG-07 FIX: بدل التخمين لاحقاً (وقت التعديل) بمطابقة الاسم النصي
        // مع clients.full_name — اللي ممكن يغلط لو فيه اسمين متطابقين أو
        // الاسم اتغيّر بعدين — دلوقتي بنخزن client_id حقيقي (FK) وقت
        // الحفظ نفسه، وقت ما احنا متأكدين فعلاً مين اللي المستخدم اختاره.
        // لو المستخدم مختارش موكل مسجّل ولا كتب اسم يدوي (يعني سايبها
        // على القضية)، client_id و client_name بيفضلوا null، والعرض
        // بيعتمد على موكل القضية المرتبطة (linkedClient) زي ما كان بالظبط.
        let clientId: string | null = null;
        let clientName: string | null = null;
        if (form.client_name_manual === '__manual__') {
            clientName = form.client_name_text || null;
            clientId = null;
        } else if (form.client_id) {
            const matchedClient = clients.find((cl: any) => cl.id === form.client_id);
            clientName = matchedClient?.full_name || null;
            clientId = form.client_id;
        }
        const payload = {
            case_id: form.case_id,
            client_id: clientId,
            client_name: clientName,
            receiver: form.receiver||null,
            total_fees: parseFloat(form.total)||0,
            notes: form.notes||null,
        };
        if(editId){
            const editFee = fees.find((f:any) => f.id === editId);
            // FIX (1.3): إجمالي الأتعاب ممكن يتغيّر هنا (تعديل)، فلازم نعيد
            // حساب status بناءً على الإجمالي الجديد مقابل المدفوع الحالي —
            // وإلا ممكن تعديل الإجمالي لأقل من المدفوع (أو العكس) يسيب
            // status قديمة غير متسقة مع الأرقام الفعلية.
            const newTotal = payload.total_fees;
            const currentPaid = editFee?.paid_fees || 0;
            (payload as any).status = computeFeeStatus(newTotal, currentPaid);
            const { conflict } = await safeUpdate(db, 'case_fees', editId, payload, editFee?.updated_at || null);
            if (conflict) { setSaving(false); return; }
            toast('✅ تم تحديث الأتعاب');
            logActivity(db, 'تعديل أتعاب', {
                entity_type: 'fee', entity_id: editId, details: clientName || form.case_id,
                client_name: clientName || null,
                case_name: cases.find((c: any) => c.id === form.case_id)?.title || null,
                case_type: cases.find((c: any) => c.id === form.case_id)?.type || null,
            });
        } else {
            // FIX (1.3): نحدد status الابتدائية صراحةً بدل ما نسيبها للـ
            // DEFAULT بتاع القاعدة (اللي ممكن يكون غلط لو الأتعاب من غير
            // إجمالي، أو لو فيه دفعة أولى بتغطي كامل المبلغ من الإنشاء).
            const initialPaid = parseFloat(form.paid) > 0 ? parseFloat(form.paid) : 0;
            const {data:inserted, error} = await db.from('case_fees')
                .insert([{...payload, paid_fees:0, status: computeFeeStatus(payload.total_fees, initialPaid)}]).select().single();
            if(error){ toast('❌ فشل حفظ الأتعاب الجديدة — تحقق من الاتصال وأعد المحاولة', true); setSaving(false); return; }
            if(inserted && parseFloat(form.paid)>0){
                await db.from('fee_payments').insert([{
                    fee_id: inserted.id,
                    amount: parseFloat(form.paid),
                    payment_date: form.payment_date||new Date().toISOString().slice(0,10),
                    notes: 'مقدم أتعاب',
                    received_by: form.receiver||null,
                    client_id: clientId,
                    client_name: clientName
                }]);
                const {data:allPays} = await db.from('fee_payments').select('amount').eq('fee_id',inserted.id);
                const realPaid = (allPays||[]).reduce((s,p)=>s+(p.amount||0), 0);
                await db.from('case_fees').update({
                    paid_fees: realPaid,
                    status: computeFeeStatus(payload.total_fees, realPaid),
                    last_payment_date: form.payment_date||new Date().toISOString().slice(0,10)
                }).eq('id',inserted.id);
            }
            toast('✅ تم إضافة الأتعاب');
            logActivity(db, 'إضافة أتعاب', {
                entity_type: 'fee', entity_id: inserted?.id, details: clientName || form.case_id,
                client_name: clientName || null,
                case_name: cases.find((c: any) => c.id === form.case_id)?.title || null,
                case_type: cases.find((c: any) => c.id === form.case_id)?.type || null,
            });
        }
        setSaving(false);
        setShowForm(false); setForm({case_id:'',client_id:'',client_name_manual:'',client_name_text:'',receiver:'',total:'',paid:'',payment_date:'',notes:''}); setEditId(null);
        fetchFees(0, feesFilter, feesSearch, false);
    };

    const handleAddPayment = async (fee) => {
        const amount = parseFloat(payAmount)||0;
        if(amount<=0){ toast('أدخل مبلغاً صحيحاً',true); return; }
        const remaining = (fee.total_fees || 0) - (fee.paid_fees || 0);
        if (fee.total_fees > 0 && amount > remaining) {
            toast(`⚠️ المبلغ (${amount.toLocaleString('ar-EG')}) يتجاوز المتبقي (${remaining.toLocaleString('ar-EG')} ${currency}). تأكد من الصحة.`, true);
        }
        // BUG-07 FIX: نفس مبدأ handleSave — payClientName بقى بيحمل client_id
        // (مش الاسم النصي) لو المستخدم اختار من القايمة، فبنحسب client_id
        // الحقيقي بجانب الاسم النصي بدل الاعتماد على مطابقة نصّية لاحقاً.
        let resolvedClientId: string | null = null;
        let resolvedClientName: string | null = null;
        if (payClientName === '__manual__') {
            resolvedClientName = payClientNameText || null;
            resolvedClientId = null;
        } else if (payClientName) {
            const matchedClient = clients.find((cl: any) => cl.id === payClientName);
            resolvedClientName = matchedClient?.full_name || null;
            resolvedClientId = payClientName;
        } else {
            resolvedClientName = fee.client_name || null;
            resolvedClientId = fee.client_id || null;
        }
        const { error: insertError } = await db.from('fee_payments').insert([{
            fee_id: fee.id,
            amount: amount,
            payment_date: payDate||new Date().toISOString().slice(0,10),
            notes: payNote||null,
            received_by: payReceiver||null,
            client_id: resolvedClientId,
            client_name: resolvedClientName
        }]);
        if(insertError){ toast('❌ فشل تسجيل الدفعة، يرجى المحاولة مرة أخرى', true); return; }
        const {data:allPays} = await db.from('fee_payments').select('amount').eq('fee_id',fee.id);
        const realPaid = (allPays||[]).reduce((s,p)=>s+(p.amount||0), 0);
        // FIX (1.3): نعيد حساب status مع كل دفعة جديدة — ده اللي كان
        // ناقص وبيخلي الأتعاب المسددة بالكامل تفضل في تاب "مؤجلة" للأبد.
        const upd: Record<string, any> = {paid_fees: realPaid, status: computeFeeStatus(fee.total_fees, realPaid)};
        if(resolvedClientName || resolvedClientId){ upd.client_name = resolvedClientName; upd.client_id = resolvedClientId; }
        if(payDate) upd.last_payment_date = payDate;
        const { error: updateError } = await db.from('case_fees').update(upd).eq('id',fee.id);
        if(updateError){ toast('⚠️ تم تسجيل الدفعة لكن فشل تحديث إجمالي المدفوع، يرجى تحديث الصفحة', true); fetchFees(0, feesFilter, feesSearch, false); return; }
        toast('✅ تم تسجيل الدفعة');
        logActivity(db, 'تسجيل دفعة', {
            entity_type: 'fee', entity_id: fee.id,
            details: `${amount.toLocaleString('ar-EG')} ${currency} — ${resolvedClientName || fee.client_name || ''}`,
            client_name: resolvedClientName || fee.client_name || null,
            case_name: cases.find((c: any) => c.id === fee.case_id)?.title || null,
            case_type: cases.find((c: any) => c.id === fee.case_id)?.type || null,
        });
        setAddPaymentFor(null); setPayAmount(''); setPayDate(''); setPayNote(''); setPayReceiver(''); setPayClientName(''); setPayClientNameText('');
        fetchFees(0, feesFilter, feesSearch, false);
    };

    const handleDeletePayment = async (payId, fee) => {
        const { error: deleteError } = await db.from('fee_payments').delete().eq('id',payId);
        if(deleteError){ toast('❌ فشل حذف الدفعة، يرجى المحاولة مرة أخرى', true); return; }
        const {data:allPays} = await db.from('fee_payments').select('amount').eq('fee_id',fee.id);
        const realPaid = (allPays||[]).reduce((s,p)=>s+(p.amount||0), 0);
        // FIX (1.3): لو حذف الدفعة رجّع المتبقي أعلى من صفر، لازم status
        // ترجع "مؤجلة" أو "مفتوحة" تاني بدل ما تفضل "محصّلة" غلط.
        const { error: updateError } = await db.from('case_fees').update({paid_fees: realPaid, status: computeFeeStatus(fee.total_fees, realPaid)}).eq('id',fee.id);
        if(updateError){ toast('⚠️ تم حذف الدفعة لكن فشل تحديث إجمالي المدفوع، يرجى تحديث الصفحة', true); fetchFees(0, feesFilter, feesSearch, false); return; }
        toast('🗑 تم حذف الدفعة');
        logActivity(db, 'حذف دفعة', {
            entity_type: 'fee', entity_id: fee.id, details: fee.client_name || null,
            client_name: fee.client_name || null,
            case_name: cases.find((c: any) => c.id === fee.case_id)?.title || null,
            case_type: cases.find((c: any) => c.id === fee.case_id)?.type || null,
        });
        fetchFees(0, feesFilter, feesSearch, false);
    };

    const handleDelete = async (id) => {
        const targetFee = fees.find((f: any) => f.id === id);
        const { error: paymentsError } = await db.from('fee_payments').delete().eq('fee_id',id);
        if(paymentsError){ toast('❌ فشل حذف الأتعاب — تحقق من الاتصال وأعد المحاولة', true); return; }
        const { error: feeError } = await db.from('case_fees').delete().eq('id',id);
        if(feeError){ toast('❌ فشل حذف الأتعاب — تحقق من الاتصال وأعد المحاولة', true); return; }
        toast('🗑 تم الحذف');
        logActivity(db, 'حذف أتعاب', {
            entity_type: 'fee', entity_id: id,
            client_name: targetFee?.client_name || null,
            case_name: cases.find((c: any) => c.id === targetFee?.case_id)?.title || null,
            case_type: cases.find((c: any) => c.id === targetFee?.case_id)?.type || null,
        });
        fetchFees(0, feesFilter, feesSearch, false);
    };

    const fmt = n => n?.toLocaleString('ar-SA',{maximumFractionDigits:0})||'0';
    const fmtDate = d => d ? new Date(d).toLocaleDateString('ar-EG',{year:'numeric',month:'short',day:'numeric'}) : '';

    // getFeeCategory تفيد في عرض الكارد بس (مش للتصنيف في DB)
    const getFeeCategory = (fee) => {
        const total = fee.total_fees || 0;
        const paid  = fee.paid_fees  || 0;
        if (total <= 0) return 'open';
        if (paid >= total) return 'collected';
        return 'deferred';
    };

    const feesSections = [
        {
            key: 'deferred' as const,
            label: 'مؤجلة',
            emoji: '⏳',
            desc: 'فلوس في الطريق',
            activeBg: 'bg-amber-500/20 border-amber-500/40',
            activeText: 'text-amber-300',
            countActiveBg: 'bg-amber-500/30 text-amber-200',
        },
        {
            key: 'open' as const,
            label: 'مفتوحة',
            emoji: '⚠️',
            desc: 'محتاجة تتحدد',
            activeBg: 'bg-rose-500/20 border-rose-500/40',
            activeText: 'text-rose-300',
            countActiveBg: 'bg-rose-500/30 text-rose-200',
        },
        {
            key: 'collected' as const,
            label: 'محصّلة',
            emoji: '✅',
            desc: 'أرباحك الفعلية',
            activeBg: 'bg-emerald-500/20 border-emerald-500/40',
            activeText: 'text-emerald-300',
            countActiveBg: 'bg-emerald-500/30 text-emerald-200',
        },
    ];

    // إجماليات الصفحة الحالية فقط
    const totalAll  = fees.reduce((s,f:any)=>s+(f.total_fees||0),0);
    const paidAll   = fees.reduce((s,f:any)=>s+(f.paid_fees||0),0);
    const remaining = totalAll - paidAll;

    // للتوافق مع FeesTab.tsx — filteredFees = fees (البحث صار server-side)
    const filteredFees = fees;
    const feesAfterCategoryFilter = fees;
    const feesByCategory = { collected: [], deferred: [], open: [] }; // deprecated

    const grandTotal     = totalAll;
    const grandPaid      = paidAll;
    const grandRemaining = remaining;

  return {
    fees, setFees, payments, setPayments, expandedPayments, setExpandedPayments,
    loading, showForm, setShowForm, form, setForm, saving, editId, setEditId,
    addPaymentFor, setAddPaymentFor, payAmount, setPayAmount, payDate, setPayDate,
    payNote, setPayNote, confirmDeletePay, setConfirmDeletePay,
    confirmDeleteFee, setConfirmDeleteFee, invoiceModal, setInvoiceModal,
    payReceiver, setPayReceiver, payClientName, setPayClientName,
    payClientNameText, setPayClientNameText, feesSearch, setFeesSearch,
    feesFilter, setFeesFilter,

    // pagination
    feesPage, feesTotal, feesMore,
    fetchFees, handleFilterChange, handleSearch,

    handleSave, handleAddPayment, handleDeletePayment, handleDelete,

    getFeeCategory,
    feesSections,
    feesByCategory,
    feesAfterCategoryFilter,
    filteredFees,

    totalAll, paidAll, remaining,
    grandTotal, grandPaid, grandRemaining,
    fmt, fmtDate,
  };
}
