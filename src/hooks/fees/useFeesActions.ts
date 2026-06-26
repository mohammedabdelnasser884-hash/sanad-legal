import { useState, useEffect } from 'react';
import { toast, escapeHtml, safeUpdate } from '../../utils';

export function useFeesActions(db: any, cases: any[], clients: any[]) {
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
    const [detailsFor, setDetailsFor] = useState(null); // معرف بطاقة الأتعاب المفتوحة تفاصيلها

    // ── توليد رقم فاتورة تسلسلي ──
    const genInvoiceNumber = (allPayments, paymentId) => {
        // جمع كل الدفعات مرتبة بالتاريخ
        const allPays = [];
        Object.values(allPayments).forEach(arr => arr.forEach(p => allPays.push(p)));
        allPays.sort((a,b)=> new Date(a.payment_date||a.created_at) - new Date(b.payment_date||b.created_at));
        const idx = allPays.findIndex(p=>p.id===paymentId);
        const num = idx>=0 ? idx+1 : allPays.length+1;
        const year = new Date().getFullYear();
        return `INV-${year}-${String(num).padStart(4,'0')}`;
    };

    // ══════════════════════════════════════════
    //  دوال مشتركة بين كل عمليات الطباعة
    //  (لتقليل التكرار بين printInvoice و printAllPayments)
    // ══════════════════════════════════════════

    // ── جلب بيانات المكتب (الاسم/العنوان/الهاتف/الإيميل/الشعار) ──
    const loadOfficeInfo = async () => {
        const [officeName, officeAddress, officePhone, officeEmail, officeLogo] = await Promise.all([
            loadOfficeSetting('office_name'),
            loadOfficeSetting('office_address'),
            loadOfficeSetting('office_phone'),
            loadOfficeSetting('office_email'),
            loadOfficeSetting('office_logo'),
        ]);
        const name    = escapeHtml(officeName    || 'مكتب المحاماة');
        const address = escapeHtml(officeAddress || '');
        const phone   = escapeHtml(officePhone   || '');
        const email   = escapeHtml(officeEmail   || '');
        // ⚠️ officeLogo بيُستخدم كـ src مباشرة (Data URL أو رابط)، فمينفعش
        // يتعمل له escapeHtml (هيكسر الـ Data URL) — لكنه قيمة إعدادات مكتب
        // مش نص حر مكتوب من مستخدم تالت، فمخاطره محدودة هنا.
        const logoHtml = officeLogo
            ? `<img src="${officeLogo}" style="width:64px;height:64px;object-fit:contain;border-radius:10px;" />`
            : officeLogoSvg(64);
        const contactLine = [address, phone, email].filter(Boolean).join(' | ');
        return { name, address, phone, email, logoHtml, contactLine };
    };

    // ── شعار سند الافتراضي (SVG) بمقاس مرن ──
    const officeLogoSvg = (size=64) => `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="width:${size}px;height:${size}px;">
                <rect width="80" height="80" rx="16" fill="#0B1320"/>
                <line x1="16" y1="26" x2="64" y2="26" stroke="#D4AF37" stroke-width="8" stroke-linecap="round"/>
                <line x1="22" y1="40" x2="64" y2="40" stroke="#D4AF37" stroke-width="8" stroke-linecap="round"/>
                <line x1="28" y1="54" x2="64" y2="54" stroke="#D4AF37" stroke-width="8" stroke-linecap="round"/>
                <line x1="16" y1="26" x2="16" y2="60" stroke="#D4AF37" stroke-width="8" stroke-linecap="round"/>
                <circle cx="16" cy="26" r="8" fill="#D4AF37"/>
                <circle cx="16" cy="61" r="5" fill="#D4AF37" opacity="0.38"/>
               </svg>`;

    // ── صف التواقيع المشترك بين كل المطبوعات ──
    const sigRowHtml = '<div class="sig-row">'
        +'<div class="sig-box"><div class="sig-line">توقيع المحامي / المكتب</div></div>'
        +'<div class="sig-box"><div class="sig-line">توقيع واستلام الموكل</div></div>'
        +'</div>';

    // ── سكريبت الطباعة التلقائية عند تحميل الصفحة ──
    const autoPrintScript = '<scr'+'ipt>window.onload=function(){window.print();}<'+'/scr'+'ipt>';

    // ── فتح نافذة جديدة جاهزة للطباعة بمقاس A4 ──
    const openPrintWindow = () => window.open('','_blank','width=794,height=1123');

    // ── كتابة الـHTML النهائي وتشغيل الطباعة ──
    const writeAndPrint = (w, html) => {
        if(!w) return;
        w.document.write(html);
        w.document.close();
    };

    // ── طباعة الفاتورة ──
    const printInvoice = async (inv) => {
        // جلب بيانات المكتب من الإعدادات
        const { name, contactLine, logoHtml } = await loadOfficeInfo();

        const w = openPrintWindow();
        if(!w) return;
        const statusBadge = inv.remaining==='0'
            ? '<span class="status-badge status-paid">مسدد بالكامل</span>'
            : '<span class="status-badge" style="background:#fef3c7;color:#92400e">جزئي</span>';
        const notesHtml = inv.notes
            ? '<div class="notes-box">ملاحظة: '+escapeHtml(inv.notes)+'</div>'
            : '';
        const invoiceNum = escapeHtml(inv.invoiceNum);
        const clientName = escapeHtml(inv.clientName || '—');
        const caseName   = escapeHtml(inv.caseName);
        const receivedBy = escapeHtml(inv.receivedBy || '—');
        const issueDate  = escapeHtml(inv.issueDate);
        const amount     = escapeHtml(inv.amount);
        const payDate    = escapeHtml(inv.payDate);
        const css = [
            '*{margin:0;padding:0;box-sizing:border-box;}',
            'body{font-family:Cairo,sans-serif;background:#fff;color:#1a1208;direction:rtl;print-color-adjust:exact;-webkit-print-color-adjust:exact;}',
            '.page{width:794px;min-height:1123px;padding:40px 50px;background:#fff;position:relative;}',
            '.header{display:flex;align-items:center;justify-content:space-between;padding-bottom:24px;border-bottom:3px solid #D4AF37;margin-bottom:28px;}',
            '.logo-box{display:flex;align-items:center;gap:14px;}',
            '.logo-svg{width:64px;height:64px;}',
            '.office-name{font-size:22px;font-weight:900;color:#070d1a;line-height:1.2;}',
            '.office-sub{font-size:10px;color:#7a6b52;margin-top:2px;}',
            '.invoice-badge{text-align:left;}',
            '.invoice-title{font-size:13px;font-weight:700;color:#7a6b52;letter-spacing:1px;}',
            '.invoice-num{font-size:26px;font-weight:900;color:#070d1a;}',
            '.invoice-date{font-size:11px;color:#7a6b52;margin-top:4px;}',
            '.gold-bar{height:4px;background:linear-gradient(90deg,#D4AF37,#E8C84A,#D4AF37);border-radius:2px;margin-bottom:28px;}',
            '.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;}',
            '.info-box{background:#faf7f2;border:1px solid #e8e0d0;border-radius:10px;padding:14px 16px;}',
            '.info-label{font-size:10px;color:#7a6b52;font-weight:600;margin-bottom:4px;}',
            '.info-value{font-size:13px;font-weight:700;color:#1a1208;}',
            '.section-title{font-size:11px;font-weight:700;color:#7a6b52;margin-bottom:8px;}',
            '.amount-section{background:linear-gradient(135deg,#070d1a,#0d1a2e);border-radius:14px;padding:24px 28px;margin-bottom:28px;color:#fff;}',
            '.amount-label{font-size:12px;color:#D4AF37;font-weight:700;margin-bottom:6px;}',
            '.amount-value{font-size:36px;font-weight:900;color:#fff;}',
            '.amount-sub{font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;}',
            '.tbl{width:100%;border-collapse:collapse;margin-bottom:28px;}',
            '.tbl th{background:#070d1a;color:#D4AF37;font-size:11px;font-weight:700;padding:10px 14px;text-align:right;}',
            '.tbl td{padding:10px 14px;font-size:12px;border-bottom:1px solid #e8e0d0;color:#1a1208;}',
            '.tbl tr:nth-child(even) td{background:#faf7f2;}',
            '.status-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;}',
            '.status-paid{background:#d1fae5;color:#065f46;}',
            '.notes-box{background:#faf7f2;border:1px solid #e8e0d0;border-right:3px solid #D4AF37;border-radius:8px;padding:12px 16px;margin-bottom:28px;font-size:11px;color:#4a3f2a;line-height:1.7;}',
            '.sig-row{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:36px;}',
            '.sig-box{text-align:center;}',
            '.sig-line{border-top:1.5px solid #1a1208;margin-top:44px;padding-top:8px;font-size:11px;color:#7a6b52;font-weight:600;}',
            '.footer{position:absolute;bottom:28px;left:50px;right:50px;text-align:center;font-size:10px;color:#c4b89a;border-top:1px solid #e8e0d0;padding-top:10px;}',
            '@media print{body{margin:0;}.page{padding:30px 40px;}}'
        ].join('\n');

        const html = '<!DOCTYPE html>'
            +'<html lang="ar" dir="rtl"><head><meta charset="UTF-8">'
            +'<title>فاتورة '+invoiceNum+'</title>'
            +'<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap" rel="stylesheet">'
            +'<style>'+css+'</style></head><body>'
            +'<div class="page">'
            +'<div class="header">'
            +'<div class="logo-box">'
            +logoHtml
            +'<div><div class="office-name">'+name+'</div>'
            +(contactLine?'<div class="office-sub">'+contactLine+'</div>':'')
            +'</div></div>'
            +'<div class="invoice-badge">'
            +'<div class="invoice-title">فاتورة أتعاب</div>'
            +'<div class="invoice-num">'+invoiceNum+'</div>'
            +'<div class="invoice-date">تاريخ الإصدار: '+issueDate+'</div>'
            +'</div></div>'
            +'<div class="gold-bar"></div>'
            +'<div class="info-grid">'
            +'<div class="info-box"><div class="section-title">بيانات الموكل</div>'
            +'<div class="info-label">اسم الموكل</div>'
            +'<div class="info-value">'+clientName+'</div></div>'
            +'<div class="info-box"><div class="section-title">بيانات القضية</div>'
            +'<div class="info-label">عنوان القضية</div>'
            +'<div class="info-value">'+caseName+'</div></div>'
            +'</div>'
            +'<div class="info-grid" style="margin-top:-16px">'
            +'<div class="info-box"><div class="info-label">استلم المبلغ</div>'
            +'<div class="info-value" style="color:#6d28d9">'+receivedBy+'</div></div>'
            +'<div class="info-box"><div class="info-label">تاريخ الإصدار</div>'
            +'<div class="info-value">'+issueDate+'</div></div>'
            +'</div>'
            +'<div class="amount-section">'
            +'<div class="amount-label">مبلغ هذه الدفعة</div>'
            +'<div class="amount-value">'+amount+' جنيه</div>'
            +'<div class="amount-sub">تاريخ الدفع: '+payDate+'</div>'
            +'</div>'
            +notesHtml
            +sigRowHtml
            +'<div class="footer">'+name+(contactLine?' — '+contactLine:'')+'</div>'
            +'</div>'
            +autoPrintScript
            +'</body></html>';

        writeAndPrint(w, html);
    };
    const printAllPayments = (fee, feePayments, caseName, clientName) => {
        const w = openPrintWindow();
        if(!w) return;
        const year = new Date().getFullYear();
        const css = [
            '*{margin:0;padding:0;box-sizing:border-box;}',
            'body{font-family:Cairo,sans-serif;background:#fff;color:#1a1208;direction:rtl;print-color-adjust:exact;-webkit-print-color-adjust:exact;}',
            '.page{width:794px;padding:36px 48px;background:#fff;}',
            '.header{display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #D4AF37;margin-bottom:24px;}',
            '.logo-box{display:flex;align-items:center;gap:12px;}',
            '.logo-svg{width:56px;height:56px;}',
            '.office-name{font-size:20px;font-weight:900;color:#070d1a;}',
            '.office-sub{font-size:10px;color:#7a6b52;margin-top:2px;}',
            '.report-title{font-size:14px;font-weight:900;color:#070d1a;text-align:left;}',
            '.report-sub{font-size:10px;color:#7a6b52;text-align:left;margin-top:3px;}',
            '.gold-bar{height:4px;background:linear-gradient(90deg,#D4AF37,#E8C84A,#D4AF37);border-radius:2px;margin-bottom:22px;}',
            '.info-row{display:flex;gap:16px;margin-bottom:20px;}',
            '.info-box{flex:1;background:#faf7f2;border:1px solid #e8e0d0;border-radius:10px;padding:12px 14px;}',
            '.info-label{font-size:9px;color:#7a6b52;font-weight:600;margin-bottom:3px;}',
            '.info-value{font-size:12px;font-weight:700;color:#1a1208;}',
            '.tbl{width:100%;border-collapse:collapse;margin-bottom:24px;}',
            '.tbl th{background:#070d1a;color:#D4AF37;font-size:10px;font-weight:700;padding:9px 12px;text-align:right;}',
            '.tbl td{padding:9px 12px;font-size:11px;border-bottom:1px solid #e8e0d0;color:#1a1208;}',
            '.tbl tr:nth-child(even) td{background:#faf7f2;}',
            '.total-row td{background:linear-gradient(135deg,#070d1a,#0d1a2e)!important;color:#D4AF37!important;font-weight:900;font-size:12px;}',
            '.sig-row{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px;}',
            '.sig-box{text-align:center;}',
            '.sig-line{border-top:1.5px solid #1a1208;margin-top:44px;padding-top:8px;font-size:11px;color:#7a6b52;font-weight:600;}',
            '.footer{margin-top:28px;text-align:center;font-size:9px;color:#c4b89a;border-top:1px solid #e8e0d0;padding-top:10px;}',
            '@media print{body{margin:0;}.page{padding:28px 38px;}}'
        ].join('\n');

        let rows = '';
        feePayments.forEach((p,i)=>{
            const num = 'INV-'+year+'-'+String(i+1).padStart(4,'0');
            const d = p.payment_date ? new Date(p.payment_date).toLocaleDateString('ar-EG',{year:'numeric',month:'short',day:'numeric'}) : '—';
            const recv = escapeHtml(p.received_by || '—');
            const amt = (p.amount||0).toLocaleString('ar-SA',{maximumFractionDigits:0});
            const note = escapeHtml(p.notes || '—');
            rows += '<tr>'
                +'<td>'+num+'</td>'
                +'<td>'+d+'</td>'
                +'<td>'+amt+' \u062c\u0646\u064a\u0647</td>'
                +'<td>'+recv+'</td>'
                +'<td>'+note+'</td>'
                +'</tr>';
        });
        const totalPaid = (fee.paid_fees||0).toLocaleString('ar-SA',{maximumFractionDigits:0});
        rows += '<tr class="total-row"><td colspan="2">\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u062f\u0641\u0648\u0639</td><td>'+totalPaid+' \u062c\u0646\u064a\u0647</td><td colspan="2"></td></tr>';

        const safeCaseName = escapeHtml(caseName);
        const safeClientName = escapeHtml(clientName || '—');

        const html = '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">'
            +'<title>\u0643\u0634\u0641 \u062f\u0641\u0639\u0627\u062a '+safeCaseName+'</title>'
            +'<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap" rel="stylesheet">'
            +'<style>'+css+'</style></head><body>'
            +'<div class="page">'
            +'<div class="header">'
            +'<div class="logo-box">'
            +officeLogoSvg(56)
            +'<div><div class="office-name">\u0633\u064e\u0646\u064e\u062f</div>'
            +'<div class="office-sub">\u0646\u0638\u0627\u0645 \u0627\u0644\u062a\u0634\u0639\u064a\u0644 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a</div></div></div>'
            +'<div><div class="report-title">\u0643\u0634\u0641 \u062c\u0645\u064a\u0639 \u0627\u0644\u062f\u0641\u0639\u0627\u062a</div>'
            +'<div class="report-sub">\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0637\u0628\u0627\u0639\u0629: '+new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'})+'</div></div>'
            +'</div>'
            +'<div class="gold-bar"></div>'
            +'<div class="info-row">'
            +'<div class="info-box"><div class="info-label">\u0627\u0644\u0642\u0636\u064a\u0629</div><div class="info-value">'+safeCaseName+'</div></div>'
            +'<div class="info-box"><div class="info-label">\u0627\u0644\u0645\u0648\u0643\u0644</div><div class="info-value">'+safeClientName+'</div></div>'
            +'<div class="info-box"><div class="info-label">\u0639\u062f\u062f \u0627\u0644\u062f\u0641\u0639\u0627\u062a</div><div class="info-value">'+feePayments.length+'</div></div>'
            +'</div>'
            +'<table class="tbl"><thead><tr>'
            +'<th>\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629</th>'
            +'<th>\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u062f\u0641\u0639</th>'
            +'<th>\u0627\u0644\u0645\u0628\u0644\u063a</th>'
            +'<th>\u0627\u0644\u0645\u0633\u062a\u0644\u0645</th>'
            +'<th>\u0645\u0644\u0627\u062d\u0638\u0627\u062a</th>'
            +'</tr></thead><tbody>'+rows+'</tbody></table>'
            +sigRowHtml
            +'<div class="footer">\u0633\u064e\u0646\u064e\u062f \u2014 \u0646\u0638\u0627\u0645 \u0627\u0644\u062a\u0634\u0639\u064a\u0644 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a</div>'
            +'</div>'
            +autoPrintScript
            +'</body></html>';
        writeAndPrint(w, html);
    };

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
            toast(`⚠️ المبلغ (${amount.toLocaleString('ar-EG')}) يتجاوز المتبقي (${remaining.toLocaleString('ar-EG')} جنيه). تأكد من الصحة.`, true);
            // نتيح المتابعة — لا نمنع (قد تكون غرامة أو تكاليف إضافية)
        }
        const resolvedClient = payClientName==='__manual__' ? (payClientNameText||null) : (payClientName||fee.client_name||null);
        await db.from('fee_payments').insert([{
            fee_id: fee.id,
            amount: amount,
            payment_date: payDate||new Date().toISOString().slice(0,10),
            notes: payNote||null,
            received_by: payReceiver||null,
            client_name: resolvedClient
        }]);
        // احسب المجموع الفعلي من قاعدة البيانات بدون تحديد سقف
        const {data:allPays} = await db.from('fee_payments').select('amount').eq('fee_id',fee.id);
        const realPaid = (allPays||[]).reduce((s,p)=>s+(p.amount||0), 0);
        const upd = {paid_fees: realPaid};
        if(resolvedClient) upd.client_name = resolvedClient;
        if(payDate) upd.last_payment_date = payDate;
        await db.from('case_fees').update(upd).eq('id',fee.id);
        toast('✅ تم تسجيل الدفعة');
        setAddPaymentFor(null); setPayAmount(''); setPayDate(''); setPayNote(''); setPayReceiver(''); setPayClientName(''); setPayClientNameText('');
        fetchFees();
    };

    const handleDeletePayment = async (payId, fee) => {
        await db.from('fee_payments').delete().eq('id',payId);
        // احسب المجموع الفعلي بعد الحذف من قاعدة البيانات بدون تحديد سقف
        const {data:allPays} = await db.from('fee_payments').select('amount').eq('fee_id',fee.id);
        const realPaid = (allPays||[]).reduce((s,p)=>s+(p.amount||0), 0);
        await db.from('case_fees').update({paid_fees: realPaid}).eq('id',fee.id);
        toast('🗑 تم حذف الدفعة');
        fetchFees();
    };

    const handleDelete = async (id) => {
        await db.from('fee_payments').delete().eq('fee_id',id);
        await db.from('case_fees').delete().eq('id',id);
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
