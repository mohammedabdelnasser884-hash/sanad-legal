import React, { useState, useEffect } from 'react';
import { toast, escapeHtml, safeUpdate } from '../../utils';
import { COUNTRY_CONFIGS } from '../../constants';

export function useFeesActions(db: any, cases: any[], clients: any[], country?: string) {
    const [fees, setFees] = useState([]);
    const [payments, setPayments] = useState({}); // keyed by fee_id
    const [expandedPayments, setExpandedPayments] = useState({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({case_id:'', client_name_manual:'', receiver:'', total:'', paid:'', payment_date:'', notes:''});
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

    // ── عملة الدولة المختارة (تُستخدم في رسائل التنبيه فقط؛ الطباعة في FeesTab.tsx) ──
    const currency = COUNTRY_CONFIGS[country||'EG']?.currency || 'جنيه مصري';

    const fetchFees = async () => {
        setLoading(true);
        const {data} = await db.from('case_fees').select('*').order('created_at',{ascending:false});
        setFees(data||[]);
        // جلب كل الدفعات
        const {data:pays} = await db.from('fee_payments').select('*').order('payment_date',{ascending:false});
        const grouped = {};
        (pays||[]).forEach(p=>{ if(!grouped[p.fee_id]) grouped[p.fee_id]=[]; grouped[p.fee_id].push(p); });
        setPayments(grouped);
        setLoading(false);
    };
    useEffect(()=>{ fetchFees(); },[]);

    const handleSave = async () => {
        if(!form.case_id||!form.total){ toast('يرجى اختيار القضية وإدخال إجمالي الأتعاب',true); return; }
        setSaving(true);
        const clientName = form.client_name_manual === '__manual__'
            ? (form.client_name_text||null)
            : (form.client_name_manual||null);
        const payload = {
            case_id: form.case_id,
            client_name: clientName,
            receiver: form.receiver||null,
            total_fees: parseFloat(form.total)||0,
            notes: form.notes||null,
        };
        if(editId){
            // تعديل — لا نلمس paid_fees أبداً، يتحسب من fee_payments
            const editFee = fees.find((f:any) => f.id === editId);
            const { conflict } = await safeUpdate(db, 'case_fees', editId, payload, editFee?.updated_at || null);
            if (conflict) { setSaving(false); return; }
            toast('✅ تم تحديث الأتعاب');
        } else {
            // إضافة جديدة — paid_fees يبدأ بصفر دايماً
            const {data:inserted, error} = await db.from('case_fees')
                .insert([{...payload, paid_fees:0}]).select().single();
            if(error){ toast('❌ حدث خطأ، يرجى المحاولة مرة أخرى', true); setSaving(false); return; }
            // لو كتب مقدم أتعاب → سجّله كدفعة وحدّث paid_fees
            if(inserted && parseFloat(form.paid)>0){
                await db.from('fee_payments').insert([{
                    fee_id: inserted.id,
                    amount: parseFloat(form.paid),
                    payment_date: form.payment_date||new Date().toISOString().slice(0,10),
                    notes: 'مقدم أتعاب',
                    received_by: form.receiver||null,
                    client_name: clientName
                }]);
                // احسب paid_fees من DB بعد ما الدفعة اتضافت
                const {data:allPays} = await db.from('fee_payments').select('amount').eq('fee_id',inserted.id);
                const realPaid = (allPays||[]).reduce((s,p)=>s+(p.amount||0), 0);
                await db.from('case_fees').update({
                    paid_fees: realPaid,
                    last_payment_date: form.payment_date||new Date().toISOString().slice(0,10)
                }).eq('id',inserted.id);
            }
            toast('✅ تم إضافة الأتعاب');
        }
        setSaving(false);
        setShowForm(false); setForm({case_id:'',client_name_manual:'',client_name_text:'',receiver:'',total:'',paid:'',payment_date:'',notes:''}); setEditId(null);
        fetchFees();
    };

    const handleAddPayment = async (fee) => {
        const amount = parseFloat(payAmount)||0;
        if(amount<=0){ toast('أدخل مبلغاً صحيحاً',true); return; }
        const remaining = (fee.total_fees || 0) - (fee.paid_fees || 0);
        if (fee.total_fees > 0 && amount > remaining) {
            toast(`⚠️ المبلغ (${amount.toLocaleString('ar-EG')}) يتجاوز المتبقي (${remaining.toLocaleString('ar-EG')} ${currency}). تأكد من الصحة.`, true);
            // نتيح المتابعة — لا نمنع (قد تكون غرامة أو تكاليف إضافية)
        }
        const resolvedClient = payClientName==='__manual__' ? (payClientNameText||null) : (payClientName||fee.client_name||null);
        const { error: insertError } = await db.from('fee_payments').insert([{
            fee_id: fee.id,
            amount: amount,
            payment_date: payDate||new Date().toISOString().slice(0,10),
            notes: payNote||null,
            received_by: payReceiver||null,
            client_name: resolvedClient
        }]);
        if(insertError){ toast('❌ فشل تسجيل الدفعة، يرجى المحاولة مرة أخرى', true); return; }
        // احسب المجموع الفعلي من قاعدة البيانات بدون تحديد سقف
        const {data:allPays} = await db.from('fee_payments').select('amount').eq('fee_id',fee.id);
        const realPaid = (allPays||[]).reduce((s,p)=>s+(p.amount||0), 0);
        const upd = {paid_fees: realPaid};
        if(resolvedClient) upd.client_name = resolvedClient;
        if(payDate) upd.last_payment_date = payDate;
        const { error: updateError } = await db.from('case_fees').update(upd).eq('id',fee.id);
        if(updateError){ toast('⚠️ تم تسجيل الدفعة لكن فشل تحديث إجمالي المدفوع، يرجى تحديث الصفحة', true); fetchFees(); return; }
        toast('✅ تم تسجيل الدفعة');
        setAddPaymentFor(null); setPayAmount(''); setPayDate(''); setPayNote(''); setPayReceiver(''); setPayClientName(''); setPayClientNameText('');
        fetchFees();
    };

    const handleDeletePayment = async (payId, fee) => {
        const { error: deleteError } = await db.from('fee_payments').delete().eq('id',payId);
        if(deleteError){ toast('❌ فشل حذف الدفعة، يرجى المحاولة مرة أخرى', true); return; }
        // احسب المجموع الفعلي بعد الحذف من قاعدة البيانات بدون تحديد سقف
        const {data:allPays} = await db.from('fee_payments').select('amount').eq('fee_id',fee.id);
        const realPaid = (allPays||[]).reduce((s,p)=>s+(p.amount||0), 0);
        const { error: updateError } = await db.from('case_fees').update({paid_fees: realPaid}).eq('id',fee.id);
        if(updateError){ toast('⚠️ تم حذف الدفعة لكن فشل تحديث إجمالي المدفوع، يرجى تحديث الصفحة', true); fetchFees(); return; }
        toast('🗑 تم حذف الدفعة');
        fetchFees();
    };

    const handleDelete = async (id) => {
        const { error: paymentsError } = await db.from('fee_payments').delete().eq('fee_id',id);
        if(paymentsError){ toast('❌ فشل الحذف، يرجى المحاولة مرة أخرى', true); return; }
        const { error: feeError } = await db.from('case_fees').delete().eq('id',id);
        if(feeError){ toast('❌ فشل الحذف، يرجى المحاولة مرة أخرى', true); return; }
        toast('🗑 تم الحذف');
        fetchFees();
    };

    const fmt = n => n?.toLocaleString('ar-SA',{maximumFractionDigits:0})||'0';
    const fmtDate = d => d ? new Date(d).toLocaleDateString('ar-EG',{year:'numeric',month:'short',day:'numeric'}) : '';

    // ── تصنيف الأتعاب (محصلة / مؤجلة / مفتوحة) ──
    const getFeeCategory = (fee) => {
        const total = fee.total_fees || 0;
        const paid  = fee.paid_fees  || 0;
        if (total <= 0) return 'open';          // مفيش اتفاق على رقم → مفتوحة
        if (paid >= total) return 'collected';  // اتدفعت بالكامل → محصلة
        return 'deferred';                      // فيها رقم بس لسه ناقصة → مؤجلة
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

    const feesByCategory = {
        collected: fees.filter(f => getFeeCategory(f) === 'collected'),
        deferred:  fees.filter(f => getFeeCategory(f) === 'deferred'),
        open:      fees.filter(f => getFeeCategory(f) === 'open'),
    };

    // ── فلترة الأتعاب بالبحث ──
    const feesAfterCategoryFilter = feesByCategory[feesFilter] || [];
    const filteredFees = feesSearch.trim() === '' ? feesAfterCategoryFilter : feesAfterCategoryFilter.filter(fee => {
        const q = feesSearch.trim().toLowerCase();
        const linkedCase = cases.find(c => c.id === fee.case_id);
        const linkedClient = linkedCase ? clients.find(cl => cl.id === linkedCase.client_id) : null;
        return (
            linkedCase?.title?.toLowerCase().includes(q) ||
            linkedClient?.full_name?.toLowerCase().includes(q) ||
            linkedCase?.plaintiff?.toLowerCase().includes(q) ||
            linkedCase?.defendant?.toLowerCase().includes(q) ||
            fee.notes?.toLowerCase().includes(q)
        );
    });

    // ── إجماليات حسب الفئة الحالية ──
    const currentSectionFees = feesAfterCategoryFilter;
    const totalAll  = currentSectionFees.reduce((s,f)=>s+(f.total_fees||0),0);
    const paidAll   = currentSectionFees.reduce((s,f)=>s+(f.paid_fees||0),0);
    const remaining = totalAll - paidAll;

    // ── إجماليات شاملة من كل الفئات ──
    const allFees = fees;
    const grandTotal     = allFees.reduce((s,f)=>s+(f.total_fees||0),0);
    const grandPaid      = allFees.reduce((s,f)=>s+(f.paid_fees||0),0);
    const grandRemaining = grandTotal - grandPaid;


  return {
    fees, setFees, payments, setPayments, expandedPayments, setExpandedPayments,
    loading, showForm, setShowForm, form, setForm, saving, editId, setEditId,
    addPaymentFor, setAddPaymentFor, payAmount, setPayAmount, payDate, setPayDate,
    payNote, setPayNote, confirmDeletePay, setConfirmDeletePay,
    confirmDeleteFee, setConfirmDeleteFee, invoiceModal, setInvoiceModal,
    payReceiver, setPayReceiver, payClientName, setPayClientName,
    payClientNameText, setPayClientNameText, feesSearch, setFeesSearch,
    feesFilter, setFeesFilter,
    fetchFees, handleSave, handleAddPayment, handleDeletePayment, handleDelete,
  };
}
