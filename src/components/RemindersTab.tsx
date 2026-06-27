import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast, safeUpdate, logActivity } from '../utils';
import { recordError, recordSuccess } from '../systemHealth';
import { Inp } from './shared';
import DatePicker from './DatePicker';
import { createPortal } from 'react-dom';
import { db } from '../supabaseClient';
import { I, COUNTRY_CONFIGS } from '../constants';


function RemindersTab({initialFilter}){
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showForm, setShowForm]   = useState(false);
    const [form, setForm]           = useState({title:'', due_date:'', notes:''});
    const [saving, setSaving]       = useState(false);
    const [editTarget, setEditTarget]   = useState(null);
    const [editForm, setEditForm]       = useState({title:'', due_date:'', notes:''});
    const [editSaving, setEditSaving]   = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string|null>(null);  // BUG-15 FIX

    const fetchReminders = useCallback(async () => {
        setLoading(true);
        const {data, error} = await db.from('reminders').select('*').order('due_date',{ascending:true});
        if(error){ recordError('db_reminders', error.message); }
        else { recordSuccess('db_reminders'); }
        setReminders(data||[]);
        setLoading(false);
    }, []);
    useEffect(()=>{ fetchReminders(); },[fetchReminders]);

    const handleSave = async () => {
        if(!form.title||!form.due_date){ toast('يرجى إدخال العنوان والتاريخ',true); return; }
        setSaving(true);
        const {error} = await db.from('reminders').insert([{
            title: form.title.trim(),
            due_date: form.due_date,
            notes: form.notes||null,
            done: false
        }]);
        setSaving(false);
        if(error){
            recordError('reminder_save', error.message, {label:'حفظ التذكيرات', message:'تعذّر حفظ التذكير. تحقق من الاتصال بالإنترنت.'});
            toast('❌ حدث خطأ، يرجى المحاولة مرة أخرى', true);
            return;
        }
        toast('✅ تم إضافة التذكير');
        logActivity(db, 'إضافة تذكير', { entity_type: 'reminder', details: form.title.trim() });
        setShowForm(false); setForm({title:'',due_date:'',notes:''});
        fetchReminders();
    };

    const handleToggleDone = async (r) => {
        // toggle بسيط — مش محتاج conflict check قوي بس نستخدم safeUpdate للاتساق
        const {success, error} = await safeUpdate(db, 'reminders', r.id, {done:!r.done}, r.updated_at || null);
        if(!success){
            recordError('reminder_save', error?.message, {label:'حفظ التذكيرات', message:'تعذّر تحديث التذكير. تحقق من الاتصال بالإنترنت.'});
            toast('❌ تعذّر تحديث التذكير',true);
        }
        fetchReminders();
    };

    const handleDelete = async (id) => {
        const {error} = await db.from('reminders').delete().eq('id',id);
        if(error){
            recordError('reminder_save', error.message, {label:'حذف التذكيرات', message:'تعذّر حذف التذكير. تحقق من الاتصال بالإنترنت.'});
            toast('❌ تعذّر حذف التذكير',true);
            return;
        }
        toast('🗑 تم حذف التذكير');
        logActivity(db, 'حذف تذكير', { entity_type: 'reminder', entity_id: id });
        fetchReminders();
    };

    const handleEdit = async () => {
        if(!editForm.title||!editForm.due_date){ toast('يرجى إدخال العنوان والتاريخ',true); return; }
        setEditSaving(true);
        const { success, conflict } = await safeUpdate(db, 'reminders', editTarget.id, {
            title: editForm.title.trim(),
            due_date: editForm.due_date,
            notes: editForm.notes||null,
        }, editTarget.updated_at || null);
        setEditSaving(false);
        if(conflict) return;
        if(!success){
            recordError('reminder_save', '', {label:'حفظ التذكيرات', message:'تعذّر تعديل المهمة. تحقق من الاتصال بالإنترنت.'});
            toast('❌ حدث خطأ، يرجى المحاولة مرة أخرى', true);
            return;
        }
        toast('✅ تم تعديل المهمة');
        logActivity(db, 'تعديل تذكير', { entity_type: 'reminder', entity_id: editTarget?.id, details: editForm.title.trim() });
        setEditTarget(null);
        fetchReminders();
    };

    const today = new Date();
    const todayStr = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');

    const pending  = reminders.filter(r=>!r.done);
    const done     = reminders.filter(r=>r.done);
    const overdue  = pending.filter(r=>r.due_date < todayStr);
    const upcoming = pending.filter(r=>r.due_date >= todayStr);

    const ReminderCard = ({r}) => {
        const isOverdue = !r.done && r.due_date < todayStr;
        const isToday   = r.due_date === todayStr;
        return React.createElement('div',{
            className:`bg-premium-card border rounded-xl px-3 py-2.5 ${r.done?'opacity-50 border-white/5':isOverdue?'border-rose-500/30':isToday?'border-amber-500/30':'border-white/5'}`
        },
            React.createElement('div',{className:"flex items-center gap-2.5"},
                // زر التأشير
                React.createElement('button',{
                    onClick:()=>handleToggleDone(r),
                    className:`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-90 ${r.done?'bg-emerald-500 border-emerald-500 text-white':isOverdue?'border-rose-400 hover:bg-rose-400/20':'border-white/20 hover:border-premium-gold'}`
                }, r.done&&React.createElement(I.Check,{className:"w-3 h-3"})),
                // المحتوى
                React.createElement('div',{className:"flex-1 min-w-0"},
                    React.createElement('p',{className:`text-[11px] font-black leading-tight truncate ${r.done?'line-through text-slate-500':'text-white'}`},r.title),
                    React.createElement('div',{className:"flex items-center gap-1.5 mt-0.5"},
                        React.createElement('span',{className:`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${r.done?'bg-white/5 text-slate-500':isOverdue?'bg-rose-500/15 text-rose-400':isToday?'bg-amber-500/15 text-amber-400':'bg-blue-500/10 text-blue-400'}`},
                            r.done?'✅ منجز':isOverdue?'⚠️ متأخر':isToday?'🔔 اليوم':'📅 '+r.due_date
                        ),
                        r.notes && React.createElement('span',{className:"text-[9px] text-slate-500 truncate"},r.notes)
                    )
                ),
                // زر تعديل
                React.createElement('button',{
                    onClick:()=>{ setEditTarget(r); setEditForm({title:r.title,due_date:r.due_date,notes:r.notes||''}); },
                    className:"w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-premium-gold hover:bg-white/10 active:scale-90 shrink-0"
                },React.createElement(I.Edit,{className:"w-3 h-3"})),
                // زر حذف
                React.createElement('button',{
                    onClick:()=>setConfirmDeleteId(r.id),
                    className:"w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 active:scale-90 shrink-0"
                },React.createElement(I.Trash,{className:"w-3 h-3"}))
            )
        );
    };

    const [filter, setFilter] = useState(initialFilter || 'upcoming');
    const [visibleCount, setVisibleCount] = useState(15);

    const pillSections = [
        {
            key: 'upcoming',
            label: 'قادمة',
            emoji: '📅',
            data: upcoming,
            activeBg: 'bg-blue-500/20 border-blue-500/40',
            activeText: 'text-blue-300',
            countBg: 'bg-blue-500/30 text-blue-200',
            emptyMsg: 'لا توجد مهام قادمة',
            emptyNote: 'المهام التي لم يحن موعدها بعد ستظهر هنا',
            emptyEmoji: '📅',
        },
        {
            key: 'overdue',
            label: 'متأخرة',
            emoji: '⚠️',
            data: overdue,
            activeBg: 'bg-rose-500/20 border-rose-500/40',
            activeText: 'text-rose-300',
            countBg: 'bg-rose-500/30 text-rose-200',
            emptyMsg: 'لا توجد مهام متأخرة',
            emptyNote: 'أنت في الموعد — استمر هكذا!',
            emptyEmoji: '🎯',
        },
        {
            key: 'done',
            label: 'منجزة',
            emoji: '✅',
            data: done,
            activeBg: 'bg-emerald-500/20 border-emerald-500/40',
            activeText: 'text-emerald-300',
            countBg: 'bg-emerald-500/30 text-emerald-200',
            emptyMsg: 'لا توجد مهام منجزة بعد',
            emptyNote: 'المهام التي أتممتها ستُحفظ هنا',
            emptyEmoji: '✅',
        },
    ];

    const activeSection = pillSections.find(s => s.key === filter)!;

    // مودال تأكيد الحذف (BUG-15 FIX)
    const ConfirmDeleteModal = confirmDeleteId && React.createElement('div',{
        className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4",
        onClick:()=>setConfirmDeleteId(null)
    },
        React.createElement('div',{
            className:"bg-premium-card border border-rose-500/20 rounded-2xl p-5 max-w-xs w-full space-y-4",
            onClick:e=>e.stopPropagation()
        },
            React.createElement('div',{className:"flex items-center gap-3"},
                React.createElement('div',{className:"w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl shrink-0"},"🗑"),
                React.createElement('div',null,
                    React.createElement('p',{className:"text-sm font-black text-white"},"حذف التذكير"),
                    React.createElement('p',{className:"text-[10px] text-slate-400 mt-0.5"},"لن يمكن التراجع عن هذا الإجراء.")
                )
            ),
            React.createElement('div',{className:"flex gap-2"},
                React.createElement('button',{
                    onClick:()=>{ handleDelete(confirmDeleteId); setConfirmDeleteId(null); },
                    className:"flex-1 py-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-black active:scale-95"
                },"نعم، احذف"),
                React.createElement('button',{
                    onClick:()=>setConfirmDeleteId(null),
                    className:"flex-1 py-2.5 bg-white/5 text-slate-400 rounded-xl text-xs font-bold active:scale-95"
                },"إلغاء")
            )
        )
    );

    // مودال التعديل
    const EditModal = editTarget && React.createElement('div',{
        className:"fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm",
        onClick:e=>{ if(e.target===e.currentTarget) setEditTarget(null); }
    },
        React.createElement('div',{className:"bg-premium-card w-full max-w-lg rounded-t-3xl border-t border-white/10 p-6 pb-10 shadow-2xl slide-up"},
            React.createElement('div',{className:"w-10 h-1 bg-white/20 rounded-full mx-auto mb-5"}),
            React.createElement('div',{className:"flex items-center justify-between mb-4"},
                React.createElement('h3',{className:"text-sm font-black text-white flex items-center gap-2"},
                    React.createElement('span',{className:"w-1 h-4 bg-premium-gold rounded-full"}),
                    "تعديل المهمة"
                ),
                React.createElement('button',{onClick:()=>setEditTarget(null),className:"w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400"},"✕")
            ),
            React.createElement('div',{className:"space-y-3"},
                React.createElement(Inp,{label:"عنوان المهمة",value:editForm.title,onChange:e=>setEditForm(p=>({...p,title:e.target.value})),placeholder:"عنوان المهمة",required:true}),
                React.createElement(DatePicker,{label:"تاريخ المهمة",value:editForm.due_date,onChange:v=>setEditForm(p=>({...p,due_date:v})),required:true}),
                React.createElement(Inp,{label:"ملاحظات",value:editForm.notes,onChange:e=>setEditForm(p=>({...p,notes:e.target.value})),placeholder:"تفاصيل إضافية..."}),
                React.createElement('button',{
                    onClick:handleEdit, disabled:editSaving,
                    className:"w-full py-3 bg-gradient-to-tr from-premium-gold to-amber-200 text-premium-bg rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
                }, editSaving?React.createElement(I.Spin):React.createElement(I.Check), "حفظ التعديلات")
            )
        )
    );

    return React.createElement(React.Fragment,null,
    ConfirmDeleteModal,
    EditModal,
    React.createElement('div',{className:"space-y-4 fade-in"},

        // زر إضافة
        React.createElement('button',{
            onClick:()=>setShowForm(!showForm),
            className:"w-full py-3 border border-dashed border-purple-500/30 rounded-2xl flex items-center justify-center gap-2 text-purple-400 text-xs font-black hover:bg-purple-500/5 transition-all active:scale-[0.98]"
        }, React.createElement(I.Plus), "إضافة تذكير جديد"),

        // فورم
        showForm && React.createElement('div',{className:"bg-premium-card border border-purple-500/20 rounded-2xl p-4 space-y-3 slide-up"},
            React.createElement('h4',{className:"text-xs font-black text-purple-400"},"🔔 تذكير جديد"),
            React.createElement(Inp,{label:"عنوان التذكير",value:form.title,onChange:e=>setForm(p=>({...p,title:e.target.value})),placeholder:"مثال: تقديم مذكرة دفاع...",required:true}),
            React.createElement(DatePicker,{label:"تاريخ التذكير",value:form.due_date,onChange:v=>setForm(p=>({...p,due_date:v})),required:true}),
            React.createElement(Inp,{label:"ملاحظات",value:form.notes,onChange:e=>setForm(p=>({...p,notes:e.target.value})),placeholder:"تفاصيل إضافية..."}),
            React.createElement('div',{className:"flex gap-2"},
                React.createElement('button',{onClick:handleSave,disabled:saving,className:"flex-1 py-2.5 bg-gradient-to-tr from-purple-600 to-purple-400 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"},
                    saving?React.createElement(I.Spin):React.createElement(I.Check),"حفظ"),
                React.createElement('button',{onClick:()=>setShowForm(false),className:"px-4 py-2.5 bg-white/5 text-slate-400 rounded-xl text-xs font-bold active:scale-95"},"إلغاء")
            )
        ),

        // Pill Selector
        React.createElement('div',{className:"flex items-center bg-white/5 rounded-2xl p-1 gap-1"},
            pillSections.map(s => {
                const isActive = filter === s.key;
                return React.createElement('button',{
                    key: s.key,
                    onClick: ()=>{setFilter(s.key);setVisibleCount(15);},
                    className:`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all active:scale-95 ${
                        isActive ? s.activeBg+' shadow-sm' : 'text-slate-500 hover:text-slate-300'
                    }`
                },
                    React.createElement('span',{className:"text-sm leading-none"},s.emoji),
                    React.createElement('span',{className:`text-[11px] font-black ${isActive?s.activeText:'text-slate-400'}`},s.label),
                    React.createElement('span',{
                        className:`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive?s.countBg:'bg-white/8 text-slate-500'}`
                    }, s.data.length)
                );
            })
        ),

        // المحتوى
        loading
            ? React.createElement('div',{className:"flex items-center justify-center py-10 gap-2 text-slate-500 text-xs"},React.createElement(I.Spin))
            : activeSection.data.length === 0
                ? React.createElement('div',{className:"bg-premium-card border border-white/5 rounded-2xl px-5 py-10 text-center space-y-2"},
                    React.createElement('p',{className:"text-3xl mb-1"},activeSection.emptyEmoji),
                    React.createElement('p',{className:`text-xs font-black ${activeSection.activeText}`},activeSection.emptyMsg),
                    React.createElement('p',{className:"text-[10px] text-slate-600 leading-relaxed mt-1"},activeSection.emptyNote)
                  )
                : React.createElement('div',{className:"space-y-3"},
                    activeSection.data.slice(0,visibleCount).map(r=>React.createElement(ReminderCard,{key:r.id,r})),
                    activeSection.data.length > visibleCount && React.createElement('button',{
                        onClick:()=>setVisibleCount(v=>v+15),
                        className:"w-full py-3 rounded-2xl text-xs font-black active:scale-[0.98] transition-all flex items-center justify-center gap-2",
                        style:{background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.18)',color:'#a78bfa'}
                    },
                        React.createElement('span',{className:"text-base"},"⬇️"),
                        "تحميل المزيد",
                        React.createElement('span',{
                            className:"text-[9px] px-2 py-0.5 rounded-full font-black",
                            style:{background:'rgba(167,139,250,0.12)',color:'#a78bfa'}
                        }, `${activeSection.data.length - visibleCount} تذكير`)
                    )
                  )
    ));
}


export default RemindersTab;
