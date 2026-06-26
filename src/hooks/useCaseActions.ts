import { useCallback } from 'react';
import { toast, escapeTelegramHtml, validateUploadFile } from '../utils';
import { db } from '../supabaseClient';

export function useCaseActions(db: any, sendTelegram: any, fetchCases: any, profile: any, cases: any[], lawyers: any[], clients: any[]) {
    const handleLogout=async()=>{
        await db.auth.signOut();
        setCases([]);setLawyers([]);setClients([]);setProfile(null);setAuthUser(null);
    };

    // ─ حفظ موكل ─
    const handleSaveClient=async(form,idFile,poaFile)=>{
        setSavingClient(true);
        // رفع الصور على Storage (يحتاج نت — مش بنحفظه offline)
        let idUrl=null, poaUrl=null;
        if(navigator.onLine){
            const uploadFile=async(file,prefix)=>{
                // ⚠️ فحص نوع وحجم الملف قبل الرفع — راجع validateUploadFile في utils.ts.
                const validationError = validateUploadFile(file);
                if (validationError) { toast('❌ ' + validationError, true); return null; }
                const ext=file.name.split('.').pop();
                const path=`${prefix}_${Date.now()}.${ext}`;
                const{error}=await db.storage.from('client-docs').upload(path,file,{upsert:true});
                if(error)return null;
                const{data}=db.storage.from('client-docs').getPublicUrl(path);
                return data.publicUrl;
            };
            if(idFile)idUrl=await uploadFile(idFile,'id');
            if(poaFile)poaUrl=await uploadFile(poaFile,'poa');
        }

        const payload = {
            client_name:form.full_name,
            client_type:form.type||'individual',
            phone:form.phone||null,
            email:form.email||null,
            notes:form.notes||null,
            national_id:form.national_id||null,
            cr_number:form.cr_number||null,
            contact_info:{id_url:idUrl,poa_url:poaUrl}
        };

        const {error, offline, queued} = await window.__dbWrite({
            type:'INSERT', table:'clients', data:payload
        });
        setSavingClient(false);

        if(offline && queued){
            toast('📥 الموكل محفوظ محلياً — سيُضاف فور عودة الإنترنت');
            // إضافة مؤقتة في الـ state المحلي
            setClients(prev=>[{...payload, id:'offline-'+Date.now(), full_name:form.full_name}, ...prev]);
        } else if(error){
            toast('❌ فشل الحفظ، يرجى المحاولة مرة أخرى', true);
            return;
        } else {
            toast('✅ تم إضافة الموكل بنجاح!');
            // إشعار تليجرام - موكل جديد
            const typeLabel = form.type==='company'?'شركة':form.type==='government'?'جهة حكومية':'فرد';
            let clientMsg=`👤 <b>موكل جديد تمت إضافته</b>\n`;
            clientMsg+=`━━━━━━━━━━━━━━━━━━━━\n`;
            clientMsg+=`👤 <b>الاسم:</b> ${escapeTelegramHtml(form.full_name)}\n`;
            clientMsg+=`🏷 <b>النوع:</b> ${typeLabel}\n`;
            if(form.phone)      clientMsg+=`📞 <b>الهاتف:</b> ${escapeTelegramHtml(form.phone)}\n`;
            if(form.email)      clientMsg+=`📧 <b>الإيميل:</b> ${escapeTelegramHtml(form.email)}\n`;
            if(form.national_id)clientMsg+=`🪪 <b>الرقم القومي:</b> ${escapeTelegramHtml(form.national_id)}\n`;
            if(form.cr_number)  clientMsg+=`🏢 <b>السجل التجاري:</b> ${escapeTelegramHtml(form.cr_number)}\n`;
            if(form.notes)      clientMsg+=`📝 <b>ملاحظات:</b> ${escapeTelegramHtml(form.notes)}\n`;
            sendTelegram(clientMsg);
            fetchClients(0,clientSearch);
        }
        setShowClientModal(false);
    };

    // ─ حفظ قضية ─
    const handleSaveCase=async(form)=>{
        setSavingCase(true);
        const payload = {
            case_number_official:form.number||null,
            title:form.title,
            court_name:form.court,
            case_type:form.type,
            status:'نشطة',
            client_id:form.client_id||null,
            plaintiff:form.plaintiff||null,
            defendant:form.defendant||null,
            court_level:form.court_level||null,
            circuit_number:form.circuit_number||null,
            next_hearing:form.date||null,
            session_hall:form.session_hall||null,
            secretary_hall:form.secretary_hall||null,
            secretary_name:form.secretary_name||null,
        };
        const {data:newCase, error, offline, queued} = await window.__dbWrite({
            type:'INSERT', table:'cases', data:payload, returning:true
        });
        if(offline && queued){
            toast('📥 محفوظة محلياً — ستُضاف فور عودة الإنترنت');
            setCases(prev=>[{...payload, id:'offline-'+Date.now(), ...form, status:'نشطة', date:form.date||'—'}, ...prev]);
        } else if(error){
            toast('❌ فشل الحفظ، يرجى المحاولة مرة أخرى', true);
            setSavingCase(false);
            return;
        } else {
            // ── تسجيل الجلسة الأولى في case_sessions لو فيه تاريخ ──
            // __dbWrite لا يرجع id الصف المُدرج، فنجيبه بإعادة استعلام بأحدث قضية بنفس العنوان
            let newCaseId: string | null = null;
            if(form.date){
                const { data: inserted } = await db.from('cases')
                    .select('id')
                    .eq('title', form.title)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                newCaseId = inserted?.id || null;
            }
            if(form.date && newCaseId){
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
            }
            toast('✅ تم تقييد الدعوى في السيرفر السحابي!');
            // إشعار تليجرام
            const caseNumLabel = form.caseNum && form.caseYear
                ? `${form.caseNum} لسنة ${form.caseYear}`
                : (form.number || '—');
            let caseMsg=`⚖️ <b>قضية جديدة تم تقييدها</b>\n`;
            caseMsg+=`━━━━━━━━━━━━━━━━━━━━\n`;
            caseMsg+=`📋 <b>رقم القيد:</b> ${escapeTelegramHtml(caseNumLabel)}\n`;
            caseMsg+=`📌 <b>الموضوع:</b> ${escapeTelegramHtml(form.title)}\n`;
            caseMsg+=`🏛 <b>المحكمة:</b> ${escapeTelegramHtml(form.court||'—')}\n`;
            caseMsg+=`📂 <b>التصنيف:</b> ${escapeTelegramHtml(form.type||'—')}\n`;
            if(form.plaintiff) caseMsg+=`🟢 <b>المدعي:</b> ${escapeTelegramHtml(form.plaintiff)}\n`;
            if(form.defendant) caseMsg+=`🔴 <b>المدعى عليه:</b> ${escapeTelegramHtml(form.defendant)}\n`;
            if(form.date)      caseMsg+=`📆 <b>أقرب جلسة:</b> ${escapeTelegramHtml(form.date)}\n`;
            sendTelegram(caseMsg);
            fetchCases(0,casesFilter);
        }
        setSavingCase(false);
        setShowCaseModal(false);
    };

    // ─ حذف قضية — آمن ─
    const handleDeleteCase=async(caseId)=>{
        const c = cases.find(x=>x.id===caseId);
        setDeleteConfirm({
            type:'case', id:caseId,
            name: c?.title||'القضية',
            itemType:'القضية',
            title:'حذف القضية نهائياً',
            onConfirm: async()=>{
                const{error}=await db.from('cases').delete().eq('id',caseId);
                nav.closeModal('delete'); _setDeleteConfirm(null);
                if(error){toast('❌ فشل الحذف، يرجى المحاولة مرة أخرى', true);return;}
                toast('🗑 تم حذف القضية نهائياً');
                _setSelectedCase(null);
                setCases(prev=>prev.filter(c=>c.id!==caseId));
            }
        });
    };

    // ─ تعديل قضية ─

  return { handleLogout, handleSaveCase, handleDeleteCase, handleUpdateCase };
}
