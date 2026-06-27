import React, { useState, useCallback } from 'react';
import { toast, validateUploadFile, logActivity } from '../../utils';
import { db } from '../../supabaseClient';

export function useAdminOffice(tenantId: string | null, profile?: any) {
  const _userName = profile?.full_name || null;
  const [officeSettings, setOfficeSettings] = useState({
    officeName: '', officePhone: '', officeEmail: '', officeAddress: '',
    logoUrl: '', country: 'EG'
  });
  const [loadingOffice, setLoadingOffice] = useState(false);
  const [savingOffice, setSavingOffice] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchOfficeSettings = useCallback(async () => {
    if (!tenantId) return; // لسه مفيش tenant معروف — متجيب حاجة عشوائية
    setLoadingOffice(true);
    try {
      const { data } = await db.from('office_settings').select('*').eq('tenant_id', tenantId).limit(1).maybeSingle();
      if (data) {
        setOfficeSettings(s => ({ ...s, ...data }));
        if (data.logoUrl) setLogoPreview(data.logoUrl);
      }
    } catch(e) { /* الجدول غير موجود بعد */ }
    setLoadingOffice(false);
  }, [tenantId]);

  // ── حفظ إعدادات المكتب ──
  const handleSaveOfficeSettings = async () => {
    if (!tenantId) { toast('❌ لا يمكن الحفظ، تعذر تحديد المكتب الحالي', true); return; }
    setSavingOffice(true);
    try {
      // رفع الشعار لو في شعار جديد
      let logoUrl = officeSettings.logoUrl;
      if (logoFile) {
        // ⚠️ فحص نوع وحجم الملف قبل الرفع — راجع validateUploadFile في utils.ts.
        const validationError = validateUploadFile(logoFile);
        if (validationError) {
          toast('❌ ' + validationError, true);
          setSavingOffice(false);
          return;
        }
        const ext = logoFile.name.split('.').pop();
        const path = `office/logo.${ext}`;
        const { error: upErr } = await db.storage.from('client-docs').upload(path, logoFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = db.storage.from('client-docs').getPublicUrl(path);
          logoUrl = urlData.publicUrl;
        }
      }
      const { data: existing } = await db.from('office_settings').select('id').eq('tenant_id', tenantId).limit(1).maybeSingle();
      const payload = {
        name:           officeSettings.name           || '',
        slogan:         officeSettings.slogan         || '',
        logo_url:       logoUrl                       || '',
        brand_color:    officeSettings.brandColor     || '#D4AF37',
        accent_color:   officeSettings.accentColor    || '#1e3a5f',
        phone:          officeSettings.phone          || '',
        phone2:         officeSettings.phone2         || '',
        email:          officeSettings.email          || '',
        website:        officeSettings.website        || '',
        whatsapp:       officeSettings.whatsapp       || '',
        address:        officeSettings.address        || '',
        city:           officeSettings.city           || '',
        facebook:       officeSettings.facebook       || '',
        instagram:      officeSettings.instagram      || '',
        tax_number:     officeSettings.taxNumber      || '',
        license_number: officeSettings.licenseNumber  || '',
        bank_name:      officeSettings.bankName       || '',
        bank_iban:      officeSettings.bankIban       || '',
        invoice_prefix: officeSettings.invoicePrefix  || 'INV-',
        invoice_footer: officeSettings.invoiceFooter  || '',
      };
      let saveError;
      if (existing?.id) {
        ({ error: saveError } = await db.from('office_settings').update(payload).eq('id', existing.id));
      } else {
        ({ error: saveError } = await db.from('office_settings').insert({ ...payload, tenant_id: tenantId }));
      }
      if (saveError) throw saveError;
      setOfficeSettings(s => ({ ...s, logoUrl }));
      setLogoFile(null);
      toast('✅ تم حفظ إعدادات المكتب');
      logActivity(db, 'تعديل إعدادات المكتب', { userName: _userName, entity_type: 'office', details: payload.name || null });
    } catch(e: any) {
      toast('❌ خطأ في الحفظ: ' + (e?.message || String(e)), true);
    }
    setSavingOffice(false);
  };

  return {
    officeSettings, setOfficeSettings,
    loadingOffice, savingOffice,
    logoFile, setLogoFile,
    logoPreview, setLogoPreview,
    fetchOfficeSettings, handleSaveOfficeSettings
  };
}
