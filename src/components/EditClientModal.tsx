import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../supabaseClient';
import { I, COUNTRY_CONFIGS } from '../constants';
import { Inp, Sel } from './shared';

function EditClientModal({client:c, onClose, onSave}){
    const [form, setForm] = useState({
        full_name: c.full_name || '',
        type: c.client_type || 'individual',
        phone: c.phone || '',
        phone2: c.phone2 || '',
        email: c.email || '',
        address: c.address || '',
        notes: c.notes || '',
        national_id: c.national_id || '',
        cr_number: c.cr_number || '',
        kin_name: c.kin_name || '',
        kin_phone: c.kin_phone || '',
    });
    const s = (k,v) => setForm(p=>({...p,[k]:v}));

    return createPortal(
      React.createElement('div', {
        className: "fixed inset-0 z-[70] flex items-end justify-center bg-black/80 backdrop-blur-sm",
        onClick: e => { if(e.target === e.currentTarget) onClose(); }
      },
      React.createElement('div', {className: "bg-premium-card w-full max-w-lg rounded-t-3xl border-t border-white/10 p-6 pb-10 shadow-2xl slide-up max-h-[90vh] overflow-y-auto no-scrollbar"},
        React.createElement('div', {className: "w-10 h-1 bg-white/20 rounded-full mx-auto mb-5"}),
        React.createElement('div', {className: "flex items-center justify-between mb-5"},
            React.createElement('h3', {className: "text-sm font-black text-white flex items-center gap-2"},
                React.createElement('span', {className: "w-1 h-4 bg-emerald-400 rounded-full"}),
                "تعديل بيانات الموكل"
            ),
            React.createElement('button', {onClick: onClose, className: "w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400"}, "✕")
        ),
        React.createElement('div', {className: "space-y-4"},
            React.createElement(Inp, {label:"الاسم الكامل", value:form.full_name, onChange:e=>s('full_name',e.target.value), placeholder:"اسم الموكل", required:true}),
            React.createElement('div', {className: "grid grid-cols-2 gap-3"},
                React.createElement(Sel, {label:"نوع الموكل", value:form.type, onChange:e=>s('type',e.target.value), options:[
                    {value:'individual',label:'فرد'},
                    {value:'company',label:'شركة'},
                    {value:'government',label:'جهة حكومية'}
                ]}),
                React.createElement(Inp, {label:"رقم الهاتف", value:form.phone, onChange:e=>s('phone',e.target.value), placeholder:"05xxxxxxxx"})
            ),
            React.createElement('div', {className: "grid grid-cols-2 gap-3"},
                React.createElement(Inp, {label:"رقم هاتف ثاني", value:form.phone2, onChange:e=>s('phone2',e.target.value), placeholder:"رقم بديل"}),
                React.createElement(Inp, {label:"العنوان", value:form.address, onChange:e=>s('address',e.target.value), placeholder:"العنوان التفصيلي"})
            ),
            React.createElement(Inp, {label:"البريد الإلكتروني", type:"email", value:form.email, onChange:e=>s('email',e.target.value), placeholder:"client@email.com"}),
            React.createElement('div', {className: "grid grid-cols-2 gap-3"},
                React.createElement(Inp, {label:"الرقم القومي", value:form.national_id, onChange:e=>s('national_id',e.target.value), placeholder:"14 رقم"}),
                React.createElement(Inp, {label:"رقم التوكيل", value:form.cr_number, onChange:e=>s('cr_number',e.target.value), placeholder:"2024/أ/1234"})
            ),

            // فاصل قريب الدرجة الأولى
            React.createElement('div', {className: "border-t border-white/5 pt-2"},
                React.createElement('p', {className: "text-[10px] font-black text-blue-400/80 mb-3"}, "— قريب الدرجة الأولى —")
            ),
            React.createElement('div', {className: "grid grid-cols-2 gap-3"},
                React.createElement(Inp, {label:"اسم القريب", value:form.kin_name, onChange:e=>s('kin_name',e.target.value), placeholder:"الاسم الكامل"}),
                React.createElement(Inp, {label:"هاتف القريب", value:form.kin_phone, onChange:e=>s('kin_phone',e.target.value), placeholder:"05xxxxxxxx"})
            ),
            React.createElement('div', null,
                React.createElement('label', {className: "block text-[10px] font-bold text-slate-400 mb-1.5"}, "ملاحظات"),
                React.createElement('textarea', {
                    value:form.notes, onChange:e=>s('notes',e.target.value),
                    placeholder:"ملاحظات إضافية...", rows:3,
                    className:"w-full p-3 text-xs rounded-xl border border-white/10 bg-premium-bg text-white placeholder-slate-600 resize-none transition-colors",
                    style:{fontFamily:'Cairo,sans-serif'}
                })
            ),
            React.createElement('button', {
                onClick: () => { if(!form.full_name){return;} onSave(form); },
                className: "w-full py-3.5 bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2"
            }, React.createElement(I.Check), "حفظ التعديلات")
        )
      )),
      document.body
    );
}

// ══════════════════════════════════════════
//  تقويم الجلسات الشهري
// ══════════════════════════════════════════

export default EditClientModal;
