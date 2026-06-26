import { useCallback } from 'react';
import { toast, validateUploadFile, escapeTelegramHtml, safeUpdate } from '../utils';
import { db } from '../supabaseClient';

export function useClientActions(db: any, sendTelegram: any, fetchClients: any, fetchLawyers: any, profile: any) {
    const handleUpdateCase=async(caseId,form)=>{
        try{
            const payload = {
                case_number_official:form.number||null,
                title:form.title,
                court_name:form.court||null,
                case_type:form.type||null,
                status:form.status||undefined,
                client_id:(form.client_id!==undefined ? form.client_id : cases.find(c=>c.id===caseId)?.client_id)||null,
                plaintiff:form.plaintiff||null,
                defendant:form.defendant||null,
                court_level:form.court_level||null,
                circuit_number:form.circuit_number||null,
                next_hearing:form.date||null,
                session_hall:form.session_hall||null,
                secretary_hall:form.secretary_hall||null,
                secretary_name:form.secretary_name||null,
            };
            const {error, offline, queued} = await window.__dbWrite({
                type:'UPDATE', table:'cases', data:payload, id:caseId
            });
            if(offline && queued){
                toast('📥 التعديل محفوظ محلياً — سيُزامن عند عودة الإنترنت');
                // تحديث فوري في الـ state المحلي
                setCases(prev=>prev.map(c=>c.id===caseId?{...c,...form}:c));
                if(selectedCase?.id===caseId) setSelectedCase(p=>({...p,...form}));
            } else if(error){
                toast('❌ فشل التعديل، يرجى المحاولة مرة أخرى', true);
                return;
            } else {
                // ── تسجيل جلسة جديدة لو تاريخ الجلسة تغيّر ──
                if(form.date){
                    const oldDate = (selectedCase?.date==='—' ? '' : selectedCase?.date) || '';
                    if(form.date !== oldDate){
                        const { data: existing } = await db.from('case_sessions')
                            .select('id')
                            .eq('case_id', caseId)
                            .eq('session_date', form.date)
                            .maybeSingle();
                        if(!existing){
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
                // تحديث فوري للحالة المحلية — عشان الشاشة المفتوحة (CaseDetailView) تعرض القيم الجديدة فورًا
                setCases(prev=>prev.map(c=>c.id===caseId?{...c,...form}:c));
                if(selectedCase?.id===caseId) setSelectedCase(p=>({...p,...form}));
                // إشعار تليجرام - تعديل قضية
                let updMsg=`✏️ <b>تم تعديل بيانات قضية</b>\n`;
                updMsg+=`━━━━━━━━━━━━━━━━━━━━\n`;
                updMsg+=`📋 <b>رقم القيد:</b> ${escapeTelegramHtml(form.number||'—')}\n`;
                updMsg+=`📌 <b>الموضوع:</b> ${escapeTelegramHtml(form.title)}\n`;
                updMsg+=`🏛 <b>المحكمة:</b> ${escapeTelegramHtml(form.court||'—')}\n`;
                if(form.plaintiff) updMsg+=`🟢 <b>المدعي:</b> ${escapeTelegramHtml(form.plaintiff)}\n`;
                if(form.defendant) updMsg+=`🔴 <b>المدعى عليه:</b> ${escapeTelegramHtml(form.defendant)}\n`;
                if(form.date)      updMsg+=`📆 <b>الجلسة القادمة:</b> ${escapeTelegramHtml(form.date)}\n`;
                sendTelegram(updMsg);
                fetchCases(0,casesFilter);
            }
        }catch(e){
            toast('❌ خطأ في الاتصال، تحقق من الإنترنت وأعد المحاولة',true);
        }
    };

    // ─ حذف موكل — آمن ─
    const handleDeleteClient=async(clientId)=>{
        const cl = clients.find(x=>x.id===clientId);
        setDeleteConfirm({
            type:'client', id:clientId,
            name: cl?.full_name||'الموكل',
            itemType:'الموكل',
            title:'حذف الموكل نهائياً',
            onConfirm: async()=>{
                const{error}=await db.from('clients').delete().eq('id',clientId);
                nav.closeModal('delete'); _setDeleteConfirm(null);
                if(error){toast('❌ فشل الحذف، يرجى المحاولة مرة أخرى', true);return;}
                toast('🗑 تم حذف الموكل نهائياً');
                _setSelectedClient(null);
                setClients(prev=>prev.filter(c=>c.id!==clientId));
            }
        });
    };

    // ─ تعديل موكل ─
    const handleUpdateClient=async(clientId,form)=>{
        // نجيب updated_at من الـ clients state
        const client = clients.find((c:any) => c.id === clientId);
        const { success, conflict } = await safeUpdate(db, 'clients', clientId, {
            client_name:form.full_name,
            client_type:form.type||'individual',
            phone:form.phone||null,
            email:form.email||null,
            notes:form.notes||null,
            national_id:form.national_id||null,
            cr_number:form.cr_number||null,
        }, client?.updated_at || null);
        if (conflict) return;
        if(!success){toast('❌ فشل التعديل',true);return;}
        toast('✅ تم تحديث بيانات الموكل');
        fetchClients(0,clientSearch);
        nav.closeModal('clientDetail'); _setSelectedClient(null);
    };

    // ─ إنشاء محامي جديد ─
    // إنشاء محامي جديد (عبر Edge Function — لا يؤثر على جلسة الأدمن الحالية)
    const handleSaveLawyer=async(form)=>{
        setSavingLawyer(true);
        try{
            await callAdminAction({
                action:'create_lawyer',
                email:form.email,
                password:form.password,
                full_name:form.full_name,
                role:form.role,
            });
            toast('✅ تم إنشاء حساب '+form.full_name+' بنجاح!');
            setShowLawyerModal(false);fetchLawyers();
        }catch(e){
            toast('❌ فشل إنشاء الحساب، يرجى المحاولة مرة أخرى', true);
        }
        setSavingLawyer(false);
    };

    // ──────────────────────────────────────
    //  حالة التحميل الأولي
    // ──────────────────────────────────────
    if(authLoading)return React.createElement('div',{
        className:"h-full flex flex-col items-center justify-center bg-premium-bg",
        style:{gap:0}
    },
        React.createElement('div',{
            style:{width:72,height:72,background:'#0B1320',borderRadius:17,display:'flex',
              alignItems:'center',justifyContent:'center',border:'1px solid rgba(212,175,55,0.2)',

  return { handleDeleteCase, handleSaveClient, handleDeleteClient, handleUpdateClient, handleSaveLawyer };
}
