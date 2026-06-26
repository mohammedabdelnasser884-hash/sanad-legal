import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast, escapeTelegramHtml } from '../utils';
import { db } from '../supabaseClient';
import { Inp, Sel } from './shared';

// ══════════════════════════════════════════
//  Modal إضافة جلسة مستقلة (بدون ربط بقضية)
// ══════════════════════════════════════════

const COURTS = [
    'محكمة النقض',
    'محكمة استئناف القاهرة',
    'محكمة استئناف الإسكندرية',
    'محكمة استئناف طنطا',
    'محكمة استئناف المنصورة',
    'محكمة استئناف أسيوط',
    'محكمة جنح مستأنف',
    'المحكمة الابتدائية',
    'محكمة الجنح',
    'محكمة الأسرة',
    'المحكمة الإدارية',
    'محكمة القضاء الإداري',
    'المحكمة الاقتصادية',
    'محكمة العمل',
    'محكمة الجنايات',
    'أخرى',
];

const CASE_TYPES = ['مدني', 'تجاري', 'جنائي', 'عمالي', 'إداري', 'أسرة', 'أخرى'];

interface Form {
    session_date: string;
    session_time: string;
    session_floor: string;
    session_hall: string;
    title: string;
    case_number: string;
    court: string;
    case_type: string;
    plaintiff: string;
    plaintiff_national_id: string;
    plaintiff_power_of_attorney: string;
    defendant: string;
    defendant_national_id: string;
    description: string;
    result: string;
    next_action: string;
}

const EMPTY: Form = {
    session_date: '',
    session_time: 'صباحي',
    session_floor: '',
    session_hall: '',
    title: '',
    case_number: '',
    court: '',
    case_type: '',
    plaintiff: '',
    plaintiff_national_id: '',
    plaintiff_power_of_attorney: '',
    defendant: '',
    defendant_national_id: '',
    description: '',
    result: '',
    next_action: '',
};

function SectionTitle({ children }: { children: string }) {
    return React.createElement('p', {
        className: 'text-[10px] font-black text-premium-gold/70 uppercase tracking-widest pt-2 pb-0.5 border-b border-white/5'
    }, children);
}

