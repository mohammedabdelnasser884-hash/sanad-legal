import React, { useState, useCallback } from 'react';
import { toast } from '../../utils';

export function useAdminBackup(db: any, profile?: any) {
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [restoringBackup, setRestoringBackup] = useState(false);

  const fetchBackups = useCallback(async () => {
    setLoadingBackups(true);
    const { data } = await db.from('backups')
      .select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setBackups(data);
    setLoadingBackups(false);
  }, [db]);

  // ── إنشاء نسخة احتياطية ──
  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    const tables = ['cases','clients','profiles','case_sessions','case_fees','fee_payments','case_documents','client_portal_pins','activity_log'];
    const snapshot = { version: '1.0', created_at: new Date().toISOString(), tables: {} };

    for (const table of tables) {
      setBackupProgress('جاري تصدير: ' + table + '...');
      try {
        const { data } = await db.from(table).select('*');
        snapshot.tables[table] = data || [];
      } catch(e) {
        snapshot.tables[table] = [];
      }
    }

    setBackupProgress('جاري الحفظ...');
    const totalRows = Object.values(snapshot.tables).reduce((s: number, t: unknown)=>s+(t as any[]).length, 0);
    const sizeKb = Math.round(JSON.stringify(snapshot).length / 1024);

    const { error } = await db.from('backups').insert([{
      created_by: profile?.id,
      created_by_name: profile?.full_name || 'مدير',
      tables_count: tables.length,
      rows_count: totalRows,
      size_kb: sizeKb,
      data: snapshot,
    }]);

    setCreatingBackup(false);
    setBackupProgress('');
    if (error) { toast('❌ فشل حفظ النسخة الاحتياطية', true); return; }
    toast('✅ تم إنشاء النسخة الاحتياطية بنجاح');
    fetchBackups();
  };

  // ── تنزيل نسخة ──
  const handleDownloadBackup = (backup) => {
    const json = JSON.stringify(backup.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `sanad-backup-${new Date(backup.created_at).toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📥 جاري التنزيل...');
  };

  // ── استعادة نسخة ──
  const handleRestoreBackup = async (backup) => {
    setRestoringBackup(true);
    const snapshot = backup.data;
    const restoreOrder = ['clients','cases','profiles','case_sessions','case_fees','fee_payments','case_documents','client_portal_pins'];
    let restored = 0;
    for (const table of restoreOrder) {
      const rows = snapshot?.tables?.[table];
      if (!rows || rows.length === 0) continue;
      try {
        await db.from(table).upsert(rows, { ignoreDuplicates: false });
        restored++;
      } catch(e) { /* تجاهل أخطاء جداول معينة */ }
    }
    setRestoringBackup(false);
    setConfirmRestore(null);
    toast(`✅ تمت الاستعادة — ${restored} جداول`);
  };

  return {
    backups, loadingBackups,
    creatingBackup, backupProgress,
    confirmRestore, setConfirmRestore,
    restoringBackup,
    fetchBackups, handleCreateBackup, handleDownloadBackup, handleRestoreBackup
  };
}
