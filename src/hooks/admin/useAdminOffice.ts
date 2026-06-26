import { useState, useCallback } from 'react';
import { toast, validateUploadFile } from '../../utils';

export function useAdminOffice(db: any) {
  const [officeSettings, setOfficeSettings] = useState({
    officeName: '', officePhone: '', officeEmail: '', officeAddress: '',
    logoUrl: '', country: 'EG'
  });
  const [loadingOffice, setLoadingOffice] = useState(false);
  const [savingOffice, setSavingOffice] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchOfficeSettings = useCallback(async () => {
    setLoadingOffice(true);
    try {
      const { data } = await db.from('office_settings').select('*').limit(1).single();
      if (data) {
        setOfficeSettings(s => ({ ...s, ...data }));
        if (data.logoUrl) setLogoPreview(data.logoUrl);
      }
    } catch(e) { /* الجدول غير موجود بعد */ }
    setLoadingOffice(false);
  }, [db]);

  // ── حفظ إعدادات المكتب ──
  const handleSaveOfficeSettings = async () => {
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
      const { data: existing } = await db.from('office_settings').select('id').limit(1).single();
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
        ({ error: saveError } = await db.from('office_settings').insert(payload));
      }
      if (saveError) throw saveError;
      setOfficeSettings(s => ({ ...s, logoUrl }));
      setLogoFile(null);
      toast('✅ تم حفظ إعدادات المكتب');
    } catch(e: any) {
      toast('❌ خطأ في الحفظ: ' + (e?.message || String(e)), true);
    }
    setSavingOffice(false);
  };

  // ── جلب سجل النشاط مع فلاتر ──
  const fetchActivity = useCallback(async (filters = activityFilters, page = activityPage) => {
    setLoadingActivity(true);
    try {
      let q = db.from('activity_log').select('*', { count: 'exact' });

      // فلتر المستخدم
      // بحث حر — Supabase ilike على حقول النص
      if (filters.search) {
        const s = '%' + filters.search + '%';
        q = q.or(`action.ilike.${s},details.ilike.${s},client_name.ilike.${s},case_name.ilike.${s},case_type.ilike.${s},user_name.ilike.${s}`);
      }

      const from = page * ACTIVITY_PAGE_SIZE;
      q = q.order('created_at', { ascending: false })
           .range(from, from + ACTIVITY_PAGE_SIZE - 1);

      const { data, count } = await q;
      if (data) setActivityLog(data);
      if (count !== null) setActivityTotal(count);
    } catch(e) { /* جدول غير موجود بعد */ }
    setLoadingActivity(false);
  }, [db, activityFilters, activityPage]);

  useEffect(() => {
    fetchPortalAccess();
    if (section === 'activity') fetchActivity(activityFilters, activityPage);
    if (section === 'backup')   fetchBackups();
    if (section === 'office')   fetchOfficeSettings();
    if (section === 'legal_library') { fetchLaws(); fetchLegalCategories(); }
  }, [section, activityFilters, activityPage]);

  // ── المكتبة القانونية: جلب التصنيفات ──
  const fetchLegalCategories = useCallback(async () => {
    try {
      const { data } = await db.from('legal_categories').select('*').order('name_ar');
      if (data) setLegalCategories(data);
    } catch(e) { /* الجدول غير موجود بعد */ }
  }, [db]);

  // ── المكتبة القانونية: جلب القوانين ──
  const fetchLaws = useCallback(async () => {
    setLoadingLaws(true);
    try {
      const { data } = await db.from('laws').select('*').order('created_at', { ascending: false });
      if (data) setLaws(data);
    } catch(e) { /* الجدول غير موجود بعد */ }
    setLoadingLaws(false);
  }, [db]);

  // ── المكتبة القانونية: إضافة / تعديل قانون ──
  const handleSaveLaw = async (form, file: File|null) => {

  return {
    officeSettings, setOfficeSettings,
    loadingOffice, savingOffice,
    logoFile, setLogoFile,
    logoPreview, setLogoPreview,
    fetchOfficeSettings, handleSaveOfficeSettings
  };
}