export default function NewStandaloneSessionModal({ onClose, onSaved, onNotify }: {
    onClose: () => void;
    onSaved: () => void;
    onNotify?: (msg: string) => void;
}) {
    const [form, setForm] = useState<Form>(EMPTY);
    const [saving, setSaving] = useState(false);

    const set = (k: keyof Form) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSave = async () => {
        if (!form.session_date) { toast('⚠️ تاريخ الجلسة مطلوب', true); return; }
        setSaving(true);
        const { error } = await db.from('case_sessions').insert([{
            case_id: null,
            session_date: form.session_date,
            session_time: form.session_time || null,
            session_floor: form.session_floor || null,
            session_hall: form.session_hall || null,
            title: form.title || null,
            case_number: form.case_number || null,
            court: form.court || null,
            case_type: form.case_type || null,
            plaintiff: form.plaintiff || null,
            plaintiff_national_id: form.plaintiff_national_id || null,
            plaintiff_power_of_attorney: form.plaintiff_power_of_attorney || null,
            defendant: form.defendant || null,
            defendant_national_id: form.defendant_national_id || null,
            description: form.description || null,
            result: form.result || null,
            next_action: form.next_action || null,
        }]);
        setSaving(false);

        if (error) {
            // لو العمود مش موجود، نعرض رسالة مفيدة
            if (error.message?.includes('column')) {
                toast('❌ تحقق من أعمدة الجدول — راجع SQL أدناه', true);
            } else {
                toast('❌ فشل الحفظ، يرجى المحاولة مرة أخرى', true);
            }
            return;
        }

        // إشعار تيليجرام
        if (onNotify) {
            let msg = `📅 <b>جلسة مستقلة جديدة</b>\n\n`;
            if (form.title) msg += `⚖️ <b>${escapeTelegramHtml(form.title)}</b>\n`;
            if (form.case_number) msg += `📋 رقم القضية: ${escapeTelegramHtml(form.case_number)}\n`;
            if (form.court) msg += `🏛 المحكمة: ${escapeTelegramHtml(form.court)}\n`;
            msg += `📆 تاريخ الجلسة: ${escapeTelegramHtml(form.session_date)}`;
            if (form.session_time) msg += ` (${escapeTelegramHtml(form.session_time)})`;
            msg += `\n`;
            if (form.plaintiff) msg += `👤 المدعي: ${escapeTelegramHtml(form.plaintiff)}\n`;
            if (form.defendant) msg += `👤 المدعى عليه: ${escapeTelegramHtml(form.defendant)}\n`;
            if (form.session_floor || form.session_hall)
                msg += `📍 ${form.session_floor ? 'الطابق ' + escapeTelegramHtml(form.session_floor) + ' ' : ''}${form.session_hall ? 'قاعة ' + escapeTelegramHtml(form.session_hall) : ''}\n`;
            if (form.description) msg += `📝 ${escapeTelegramHtml(form.description)}\n`;
            onNotify(msg);
        }

        toast('✅ تمت إضافة الجلسة المستقلة');
        onSaved();
        onClose();
    };

    const modal = React.createElement('div', {
        className: 'fixed inset-0 z-50 flex items-end justify-center',
        style: { background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' },
        onClick: (e: any) => { if (e.target === e.currentTarget) onClose(); }
    },
        React.createElement('div', {
            className: 'w-full max-w-lg rounded-t-3xl overflow-hidden',
            style: { background: '#0f1623', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '92vh' }
        },
            // ── هيدر ──
            React.createElement('div', {
                className: 'flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5'
            },
                React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('span', { className: 'text-xl' }, '⚡'),
                    React.createElement('div', null,
                        React.createElement('h2', { className: 'text-sm font-black text-white' }, 'جلسة مستقلة'),
                        React.createElement('p', { className: 'text-[10px] text-slate-400' }, 'بدون ربط بملف قضية')
                    )
                ),
                React.createElement('button', {
                    onClick: onClose,
                    className: 'w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 text-sm hover:bg-white/10'
                }, '✕')
            ),

            // ── محتوى ──
            React.createElement('div', {
                className: 'overflow-y-auto px-5 py-4 space-y-3',
                style: { maxHeight: 'calc(92vh - 130px)' }
            },
                // موعد الجلسة
                React.createElement(SectionTitle, null, '📅 موعد الجلسة'),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                    React.createElement('div', null,
                        React.createElement('label', { className: 'block text-[10px] font-bold text-slate-400 mb-1.5' },
                            'تاريخ الجلسة ', React.createElement('span', { className: 'text-rose-400' }, '*')
                        ),
                        React.createElement('input', {
                            type: 'date',
                            value: form.session_date,
                            onChange: set('session_date'),
                            className: 'w-full p-3 text-xs rounded-xl border border-white/10 bg-premium-bg text-white',
                            style: { fontFamily: 'Cairo,sans-serif' }
                        })
                    ),
                    React.createElement(Sel, {
                        label: 'الفترة',
                        value: form.session_time,
                        onChange: set('session_time'),
                        options: [
                            { value: 'صباحي', label: '🌅 صباحي' },
                            { value: 'مسائي', label: '🌆 مسائي' },
                        ]
                    })
                ),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                    React.createElement(Inp, { label: 'الطابق', value: form.session_floor, onChange: set('session_floor'), placeholder: 'مثال: 3' }),
                    React.createElement(Inp, { label: 'القاعة', value: form.session_hall, onChange: set('session_hall'), placeholder: 'مثال: 5' })
                ),

                // بيانات القضية
                React.createElement(SectionTitle, null, '⚖️ بيانات القضية'),
                React.createElement(Inp, { label: 'موضوع الجلسة / عنوان', value: form.title, onChange: set('title'), placeholder: 'مثال: قضية إيجار — استئناف' }),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                    React.createElement(Inp, { label: 'رقم القضية', value: form.case_number, onChange: set('case_number'), placeholder: 'مثال: 1234/2024' }),
                    React.createElement(Sel, {
                        label: 'نوع القضية',
                        value: form.case_type,
                        onChange: set('case_type'),
                        options: [{ value: '', label: '— اختر —' }, ...CASE_TYPES.map(t => ({ value: t, label: t }))]
                    })
                ),
                React.createElement(Sel, {
                    label: 'المحكمة',
                    value: form.court,
                    onChange: set('court'),
                    options: [{ value: '', label: '— اختر المحكمة —' }, ...COURTS.map(c => ({ value: c, label: c }))]
                }),

                // المدعي
                React.createElement(SectionTitle, null, '👤 المدعي'),
                React.createElement(Inp, { label: 'اسم المدعي', value: form.plaintiff, onChange: set('plaintiff'), placeholder: 'الاسم بالكامل' }),
                React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                    React.createElement(Inp, { label: 'الرقم القومي', value: form.plaintiff_national_id, onChange: set('plaintiff_national_id'), placeholder: '14 رقم' }),
                    React.createElement(Inp, { label: 'رقم التوكيل', value: form.plaintiff_power_of_attorney, onChange: set('plaintiff_power_of_attorney'), placeholder: 'رقم التوكيل' })
                ),

                // المدعى عليه
                React.createElement(SectionTitle, null, '👤 المدعى عليه'),
                React.createElement(Inp, { label: 'اسم المدعى عليه', value: form.defendant, onChange: set('defendant'), placeholder: 'الاسم بالكامل' }),
                React.createElement(Inp, { label: 'الرقم القومي', value: form.defendant_national_id, onChange: set('defendant_national_id'), placeholder: '14 رقم' }),

                // تفاصيل الجلسة
                React.createElement(SectionTitle, null, '📝 تفاصيل الجلسة'),
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-[10px] font-bold text-slate-400 mb-1.5' }, 'ما جرى في الجلسة'),
                    React.createElement('textarea', {
                        value: form.description,
                        onChange: set('description'),
                        placeholder: 'ملاحظات أو وصف...',
                        rows: 2,
                        className: 'w-full p-3 text-xs rounded-xl border border-white/10 bg-premium-bg text-white placeholder-slate-600 resize-none',
                        style: { fontFamily: 'Cairo,sans-serif' }
                    })
                ),
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-[10px] font-bold text-slate-400 mb-1.5' }, 'النتيجة'),
                    React.createElement('textarea', {
                        value: form.result,
                        onChange: set('result'),
                        placeholder: 'نتيجة الجلسة...',
                        rows: 2,
                        className: 'w-full p-3 text-xs rounded-xl border border-white/10 bg-premium-bg text-white placeholder-slate-600 resize-none',
                        style: { fontFamily: 'Cairo,sans-serif' }
                    })
                ),
                React.createElement(Inp, {
                    label: 'الإجراء القادم',
                    value: form.next_action,
                    onChange: set('next_action'),
                    placeholder: 'مثال: تقديم مذكرة دفاع'
                }),

                // مسافة في الأسفل
                React.createElement('div', { className: 'h-4' })
            ),

            // ── Footer ──
            React.createElement('div', {
                className: 'px-5 py-4 border-t border-white/5 flex gap-3'
            },
                React.createElement('button', {
                    onClick: onClose,
                    className: 'flex-1 py-3 rounded-2xl text-xs font-bold text-slate-400 bg-white/5 hover:bg-white/10 transition-all'
                }, 'إلغاء'),
                React.createElement('button', {
                    onClick: handleSave,
                    disabled: saving || !form.session_date,
                    className: 'flex-2 flex-grow-[2] py-3 rounded-2xl text-xs font-black text-premium-bg transition-all disabled:opacity-40',
                    style: { background: saving ? '#888' : 'linear-gradient(135deg,#d4af37,#f0c040)' }
                }, saving ? '⏳ جاري الحفظ...' : '✅ حفظ الجلسة')
            )
        )
    );

    return createPortal(modal, document.body);
}
