import { useState, useCallback } from 'react';
import { toast } from '../../utils';

export function useAdminPortal(db: any) {
  const [portalAccess, setPortalAccess] = useState([]);
  const [portalClient, setPortalClient] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showAddPortalUser, setShowAddPortalUser] = useState(false);

  const fetchPortalAccess = useCallback(async () => {
    const { data } = await db.from('client_portal_pins').select('*');
    if (data) setPortalAccess(data);
  }, [db]);

  // ── جلب إعدادات المكتب ──
  const handleSavePortal = async (data) => {
    setSaving(true);
    const { error } = await db.from('client_portal_pins').upsert([{
      client_id: data.client_id,
      pin: data.pin,
      is_active: data.is_active,
      client_name: data.client_name,
      email: data.email,
    }], { onConflict: 'client_id' });
    setSaving(false);
    if (error) { toast('❌ حدث خطأ، يرجى المحاولة مرة أخرى', true); return; }
    toast('✅ تم حفظ إعدادات بوابة ' + data.client_name);
    setPortalClient(null);
    fetchPortalAccess();
  };


  return {
    portalAccess, portalClient, setPortalClient,
    clientSearch, setClientSearch,
    showAddPortalUser, setShowAddPortalUser,
    fetchPortalAccess, handleSavePortal
  };
}
