# خطة تنظيف `any` المتبقية — منصة سند
**التاريخ:** 14 يوليو 2026
**آخر تحديث:** 14 يوليو 2026 — المرحلة 4 خلصت بالكامل (18/18) 🎉، وبعدها اكتشاف مساحة إضافية من `any` (~205) برّه تعداد الخطة الأصلي — التفاصيل في آخر الملف
**الحالة الحالية:** المرحلة 2 خلصت بالكامل. المرحلة 3 خلصت بالكامل (11/11 دفعة) 🎉 المرحلة 4 خلصت بالكامل (18/18 ملف) 🎉 — ⚠️ اتكشفت مساحة جديدة (~205 `any`) برّه تعداد الخطة الأصلي، مستنية قرارك (شوف آخر الملف). المرحلة 5 (`App.tsx`/`main.tsx`) لسه مؤجلة عمدًا

---

## 0) الضمانة الأساسية — اقرأها قبل أي حاجة تانية

**هذا الشغل كله "تنظيف أنواع" (typing) — مش "إعادة هندسة" (refactoring).**

الفرق عملي ومهم:
- **بيتغيّر:** التعريف اللي فوق المتغير/الدالة (`: any` → `: CaseRow`)، وأماكن قليلة جدًا محتاجة `as SomeType` عشان الكومبايلر يفهم.
- **مبيتغيّرش أبدًا:** أي شرط (`if`)، أي حساب، أي ترتيب تنفيذ، أي استعلام لقاعدة البيانات، أي رسالة toast، أي منطق عمل. لو سطر منطق واحد اتغيّر، ده مش "تنظيف any" — ده تعديل تاني خالص وهيتقال بوضوح لوحده، مش هيتدس جوه دفعة تنظيف.

**الاستثناء الوحيد المسموح به:** لو التحقق من الأنواع كشف باگ حقيقي (زي الـ 3 اللي اتكشفوا في الجلسة اللي فاتت — `case_type`, `next_session`, `power_of_attorney`)، هيتقال بوضوح كبند منفصل، مع الدليل (استعلام SQL أو سجل بناء حقيقي يأكده)، ومش هيتصلح غلا بعد موافقتك الصريحة عليه تحديدًا.

### آلية التحقق قبل ما أي حاجة توصلك
لكل دفعة (مش لكل ملف كل مرة، لتوفير وقت، لكن قبل ما أسلّمك أي زيب):
1. تعديل الأنواع فقط في ملفات الدفعة.
2. تشغيل أداة الفحص الأوفلاين المبنية عندي (بتتحقق من توافق كل استدعاء قاعدة بيانات مع الأعمدة الحقيقية).
3. **بناء حقيقي على Vercel من عندك** — ده الفيصل الوحيد، مش فحصي الأوفلاين. مفيش دفعة تالية غير بعد ما توافق إن البناء نضيف.
4. لو أي خطأ ظهر، بيتصلح كنوع بس (زي أمثلة القسم 0 فوق)، مش بتغيير منطق.

### شبكة أمان إضافية (لو حبيت)
لو مرتاح للفكرة، الأفضل نعمل كل دفعة على **فرع Git منفصل** (`git branch`) بدل `main` مباشرة، وتراجعه/تعمله merge بنفسك بعد ما تتأكد من الـ Vercel Preview Deployment بتاعه. ده معناه لو أي دفعة فيها مشكلة، `main` ماتتأثرش خالص لحد ما توافق. قولّي لو عايز نمشي بالطريقة دي.

---

## 1) ترتيب الأولوية — ليه بالترتيب ده

المعيار مش "عدد الـ any في الملف"، المعيار **قد إيه الملف قريب من فلوس/بيانات حقيقية بتتكتب في قاعدة البيانات**. كل ما الملف بعيد عن الكتابة المباشرة (يعني بس بيعرض بيانات على الشاشة)، كل ما المخاطرة أقل والأولوية أقل إلحاحًا.

| المرحلة | النوع | عدد الملفات (تقريبي) | المخاطرة |
|---|---|---|---|
| ✅ منجزة | Hooks الأساسية (فلوس/قضايا/موكلين/تفاصيل قضية) | 4 | — |
| 2 | باقي طبقة الـ Hooks (بتكتب في DB مباشرة) | ~18 | متوسطة |
| 3 | Modals/Forms (بتجمع بيانات من المستخدم وتبعتها) | ~25 | متوسطة-منخفضة |
| 4 | شاشات عرض/قوائم (بتعرض بيانات بس، مفيهاش كتابة) | ~30 | منخفضة جدًا |
| 5 | الملفات المركزية (`App.tsx`, `main.tsx`) | 2 | **الأعلى — مؤجلة عمدًا لآخر حاجة** |

---

## المرحلة 2 — باقي طبقة الـ Hooks

**ليه دي التالية:** زي الـ 4 ملفات اللي خلصوا بالظبط — بتكتب في قاعدة البيانات مباشرة، فأي تحسين هنا بيمسك أعطال محتملة زي اللي اتكشفوا قبل كده.

**كل ملفات المرحلة 2 خلصت (18/18):** `useAIAssistant.ts` (34) · `useAdminUsers.ts` (15) · `useAdminLegalLibrary.ts` (13) · `useAppData.ts` (11) · `useDashboardFeed.ts` (10) · `useAdminBackup.ts` (10) · `useAdminSessions.ts` (7) · `useAdminOffice.ts` (7) · `useAdminPortal.ts` (4) · `useAutoLogout.ts` (3) · `useTelegramAlerts.ts` (2) · `usePwaInstall.ts` (1) · `useHealthMonitor.ts` (1) · `useAdminActivity.ts` (1) · `useNavigation.ts` (1) · `utils.ts` (8) · `constants.ts` (5) · `systemHealth.ts` (4)

**حجم الدفعة المقترح:** 4-5 ملفات في المرة، مش الـ 18 دفعة واحدة — نفس أسلوب الجلسة اللي فاتت بالظبط.

---

## المرحلة 3 — الفورمات والمودالات

**ليه دي التالية:** بتجمع بيانات من المستخدم وتبعتها لقاعدة البيانات (غالبًا عبر الـ hooks اللي خلصوا)، فمخاطرتها أقل من المرحلة 2 لأن منطق الكتابة الفعلي غالبًا already في الـ hook مش في المودال نفسه.

**أمثلة:** `NewCaseModal.tsx` (28) · `EditCaseModal.tsx` (28) · `NewClientModal.tsx` (21) · `EditClientModal.tsx` (18) · `RemindersTab.tsx` (23) · `SettingsPage.tsx` (22) · `UniversalSearchModal.tsx` (21) · وباقي مودالات الـ admin (كل واحد 4-15).

**ملاحظة خاصة:** `EditCaseModal.tsx` من ضمن الملفات اللي فيها إشارة لـ `caseData.type`/`caseData.number` (نفس فصيلة باگ `case_type` اللي اتصلح قبل كده) — هيتم التعامل معاها بحذر شديد وبالتنسيق معاك تحديدًا، مش كجزء عادي من دفعة تنظيف عامة، لأنها ممكن تكشف تأثير ظاهر في الواجهة (مش مجرد سجل نشاط فاضي زي المرة اللي فاتت).

---

## المرحلة 4 — شاشات العرض

**ليه دي الأخيرة قبل الملفات المركزية:** الأقل خطورة على الإطلاق — غالبًا بتاخد بيانات جاهزة (من الـ hooks) وتعرضها بس، من غير أي كتابة لقاعدة البيانات. التعديل هنا شبه ميكانيكي بالكامل.

**أمثلة:** `DashboardTab.tsx` (31) · `CalendarTab.tsx` (21) · `TimelineSection.tsx` (19) · `UpcomingSessionsList.tsx` (18) · `ArchiveTab.tsx` (22) · وباقي شاشات الـ sessions-calendar/dashboard/case-detail.

---

## المرحلة 5 — `App.tsx` و `main.tsx` (مؤجلة عمدًا)

هذول أخطر ملفين في المشروع تقنيًا — كل حاجة في التطبيق بتمر منهم (التنقل، حالة تسجيل الدخول، آلية العمل أوفلاين). أي غلطة صغيرة هنا بتأثر على التطبيق كله مش ميزة واحدة.

**القرار:** هيتم تأجيلهم لآخر حاجة، وهيتم التعامل معاهم بأصغر دفعات ممكنة (سطور معدودة في كل مرة)، مع بناء حقيقي بعد كل تعديل بسيط — مش دفعة واحدة زي باقي المراحل. لو حسّيت إنك عايز تسيبهم `any` للأبد وتوقف هنا، ده قرار سليم ومقبول تمامًا؛ العائد من تنظيفهم أقل بكتير من مخاطرتهم.

---

## الخلاصة

- كل مرحلة = تعديل أنواع بس، مفيش تغيير منطق، مفيش استثناء غير باگ حقيقي بيتقاله بوضوح ويتاخد رأيك فيه لوحده.
- كل مرحلة بتتقفل ببناء Vercel حقيقي ناجح قبل ما ننتقل للتالية.
- الترتيب من الأخطر (بيانات/فلوس) للأقل خطورة (عرض بس)، والملفين المركزيين (`App.tsx`/`main.tsx`) آخر حاجة وباحتياط إضافي.
- إنت اللي بتحدد نوقف فين — مفيش التزام إننا نوصل لصفر `any`، الهدف تقليل المخاطرة الفعلية مش رقم مثالي.

---

## سجل الإنجاز

### ✅ `src/hooks/ai/useAIAssistant.ts` — 34 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- التوقيع الأساسي `cases/clients/profile` بقى `CaseRow[]`/`ClientRow[]`/`ProfileRow | null` بدل `any` (من `types.ts`).
- أنواع محلية جديدة اتضافت للملف: `AIMessage`، `AITopic`، `AIDocFields`، و`LegalArticle` (بتوصف شكل الصف الفعلي اللي بيرجعه `db.rpc('search_law_articles', ...)`).
- كل الـ `useState<any>`، الـ callbacks (`.map`/`.filter`/`.find`)، وباقي الدوال الداخلية (`saveKey`, `callAI`, `retrieveLegalArticles`, `buildLegalContextBlock`, `sf`, إلخ) بقت متوقة بدل `any`.
- الـ refs (`messagesEndRef`, `inputRef`) اتحددت كـ `HTMLDivElement`/`HTMLTextAreaElement` بناءً على الاستخدام الفعلي في `AILegalAssistant.tsx`.
- فحص TypeScript فعلي (معزول، لأن مفيش node_modules/نت في بيئة العمل هنا) رجع **صفر أخطاء** في الملف، غير خطأ متوقع بخصوص مكتبة `react` نفسها غير المتاحة في بيئة الفحص المعزولة.

**باگ اتكشف واتصلح بموافقتك الصريحة (مش جزء من تنظيف الأنواع):**
- في `sendMessage` و`generateDocument`: الكود كان بيقرا `selectedCase.type||selectedCase.case_type`. عمود `type` مش موجود أصلاً في جدول `cases` (بس `case_type`)، فكان كود ميت دايمًا بيقفز لـ `case_type` عن طريق الـ `||` — مفيش أثر فعلي على المستخدم كان موجود، بس اتشالت الكتابة الميتة وبقى الكود بيقرا `case_type` مباشرة في المكانين.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال لـ `useAdminUsers.ts` (15 any — التالي في ترتيب المرحلة 2).

### ✅ `src/hooks/admin/useAdminUsers.ts` — 15 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- كل حالات المستخدم (`editUser`, `confirmDelete`, `changePassUser`, `confirmSignOut`, `confirmLock`) بقت `ProfileRow | null` بدل `any` — اتأكد من الشكل ده بمطابقة `UsersSection.tsx` و`SecuritySection.tsx` اللي بيبعتوا عناصر `lawyers` (وهي `ProfileRow[]`) لنفس الـ setters دي.
- 3 واجهات جديدة محلية للفورمات: `EditUserForm`, `AddUserForm`, `ChangePasswordPayload` — مبنية على الحقول الفعلية في `EditUserModal.tsx`, `UserFormModal.tsx`, `ChangePasswordModal.tsx`.
- `securityMsg` اتحدد `string | null`.
- فحص TypeScript فعلي رجع صفر أخطاء (غير خطأ `react` المتوقع في بيئة الفحص المعزولة).

**ملحوظة تقنية بسيطة (مش تغيير منطق):**
- استُخدم `editUser!.id` بدل `editUser.id` في مكانين — مجرد تأكيد نوع وقت الكومبايل (non-null assertion)، بيحافظ 100% على نفس سلوك وقت التشغيل الأصلي (لو `editUser` فعلاً `null` هيرمي نفس الخطأ بالظبط زي قبل).
- `securityMsg`/`setSecurityMsg` لوحظ إنها state غير مستخدمة فعليًا في أي مكان (مش خطأ، مجرد ملاحظة للأمانة).

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال لـ `useAdminLegalLibrary.ts` (13 any — التالي في ترتيب المرحلة 2).

### ✅ `src/hooks/admin/useAdminLegalLibrary.ts` — 13 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- نوعين جداد اتضافوا لـ `types.ts` المركزي (نفس الملف اللي فيه `CaseRow`/`ClientRow`... إلخ): `LawRow` و`LegalCategoryRow`، مشتقين من `database.types.ts` الحقيقي (جدولي `laws` و`legal_categories`).
- `editingLaw`/`confirmDeleteLaw` بقوا `LawRow | null`، `processingLaw` بقى `{ id: string } | null` (الشكل الفعلي اللي بيتخزن بيه — `{id: law.id}` بس، مش الصف كامل).
- فورم `handleSaveLaw` بقى `LawForm` (مطابق لحقول `LegalLibraryModal.tsx` الفعلية).
- خطأ الـ edge function في `getFnErrorMessage` بقى `EdgeFunctionError` — واجهة محلية بتوصف بالظبط نفس الـ duck-typing اللي الكود كان بيعمله أصلاً (`context.json`/`context.text` اختياريين)، من غير أي افتراض جديد.
- فحص TypeScript صفر أخطاء (غير خطأ `react` المتوقع في بيئة الفحص المعزولة).

**ملحوظة تقنية بسيطة (مش تغيير منطق):** استخدمت `(e as Error)?.message` بدل `e?.message` في 3 أماكن (catch blocks) — cast للنوع بس، نفس السلوك بالظبط زي useAdminUsers.ts قبل كده.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال لـ `useAppData.ts` (11 any — التالي في ترتيب المرحلة 2).

### ✅ `src/hooks/useAppData.ts` — 11 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- `profile` بقى `ProfileRow | null` بدل `any`.
- نوعين محليين جداد: `MappedCase` (شكل صف القضية بعد التطبيع في `fetchCases`/`searchCases`) و`MappedClient` (= `ClientRow`) — بدل `useState<any[]>`.
- كل `.map((r: any)...)`/`(prev: any)` في `fetchCases`, `searchCases`, `fetchClients` بقت متوقة بـ `CaseRow`/`ClientRow`/`MappedCase[]`/`MappedClient[]`.
- فحص TypeScript معزول رجع صفر أخطاء (غير أخطاء `react`/`@supabase/supabase-js`/`import.meta.env` المتوقعة في بيئة الفحص المعزولة بدون node_modules).

**ملاحظة اتكشفت (مش تغيير منطق، لسه من غير قرار منك):**
عمود `next_session` اللي بيتقرا في `r.next_hearing || r.next_session || '—'` (في `fetchCases` و`searchCases`) **مش موجود أصلاً في جدول `cases`** حسب `database.types.ts` — نفس فصيلة باگ `case_type` القديم بالظبط. الجزء ده كان دايمًا `undefined` وميت. اتسابت زي ما هي (بكاست تقني بسيط `as unknown as {...}` عشان الكومبايلر يعدي) مع تعليق موضّح في الكود، ومحتاجة قرارك الصريح لو عايز تتشال نهائيًا.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال لـ `useDashboardFeed.ts` (10 any — التالي في ترتيب المرحلة 2).

### ✅ `src/hooks/useDashboardFeed.ts` — 10 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- `profile` بقى `ProfileRow | null`.
- نوعين محليين جداد: `SessionCaseEmbed` (شكل الـ `cases(...)` المدمجة جوه استعلامات `case_sessions`) و`SessionFeedItem` (شكل صف الجلسة الكامل — بما فيه `cases` كـ كائن أو مصفوفة، لأن `DashboardTab.tsx` بيتعامل مع الاتنين فعليًا عند الاستهلاك).
- `TaskFeedItem` = `Pick<ReminderRow, 'id'|'title'|'due_date'|'notes'|'done'>` بدل `any[]` لحالة المهام.
- كل `.map`/`.filter` بقت متوقة، من غير أي تغيير في شرط المقارنة (كاست بسيط `as string` بدل تغيير منطق المقارنة نفسه في `fetchTasks`).
- فحص TypeScript معزول صفر أخطاء (غير الأخطاء المتوقعة في بيئة الفحص المعزولة).

**ملاحظة:** مفيش أي باگ جديد اتكشف في الملف ده.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال لـ `useAdminBackup.ts` (10 any — التالي في ترتيب المرحلة 2).

### ✅ `src/hooks/admin/useAdminBackup.ts` — 10 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- نوع جديد `BackupRow` اتضاف لـ `types.ts` المركزي (من `database.types.ts`، جدول `backups`).
- نوع محلي جديد `BackupSnapshot` بيوصف شكل الـ JSON الفعلي المخزّن في عمود `backups.data` (بدل `Record<string, any>`) — مبني بالظبط على الحقول اللي بتتبني بيها الـ snapshot في `handleCreateBackup`.
- `profile` بقى `ProfileRow | null`، `backups`/`confirmRestore` بقوا `BackupRow[]`/`BackupRow | null`.
- `fetchAllRows` بقت بترجع `unknown[]` بدل `any[]` (الأدق هنا لأن شكل الصف بيختلف فعليًا حسب اسم الجدول الديناميكي اللي بيتلف عليه).
- `handleDownloadBackup`/`handleRestoreBackup` بقوا بياخدوا `BackupRow` بدل `any`.
- `dynFrom` (السطر اللي فيه `db.from(table as any) as any`) **اتسابت زي ما هي عمدًا** — دي مش جزء من التنظيف، ده كاست تقني ضروري وموثّق في تعليق الكود الأصلي نفسه (supabase-js التايبد مش قادر يستنتج نوع صف لجدول اسمه متغيّر وقت التشغيل).
- فحص TypeScript معزول صفر أخطاء (غير الأخطاء المتوقعة في بيئة الفحص المعزولة).

**ملحوظة تقنية بسيطة (مش تغيير منطق):** عمود `created_at` في جدول `backups` نوعه `string | null` في السكيما (رغم إنه عمليًا دايمًا موجود لأي نسخة احتياطية اتسجلت فعلاً). التحقق من الأنواع كشف الفرق ده في 3 أماكن بتستخدم `new Date(backup.created_at)` (في `handleDownloadBackup` مرتين وفي `handleRestoreBackup` مرة) — استخدمت كاست بسيط `as string` في الثلاثة، من غير أي تغيير في السلوك وقت التشغيل.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال لـ `useAdminSessions.ts` (7 any — التالي في ترتيب المرحلة 2).

### ✅ `src/hooks/admin/useAdminSessions.ts` — 7 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- `profile` بقى `ProfileRow | null`.
- نوع محلي جديد `ActiveSession` بيوصف شكل عنصر الجلسة بعد التطبيع في `fetchActiveSessions`.
- `terminatingSession` بقى `string | null` (بيتخزّن فيه `sess.id` بس فعليًا، مش الكائن كامل)، `sessionsLastRefresh` بقى `Date | null`.
- `.filter`/`.map` بقوا متوقين بنوع محلي `SessionProfile` (= `Pick<ProfileRow, ...>` للأعمدة المطلوبة فعليًا في select الاستعلام).
- `handleTerminateSession` بقى بياخد `ActiveSession` بدل `any`.
- فحص TypeScript معزول صفر أخطاء (غير الأخطاء المتوقعة في بيئة الفحص المعزولة).

**ملحوظة تقنية بسيطة (مش تغيير منطق):** كاست بسيط `as string` في مكان واحد (`new Date(p.last_seen_at as string)` جوه `.map`) — لأن TypeScript مش بيربط ضمان `last_seen_at` الموجود من الـ `.filter` قبله تلقائيًا مع الـ `.map` بعده، رغم إن الشرط بيضمنه فعليًا وقت التشغيل.

**ملاحظة:** مفيش أي باگ جديد اتكشف في الملف ده.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال لـ `useAdminOffice.ts` (7 any — آخر ملف كبير في المرحلة 2).

### ✅ `src/hooks/admin/useAdminOffice.ts` — 7 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- `profile` بقى `ProfileRow | null | undefined` (اختياري زي ما كان).
- نوع محلي جديد `OfficeSettingsForm` بيوصف شكل حالة إعدادات المكتب (camelCase) بدل `Record<string, any>` — نفس الحقول الافتراضية بالظبط اللي كانت متعرّفة في الـ `useState` الأصلي.
- `logoFile` بقى `File | null` بدل `any` (فعليًا بيتخزّن فيه ملف مرفوع من `<input type="file">`)، و`logoPreview` بقى `string | null` (رابط موقّع من `resolveStorageUrl`).
- كل `setOfficeSettings((s: any) => ...)` (مرتين — في `fetchOfficeSettings` و`handleSaveOfficeSettings`) بقت متوقة بـ `OfficeSettingsForm`.
- `catch(e: any)` في `handleSaveOfficeSettings` بقت من غير أي نوع صريح (بترجع `unknown` تلقائيًا في وضع `strict`)، مع كاست `(e as Error)?.message` عند الاستخدام — نفس أسلوب `useAdminLegalLibrary.ts` قبل كده.
- فحص TypeScript معزول صفر أخطاء (غير الأخطاء المتوقعة في بيئة الفحص المعزولة).

**ملاحظة:** مفيش أي باگ جديد اتكشف في الملف ده — تعليقات BUG FIX الموجودة في الكود (شكل الحقول، الـ camelCase/snake_case، فشل رفع الشعار الصامت) كانت إصلاحات سابقة قبل الجلسة دي، مش حاجة جديدة.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال لباقي ملفات المرحلة 2 الصغيرة (`useAdminPortal.ts` وما بعده).

### ✅ دفعة صغيرة: `useAdminPortal.ts` (4) · `useAutoLogout.ts` (3) · `useTelegramAlerts.ts` (2) · `usePwaInstall.ts` (1) · `useHealthMonitor.ts` (1) — 11 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- `useAdminPortal.ts`: `profile` بقى `ProfileRow | null`. نوع محلي جديد `PortalAccessRow` بيوصف شكل الصف الفعلي من `select('client_id,is_active,client_name,email')` على جدول `client_portal_pins` (بدون pin/pin_hash، مش متجابين أصلاً). `portalClient` بقى `ClientRow | null` (مطابقة لِـ `filteredClients`/`clients` اللي بتتبعت له من `PortalSection.tsx`). واجهة محلية جديدة `PortalSaveForm` بشكل البيانات الفعلي اللي بتبعته `AddPortalUserModal.tsx`/`ClientPortalModal.tsx` لـ `onSave` (`client_id`, `pin`, `is_active`, `client_name`, `email`).
- `useAutoLogout.ts`: `profile` بقى `ProfileRow | null`. مصفوفة أسماء الأحداث (`events`) بقت `string[]` صريحة بدل الاستدلال الضمني، والـ callbacks في `forEach` بقت متوقة بـ `string` بدل `any`.
- `useTelegramAlerts.ts`: `profile` بقى `ProfileRow | null`. `catch(e: any)` بقت `catch(e)` (النوع التلقائي `unknown` في وضع `strict`) مع كاست `(e as Error)?.message` عند الاستخدام فقط — نفس أسلوب الملفات السابقة.
- `usePwaInstall.ts`: خاصية `standalone` على iOS Safari (مش جزء من نوع `Navigator` القياسي في lib.dom) بقت متوسّعة محليًا بـ `Navigator & { standalone?: boolean }` بدل `(window.navigator as any)`. باقي الملف كان أصلاً بيستخدم `window.__pwaInstallPrompt` المتوقة مسبقًا من `main.tsx` (`BeforeInstallPromptEvent | null`)، فمكانش فيه `any` تاني غير سطر الـ standalone ده.
- `useHealthMonitor.ts`: `_profile` بقى `ProfileRow | null` (باراميتر غير مستخدم فعليًا في الجسم، بس اتوّق للاتساق مع باقي الـ hooks).
- فحص TypeScript معزول (نفس أسلوب الجلسات السابقة، بيئة بدون node_modules/نت) رجع **صفر أخطاء** في الملفات الخمسة، بما فيها تحقق `declare global` الخاص بـ `window.__pwaInstallPrompt` من `main.tsx`.

**ملاحظة:** مفيش أي باگ جديد اتكشف في أي من الملفات الخمسة دي.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال لباقي ملفات المرحلة 2 (`useAdminActivity.ts`, `useNavigation.ts`, `utils.ts`, `constants.ts`, `systemHealth.ts`).

### ✅ إغلاق المرحلة 2: `useAdminActivity.ts` (1) · `useNavigation.ts` (1) · `utils.ts` (8) · `constants.ts` (5) · `systemHealth.ts` (4) — 19 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- `useAdminActivity.ts`: `activityLog` بقى `ActivityLogRow[]` بدل `any[]` (من `types.ts`).
- `useNavigation.ts`: الـ callback في بناء `PATH_TABS` بقى متوّق `[string, string]` بدل `any` (نفس السلوك، `tab as TabName` فضلت زي ما هي).
- `utils.ts`: `escapeHtml`/`escapeTelegramHtml` — الـ `(c: any)` بقت `(c: string)`. `flushPendingSubscription` — اتشال كاست `(window as any)` تمامًا لأن `__savePushSubscription`/`__pendingSubscription` متوقين مسبقًا في `declare global` بتاع `main.tsx`، فالكاست كان زيادة مش لازمة. `safeUpdate`/`logActivity` — الباراميتر `db: any` بقى `db: SupabaseClient<Database>` (من `@supabase/supabase-js`)، و`data: Record<string, any>` بقت `Record<string, unknown>`، و`error: any` بقت `PostgrestError | null`. النداءات الديناميكية `db.from(table)` (اسم جدول متغيّر وقت التشغيل حسب الشاشة المستدعية) فضلت بكاست موثّق `db.from(table as any)` — نفس نمط `dynFrom` في `useAdminBackup.ts` بالظبط.
- `constants.ts`: نوع محلي جديد `CountryConfig` بيوصف شكل كل كائن دولة في `COUNTRY_CONFIGS` (مطابق تمامًا للحقول الفعلية في الكائنات السبعة SA/AE/EG/BH/QA/KW/JO) بدل `Record<string, any>`. مكوّن `AI` — `({cls}: any)` بقت `({cls}: {cls?: string})`. `_officeCache` بقى `Partial<OfficeSettingsRow> | null` بدل `Record<string,any>|null`، مع كاست موثّق واحد (`row as Record<string, string | null | undefined>`) في نقطة القراءة الديناميكية بعمود متغيّر جوه `loadOfficeSetting` — نفس نمط `dynFrom`. الكاستين الموثّقين مسبقًا في `saveOfficeSetting` ({[col]: value} as any) فضلوا زي ما هما (موثّقين أصلاً من قبل، مش جزء من التنظيف).
- `systemHealth.ts`: `getFailedServices` — `(s: any)` بقت `(s: ServiceStatus)`. `installGlobalErrorWatcher` — كاست `(window as any).__healthWatcherInstalled` اتشال، وبقى فيه توسيع محلي `declare global` لخاصية `__healthWatcherInstalled?: boolean` على `Window` (نفس نمط `__pwaInstallPrompt` في `main.tsx`). `reason: any` بقت `reason: unknown` مع كاست بسيط `(reason as { message?: string })?.message` عند الاستخدام فقط (نفس أسلوب `(e as Error)?.message` المستخدم في ملفات سابقة).
- فحص TypeScript معزول (نفس بيئة الجلسات السابقة) رجع **صفر أخطاء** في الملفات الخمسة.

**ملحوظة تقنية بسيطة (مش تغيير منطق):** في `utils.ts`، نوع `opts.entity_id` في `logActivity` كان `string | number | null` وبقى `string | null` — مطابقة لعمود `entity_id` الفعلي في جدول `activity_log` (نوعه `string | null` في السكيما) ولكل استدعاء فعلي لـ `logActivity` في المشروع كله (كلهم بيبعتوا `id`/`uuid` كنص). مفيش أي استدعاء حالي بيبعت رقم، فده تضييق نوع بس بدون أي تغيير سلوك فعلي.

**ملاحظة:** مفيش أي باگ جديد اتكشف في أي من الملفات الخمسة دي.

**الحالة:** المرحلة 2 خلصت بالكامل (18 ملف). في انتظار تأكيد بناء Vercel ناجح قبل البدء في المرحلة 3 (الفورمات والمودالات) — أول ملف مقترح: نبدأ بأصغر مودالات الـ admin (4-15 any لكل واحد) قبل `NewCaseModal.tsx`/`EditCaseModal.tsx` الأكبر حجمًا وحساسية.

---

## المرحلة 3 — الفورمات والمودالات (جارية)

### ✅ دفعة أولى: `ClientPortalModal.tsx` (4) · `ChangePasswordModal.tsx` (6) · `AddPortalUserModal.tsx` (8) · `EditUserModal.tsx` (11) — 29 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- **تصدير أنواع مشتركة كانت محلية:** `PortalAccessRow` و`PortalSaveForm` اتصدّروا من `useAdminPortal.ts` (كانوا معرّفين جوّه بس من غير `export` من دفعة المرحلة 2)؛ و`EditUserForm`، `AddUserForm`، `ChangePasswordPayload` اتصدّروا من `useAdminUsers.ts` لنفس السبب — عشان المودالات تقدر تستوردهم بدل ما تكرر تعريفهم أو تستخدم `any`.
- `ClientPortalModal.tsx`: بروبس الكومبوننت بقت `ClientPortalModalProps` (`client: ClientRow`, `portalAccess: PortalAccessRow[]`, `onSave: (data: PortalSaveForm) => void`). كل `(e: any)`/`(s: any)` بقت متوقة (`React.ChangeEvent<HTMLInputElement>`, `boolean`).
- `ChangePasswordModal.tsx`: بروبس بقت `ChangePasswordModalProps` (`user: ProfileRow`, `onSave: (data: ChangePasswordPayload) => void`). كل الـ `any` في `onChange`/`setShowPass`/`setForceChange`/`.map` بقت متوقة بالنوع الصحيح.
- `AddPortalUserModal.tsx`: بروبس بقت `AddPortalUserModalProps` (`clients: ClientRow[]`, `portalAccess: PortalAccessRow[]`). `selected` بقى `ClientRow | null` بدل `any`. كاست بسيط `selected!` في نداء `onSave` (مضمون وقت التشغيل لأن الزر معطّل أصلاً لو `selected` فاضي — نفس نمط الكاست البسيط المستخدم في hooks المرحلة 2).
- `EditUserModal.tsx`: بروبس بقت `EditUserModalProps` (`user: ProfileRow`, `onSave: (data: EditUserForm) => void`). `form` بقى `useState<EditUserForm>` بدل استدلال ضمني، مع كاست بسيط `(user.permissions as Record<string, boolean>)` (عمود `permissions` نوعه `Json` في السكيما). كل الـ `(f: any)`/`(role: any)`/`([key,{label,icon}]: any)` بقت متوقة.
- **ملحوظة:** `ROLE_CONFIG` في `icons.ts` لسه `Record<string, any>` عمدًا — الملف ده مش جزء من الدفعة دي (هيتنضف في دوره لاحقًا)، فمكانش من ضمن التنظيف هنا.
- فحص توازن أقواس/أكواد للملفات الأربعة تمام؛ الفحص الكامل بـ TypeScript المعزول مش متاح في البيئة دي (مفيش `node_modules`)، فالفيصل الحقيقي هو بناء Vercel زي كل مرة.

**ملاحظة:** مفيش أي باگ جديد اتكشف في أي من الملفات الأربعة دي، ومفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3.

### ✅ دفعة ثانية: `PdfViewerModal.tsx` (2) · `ExitConfirmModal.tsx` (2) · `ViewReminderModal.tsx` (2) · `DeleteConfirmModal.tsx` (3) · `SummaryModal.tsx` (3) — 12 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- `PdfViewerModal.tsx`: بروبس بقت `PdfViewerModalProps` (`doc: CaseDocumentRow`). كاست بسيط `as string` في اختبارات الـ regex (`original_name`/`file_name` نوعهم `string | null` في السكيما) — بنفس القيمة اللي كانت بتتبعت وقت التشغيل من غير أي قيمة افتراضية جديدة، عشان السلوك يفضل zero تغيير.
- `ExitConfirmModal.tsx`: بروبس بقت `{ nav: NavigationState }` — استوردنا `NavigationState` المُصدَّر أصلاً من `useNavigation.ts` (من تنظيف المرحلة 2) بدل ما نكرر تعريفه.
- `ViewReminderModal.tsx`: بروبس بقت واجهة محلية جديدة بتستخدم `ReminderRow` من `types.ts`، ونوع محلي `ReminderEditForm` بيوصف شكل فورم التعديل. كاست بسيط `as string` في مقارنة `due_date` وفي تمرير `title`/`due_date` لـ `setEditForm` (لأن العمودين `string | null` في السكيما، والقيمة الفعلية مضمونة موجودة وقت الاستخدام هنا زي ما كانت). ملحوظة: `RemindersTab.tsx` (الأب) لسه بيمرر `viewTarget` بنوع `any` من تنظيفه هو لسه — ده مش مشكلة لأن `any` متوافق تلقائيًا مع أي نوع، وهيتصفّر لما نوصل لملف `RemindersTab.tsx` نفسه في دفعة لاحقة.
- `DeleteConfirmModal.tsx`: بروبس بقت `DeleteConfirmModalProps` (مودال عام تأكيد حذف/أرشفة، مُستخدم في أماكن متعددة بالمشروع).
- `SummaryModal.tsx`: بروبس بقت `SummaryModalProps`، مع `feesByCategory: Record<string, CaseFeeRow[]>` (مطابق تمامًا لنوعه الأصلي في `useFeesActions.ts` من تنظيف المرحلة 2).
- فحص توازن أقواس للملفات الخمسة تمام، صفر `any` متبقي فيهم.

**ملاحظة:** مفيش أي باگ جديد اتكشف، ومفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات في أي من الملفات الخمسة دي.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3.

### ✅ دفعة ثالثة: `InvoiceModal.tsx` (4) · `SessionUpdateModal.tsx` (5) · `AddReminderForm.tsx` (7) · `EditReminderModal.tsx` (8) · `UserFormModal.tsx` (9) — 33 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- **تصدير أنواع مشتركة كانت محلية:** `InvoiceModalState` اتصدّر من `useFeesActions.ts` (كان معرّف جوّه بس من غير `export` من دفعة المرحلة 2) عشان `InvoiceModal.tsx` يقدر يستورده بدل ما يستخدم `any`.
- `InvoiceModal.tsx`: بروبس بقت `InvoiceModalProps` مبنية على `InvoiceModalState`. الـ `.map` بتاعة بطاقات البيانات بقت متوقة بنوع محلي بسيط `{label, value, cls}`.
- `SessionUpdateModal.tsx`: بروبس بقت `SessionUpdateModalProps` (`session: CaseSessionRow`, `caseData: CaseRow`, `db: SupabaseClient<Database>`) — نفس نمط توقيت `db` المستخدم في hooks المرحلة 2 (`utils.ts`).
- `AddReminderForm.tsx` و`EditReminderModal.tsx`: نوع محلي `ReminderForm`/`ReminderEditForm` (نفس الشكل `{title, due_date, notes}`) بدل `any` في الـ state والـ callbacks. ملحوظة: `RemindersTab.tsx` (الأب) لسه بيمرر الفورم والـ `editTarget`/`viewTarget` بنوع `any` من تنظيفه هو لسه — مش مشكلة تقنيًا (التوافق مضمون لأن `any` متوافق مع أي نوع محدد)، وهيتصفّر لما نوصل لملف `RemindersTab.tsx` نفسه في دفعة لاحقة.
- `UserFormModal.tsx`: استوردنا `AddUserForm` المُصدَّر من `useAdminUsers.ts` (من الدفعة الأولى)، ونوع محلي `UserForm extends AddUserForm` زائد `is_active` (حقل موجود في الحالة الأولية للفورم بس مش مستخدم فعليًا في `handleAddUser`). دالة `s()` المساعدة بقت متوّقة (`k: keyof UserForm, v: string | boolean | Record<string, boolean>`) بدل `any`. كاست `(ROLE_CONFIG as any)[role]` اتشال بالكامل (زيادة عن اللزوم لأن `ROLE_CONFIG` نفسه لسه `Record<string, any>` في `icons.ts` — ملف تاني برّه نطاق الدفعة دي).
- فحص توازن أقواس لكل الملفات السبعة (الخمسة المودالات + `useFeesActions.ts` و`useAdminUsers.ts` بعد التصدير) تمام، صفر `any` متبقي فيهم.

**ملاحظة:** مفيش أي باگ جديد اتكشف، ومفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات في أي من الملفات دي.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3.

### ✅ دفعة رابعة: `NewStandaloneSessionModal.tsx` (9) · `LegalLibraryModal.tsx` (11) · `QuickAddSessionModal.tsx` (12) · `ClientDetailModal.tsx` (12) — 44 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- **تصدير أنواع مشتركة كانت محلية:** `LawForm` اتصدّر من `useAdminLegalLibrary.ts` (كان معرّف جوّه بس من غير `export`)، و`ClientContactInfo` اتصدّر من `useClientActions.ts` (نفس السبب) — عشان المودالات تستوردهم بدل تكرار التعريف أو استخدام `any`.
- `NewStandaloneSessionModal.tsx`: بروب `cases` بقى `MappedCase[]` (النوع المُصدَّر من `useAppData.ts`) بدل `any[]` — اتأكد من الشكل ده بمطابقة `App.tsx` اللي بيبعت `cases` (نفس الـ state من `useAppData`) للمودال ده تحديدًا. كل `(e: any)`/`(c: any)`/`(f: any)`/`(t: any)` بقت متوقة بالنوع الصحيح.
- `LegalLibraryModal.tsx`: بروبس بقت `LegalLibraryModalProps` (`categories: LegalCategoryRow[]`, `editingLaw: LawRow | null`, `onSave: (form: LawForm, file: File | null) => void`). الفورم المحلي بقى `useState<LawForm>` بدل استدلال ضمني.
- `QuickAddSessionModal.tsx`: بروبس بقت `QuickAddSessionModalProps` (`cases: MappedCase[]`, `db: SupabaseClient<Database>`, `sendTelegram?: (msg: string) => void`). فورم محلي جديد `QuickAddSessionForm`. ملحوظة: الملف ده مش مستورد/مستخدم في أي مكان تاني بالمشروع حاليًا (كومبوننت غير مفعّل)، بس اتنضف زي باقي الدفعة لأنه كان ضمن قائمة الـ `any` المتبقية.
- `ClientDetailModal.tsx`: بروبس بقت `ClientDetailModalProps` (`client: ClientRow`, `cases: MappedCase[]`, `onEdit`, `onDelete`, `onOpenCase`). `contact_info` (عمود `Json` في السكيما) بقى بيتقرا عبر كاست موثّق واحد `as ClientContactInfo | null` بدل الوصول المباشر لخصائصه على نوع `Json`. `onEdit`/`onSave` بقوا `Record<string, unknown>` بدل `any` (متوافقة مع توقيع `handleUpdateClient` الفعلي في `useClientActions.ts`).
- فحص TypeScript معزول (نفس بيئة الجلسات السابقة) رجع **صفر أخطاء** في الملفات الأربعة، غير الأخطاء البيئية المتوقعة (`react`/`react-dom`/`@supabase/supabase-js`).

**باگين إضافيين اتكتشفوا (مش تغيير منطق، من نفس فصيلة `case_type`/`next_session` القديمة — الكود فضل زي ما هو تمامًا، الكاست بس بيوثّق السلوك الحالي):**
- في `ClientDetailModal.tsx`: `ca.case_number_official` و`ca.case_type` مش موجودين في `MappedCase` (شكل القضية بعد التطبيع في `useAppData.ts`) — القيمتين دايمًا `undefined`، والكود بيعتمد فعليًا على `ca.number`/`ca.type` (الطرف التاني من الـ `||`) زي ما هو من غير أي أثر ظاهر على المستخدم.

**ملحوظة تقنية بسيطة (خارج نطاق الدفعة، للأمانة بس):** الفحص المعزول كشف إن `useClientActions.ts` (من ضمن الـ 4 hooks الأساسية اللي كانت خلصت قبل بداية الخطة دي) لسه فيه استخدامين لـ `Record<string, any>` (في `handleSaveClient`/`handleUpdateClient`) وبعض الـ callbacks بنوع ضمني. الملف ده مش جزء من الدفعة الحالية، فمتتحطش أي تعديل عليه غير إضافة `export` لنوع `ClientContactInfo` (تصدير بس، من غير تغيير سلوك).

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3 (المرشح التالي: باقي المودالات الصغيرة زي `StandaloneSessionDetailModal.tsx` (12)، أو البدء في `NewClientModal.tsx`/`EditClientModal.tsx` لو تفضّل).

### ✅ دفعة خامسة: `StandaloneSessionDetailModal.tsx` (12) — 12 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- بروبس `EditStandaloneModal` (المكون الداخلي الخاص بتعديل الجلسة) بقت `EditStandaloneModalProps` (`session: CaseSessionRow`, `db: SupabaseClient<Database>`). نوع محلي جديد `StandaloneEditForm` بيوصف شكل فورم التعديل بالكامل (17 حقل) بدل استدلال ضمني من `useState({...})`.
- بروبس المكون الرئيسي `StandaloneSessionDetailModal` بقت `StandaloneSessionDetailModalProps` (`session: CaseSessionRow`, `db: SupabaseClient<Database>`).
- دالة `set(k)` بقت متوّقة `(k: keyof StandaloneEditForm) => (e: React.ChangeEvent<HTMLInputElement>) => ...` بدل `(k: string) => (e: any) => ...`.
- كل `onClick: (e: any) => {...}` الخاصة بإغلاق المودال عند الضغط على الخلفية (مرتين، في المودالين) بقت `(e: React.MouseEvent<HTMLDivElement>) => ...`.
- `CASE_TYPES.map((t: any) => ...)` بقت `(t: string) => ...`.
- `rows.filter((r: any) => r.value)` و`rows.map(({label, value}: any) => ...)` اتشال منهم الـ `any` بالكامل (النوع مستنتج تلقائيًا من تعريف `rows` الصريح الموجود أصلاً `{ label: string; value: string | null }[]`).
- **كائن `caseData` الاصطناعي:** الملف بيبني كائن قضية وهمي محليًا (مفيش قضية حقيقية لأن الجلسة مستقلة) عشان يتمرر لـ `SessionUpdateModal` اللي بيتوقع `caseData: CaseRow`. الكائن ده شكله مش مطابق 100% لصف `cases` الحقيقي (فيه حقول زي `number`/`type` مش أعمدة فعلية في الجدول، دي بس شكل محلي يخدم الحقول اللي `SessionUpdateModal.tsx` بيقرأها فعليًا: `id`/`title`/`number`/`court`) — اتحط عليه كاست موثّق واحد `as unknown as CaseRow` مع تعليق موضّح في الكود، من غير أي تغيير في القيم أو المنطق.
- كاست بسيط `as string` في مكانين (`CASE_TYPES.includes(session.case_type as string)`) — لأن `case_type` عمود `string | null` في السكيما، ونفس الكاست المستخدم في ملفات سابقة (`useAdminBackup.ts`، `useAdminSessions.ts`) بدون أي تغيير في نتيجة الشرط وقت التشغيل.
- فحص TypeScript معزول رجع **صفر أخطاء حقيقية** في الملف، غير الأخطاء البيئية المتوقعة (`react`/`react-dom`/`@supabase/supabase-js` غير متاحين في بيئة الفحص بدون node_modules).

**ملاحظة:** مفيش أي باگ جديد اتكشف في الملف ده، ومفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3 (المرشح التالي: `NewClientModal.tsx` (23) أو `EditClientModal.tsx` (19) أو تقسيمهم لدفعات أصغر — قولّي تفضّل تبدأ منين).

### ✅ دفعة سادسة: `NewClientModal.tsx` (23) · `EditClientModal.tsx` (19) — 42 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- **`NewClientModal.tsx`:** بروبس بقت `NewClientModalProps` (`onClose`, `onSave: (form: NewClientForm, idFile: File | null, poaFile: File | null) => void`, `loading?`) — مطابقة لتوقيع `handleSaveClient` الفعلي في `useClientActions.ts` (لسه `Record<string, any>` هناك، برّه نطاق الدفعة دي). نوع محلي جديد `NewClientForm` (11 حقل) بدل استدلال ضمني من `useState({...})`. `WarnHint` (مكوّن التحذير الصغير تحت الحقول) بقى `{msg}: {msg?: string | null}` بدل `any`. دالة `s(k,v)` بقت جينيريك `<K extends keyof NewClientForm>(k: K, v: NewClientForm[K])` بدل `(k: any, v: any)`. `idFile`/`poaFile`/`idPreview`/`poaPreview` بقوا `File | null`/`string | null` بدل `any`. `pickId`/`pickPoa` بقوا بياخدوا `File | null | undefined` (نفس الشكل الفعلي اللي بيرجعه `e.target.files[0]` في `FileUploadField`). كل `onChange:(e: any)` بقت متوقة حسب العنصر (`React.ChangeEvent<HTMLInputElement>` للحقول العادية، `HTMLSelectElement` لحقل نوع الموكل، `HTMLTextAreaElement` للملاحظات). `onClick` الخاص بخلفية المودال بقى `React.MouseEvent<HTMLDivElement>`.
- **`EditClientModal.tsx`:** بروبس بقت `EditClientModalProps` (`client: ClientRow`, `onClose`, `onSave: (form: EditClientForm, idFile?, poaFile?) => void`) — مطابقة تمامًا لِـ `onSave` الفعلي اللي بيتبعت من `ClientDetailModal.tsx` (من دفعة سابقة، بيستخدم `Record<string, unknown>`، والنوع الأدق `EditClientForm` هنا متوافق معاه). نوع محلي جديد `EditClientForm` (نفس شكل `NewClientForm`). **كاست موثّق واحد:** `c.contact_info as ClientContactInfo | null` (عمود `contact_info` نوعه `Json` في السكيما، والشكل الفعلي موصوف في `ClientContactInfo` المُصدَّرة من `useClientActions.ts` من دفعة سابقة) بدل الوصول المباشر `c.contact_info?.id_url` على نوع `Json` (اللي TypeScript مش بيسمح بيه من غير كاست). باقي التنظيف (فورم، `s()`، `pickId`/`pickPoa`، أنواع الـ `onChange`) بنفس أسلوب `NewClientModal.tsx`.
- فحص TypeScript معزول رجع **صفر أخطاء حقيقية** في الملفين، غير الأخطاء البيئية المتوقعة (`react`/`react-dom` غير متاحين في بيئة الفحص، والـ implicit-any المتسلسل منها في `setForm` callback).

**ملاحظة:** مفيش أي باگ جديد اتكشف في أي من الملفين، ومفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3 (المرشح التالي: `RemindersTab.tsx` (24)، `SettingsPage.tsx` (24)، أو `UniversalSearchModal.tsx` (21)).

### ✅ دفعة سابعة: `RemindersTab.tsx` (24) — 24 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- بروبس المكون بقت `RemindersTabProps` (`initialFilter?: string | null`, `profile?: ProfileRow | null`).
- كل حالات التذكيرات (`reminders`, `overdueList`, `doneList`, `searchResults`) بقت `ReminderRow[]` بدل `any[]` (من `types.ts`). `editTarget`/`confirmDeleteTarget`/`viewTarget` بقوا `ReminderRow | null`. `form`/`editForm` بقوا `useState<ReminderForm>` (نوع محلي جديد `{title, due_date, notes}`) بدل استدلال ضمني.
- نوع محلي جديد `PillSection` بيوصف شكل عنصر الـ pill selector (تابات قادمة/متأخرة/منجزة) — `hasMore`/`loadMore` اختياريين لأن تاب "قادمة" مش paginated أصلاً فمفيهوش زرار تحميل مزيد (نفس السلوك الحالي بالظبط، النوع بس بيوثّقه).
- `handleToggleDone(r)` و`.filter`/`.sort` الخاصين بنتائج البحث بقوا بياخدوا `ReminderRow` بدل `any`. `handleDelete(id)` بقى `id: string`.
- كل الـ `(e:any)`/`(t:any)`/`(s:any)`/`(prev:any)` (في الـ pagination، البحث، الـ pill selector، وكروت التذكيرات) بقت متوقة بالنوع الصحيح.
- كاست موثّق واحد (non-null assertion) في `handleEdit`: `editTarget!.id`/`editTarget!.updated_at` — الدالة دي بتتنفذ بس من زر الحفظ جوه `EditReminderModal`، اللي أصلاً مبيتعرضش غير لما `editTarget` موجود، فمضمون وقت التشغيل، مع تعليق موضّح في الكود.
- كاست `(profile as any)?.tenant_id` اتشال بالكامل — بقى `profile?.tenant_id` مباشرة بعد ما `profile` بقى `ProfileRow | null` (العمود موجود فعليًا في السكيما).
- فحص TypeScript معزول رجع **صفر أخطاء حقيقية** في الملف، غير الأخطاء البيئية المتوقعة (`react`/`react-dom` غير متاحين في بيئة الفحص، والـ implicit-any المتسلسل منها في `setOverdueList`/`setDoneList`).

**ملاحظة:** مفيش أي باگ جديد اتكشف في الملف ده، ومفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3 (المرشح التالي: `SettingsPage.tsx` (24)، `UniversalSearchModal.tsx` (21)، أو `ReminderCard.tsx` (4 — أصغر ملف متبقي في مجموعة التذكيرات)).

### ✅ دفعة ثامنة: `ReminderCard.tsx` (4) — 4 → 0 (منجز، 14 يوليو 2026 — إغلاق مجموعة التذكيرات بالكامل)

**تنظيف الأنواع:**
- بروبس بقت `ReminderCardProps` (`r: ReminderRow`, `todayStr: string`, `onToggleDone/onView/onEdit/onDelete: (r: ReminderRow) => void`).
- كاست بسيط `(r.due_date as string) < todayStr` — عمود `due_date` نوعه `string | null` في السكيما، والمقارنة كانت شغالة أصلاً وقت التشغيل حتى لو `null` (بترجع `false`)، فالكاست بس بيوثّق نفس السلوك من غير تغيير.
- كل `(e:any)` في أزرار التأشير/التعديل/الحذف بقت `React.MouseEvent<HTMLButtonElement>`.
- **باگ صغير اتكشف ومتصلح بالمناسبة (من نفس فصيلة الكاست، مش تغيير منطق):** أثناء تنظيف `RemindersTab.tsx` تبيّن إن استدعاء `onEdit` بيبني `editForm` من `t.title`/`t.due_date` (النوعين `string | null` في السكيما) من غير كاست، بعكس `notes` جنبهم في نفس السطر اللي كان عليه `||''` أصلاً. اتضاف نفس الكاست الموثّق `as string` المستخدم فعليًا في `ViewReminderModal.tsx` (`viewTarget.title as string`) لنفس السطر في `RemindersTab.tsx` — توحيد للأسلوب، من غير أي تغيير في القيم الفعلية وقت التشغيل (العنوان والتاريخ مضمونين موجودين عمليًا لأي تذكير محفوظ، لأن `handleSave` بيرفض الحفظ من غيرهم أصلاً).
- فحص TypeScript معزول رجع **صفر أخطاء حقيقية** في الملفين (`ReminderCard.tsx` و`RemindersTab.tsx` بعد التعديل الإضافي)، غير الأخطاء البيئية المتوقعة.

**ملاحظة:** بكده مجموعة التذكيرات بالكامل (`RemindersTab.tsx`، `AddReminderForm.tsx`، `EditReminderModal.tsx`، `ViewReminderModal.tsx`، `ReminderCard.tsx`) اتصفرت من الـ `any` بالكامل عبر الدفعات المتتالية.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3 (المرشح التالي: `SettingsPage.tsx` (24) أو `UniversalSearchModal.tsx` (21)).

### ✅ دفعة تاسعة: `SettingsPage.tsx` (22) · `UniversalSearchModal.tsx` (16) — 38 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- **تصدير أنواع مشتركة كانت محلية:** `CountryConfig` اتصدّر من `constants.ts` (كان معرّف جوّه بس من غير `export`) عشان `SettingsPage.tsx` يقدر يستورده بدل استخدام `any`/`Record<string,any>` لشكل `cfg`. `OfficeSettingsForm` اتصدّر من `useAdminOffice.ts` لنفس السبب.
- **`SettingsPage.tsx`:** بروبس بقت `SettingsPageProps` (`profile: ProfileRow | null`, `isAdmin: boolean`, `country: string`, `onCountryChange: (country: string) => void`, `onClose: () => void`) — مطابقة لِـ props الفعلية المُرسلة من `App.tsx`. أنواع محلية جديدة: `SettingsSectionTab` (تبويبات الشاشة)، `OfficeTextField` (حقول بيانات المكتب، بـ `key: keyof OfficeSettingsForm` عشان الوصول لـ `office.officeSettings[key]` يبقى type-safe من غير أي كاست)، `SystemInfoRow` (صفوف "معلومات النظام")، `TgSecretIdsRow` (شكل نتيجة قراءة أعمدة الـ secret id بتاعة توكنات التليجرام). كل الـ `(e:any)`/`(s:any)`/`(v:any)`/`(c:any,i:any)` بقت متوقة بالنوع الصحيح (`React.ChangeEvent<HTMLInputElement>`, `OfficeSettingsForm`, `boolean`, `string`/`number`... إلخ). كاست `(office.officeSettings as any)[key]` اتشال بالكامل بعد ما `key` بقى `keyof OfficeSettingsForm`. `typeNames: Record<string, any>` بقى `Record<string, string>`. نداءات `db.functions.invoke('office-secrets', ...)` بقت من غير أي annotation صريح (نفس الأسلوب المستخدم فعليًا في `useAIAssistant.ts` من قبل — النوع بيتوقّع تلقائيًا من التوقيع، مفيش حاجة لكتابة `any` هناك).
- **`UniversalSearchModal.tsx`:** بروبس بقت `UniversalSearchModalProps` (`cases: MappedCase[]`, `clients: MappedClient[]`, `onOpenCase: (c: SearchCaseResult | MappedCase) => void` — الدالة دي بتتنادى فعليًا بشكلين مختلفين من الكائن في الملف ده (نتيجة بحث القضايا المباشر، أو القضية المرتبطة بجلسة/ملاحظة من الـ `cases` prop)، فالنوع بيوثّق الاستخدامين الحقيقيين من غير افتراض إضافي. أنواع محلية جديدة بتوصف بالظبط أعمدة كل استعلام بحث مباشر في قاعدة البيانات (`SearchCaseResult`, `SearchClientResult`, `SearchDocResult`, `SearchSessionResult`, `SearchNoteResult`, `RawCaseSearchRow`, `QuickFilter`). كل الـ `(c:any)`/`(s:any)`/`(n:any)`/`(doc:any)`/`(r:any)`/`(f:any)`/`(hint:any)`/`(e:any)` بقت متوقة بالنوع الصحيح. `inputRef` بقى `useRef<HTMLInputElement>(null)` بدل `useRef<any>(null)`.
- **كاستات موثّقة (بدون تغيير سلوك):** `c.full_name as string`، `n.content as string`، `doc.file_name as string`، `n.created_at as string` — في `highlight()`/`new Date()` بعد ما الحقول دي بقت `string | null` (مطابقة للسكيما الفعلية) بدل `any` — نفس القيمة وقت التشغيل زي ما كانت (مفيش أي `|| ''` بيغيّر نتيجة `new Date()` مثلاً، الكاست بس بيوثّق افتراض إن القيمة موجودة فعليًا وقت الاستخدام). وكاست `viewingDoc as unknown as CaseDocumentRow` عند تمريره لـ `PdfViewerModal` (اللي بيتوقع صف `case_documents` كامل، بينما `viewingDoc` هنا شكله جزئي من نتيجة البحث) — نفس نمط الكاست المستخدم في دفعات سابقة لكائنات مصطنعة/جزئية.
- فحص توازن أقواس للملفين تمام (الفحص الكامل بـ TypeScript المعزول مش متاح في البيئة دي)، صفر `any` متبقي فيهم.

**باگين اتكشفوا (مش تغيير منطق، من نفس فصيلة `case_type`/`next_session` القديمة — الكود فضل زي ما هو تمامًا):**
- في `UniversalSearchModal.tsx`: عمود `next_session` بيتقرا في استعلام البحث المباشر عن القضايا (`r.next_hearing || r.next_session || '—'`) **مش موجود أصلاً في جدول `cases`** — نفس باگ `useAppData.ts` بالظبط بس في ملف تاني. الجزء ده دايمًا `undefined`، والكود بيعتمد فعليًا على `next_hearing`.
- في `UniversalSearchModal.tsx`: نتيجة بحث المستندات بتقرا `doc.original_name` كمحاولة أولى، لكن عمود `original_name` (موجود فعليًا في جدول `case_documents`) مش من ضمن الأعمدة المُختارة في الـ `.select()` بتاع البحث ده تحديدًا (بس `id,case_id,file_name,category,created_at`) — قيمته دايمًا `undefined` هنا، فالكود بيقع دايمًا على `file_name`.

**ملحوظة:** مفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات في أي من الملفين.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3 (المرشح التالي: `NewCaseModal.tsx` (28) أو `EditCaseModal.tsx` (28) — الملفان الأكبر والأكثر حساسية المتبقيان في المرحلة، خصوصًا `EditCaseModal.tsx` بسبب إشارته المحتملة لفصيلة باگ `case_type`/`case_number` المذكورة في القسم 1).

### ✅ دفعة عاشرة: `NewCaseModal.tsx` (28) — 28 → 0 (منجز، 14 يوليو 2026)

**تنظيف الأنواع:**
- بروبس بقت `NewCaseModalProps` (`onClose`, `onSave: (form: Record<string, any>) => void` — مطابقة تمامًا لتوقيع `handleSaveCase` الفعلي في `useCaseActions.ts` (لسه `Record<string, any>` هناك، برّه نطاق الدفعة دي، نفس نمط `useClientActions.ts` قبل كده)، `loading?`, `lawyers: ProfileRow[]`, `isAdmin: boolean`, `clients: ClientRow[]`, `countryCourts?: string[]`, `countryCaseTypes?: string[]`).
- نوع محلي جديد `NewCaseForm` (21 حقل) بدل استدلال ضمني من `useState({...})`. دالة `s(k,v)` بقت جينيريك `<K extends keyof NewCaseForm>(k: K, v: NewCaseForm[K])` بدل `(k: any, v: any)`.
- كل `onChange:(e: any)` بقت متوقة حسب العنصر الفعلي: `React.ChangeEvent<HTMLInputElement>` للحقول النصية، `React.ChangeEvent<HTMLSelectElement>` للثلاثة `Sel` (المحكمة، التصنيف، الموكل من القائمة). `onClick` الخاص بخلفية المودال بقى `React.MouseEvent<HTMLDivElement>`. `.map((lvl:any)/(t:any))` على مصفوفتي درجة التقاضي ووقت الجلسة بقوا `string`. `onChange` بتاع `DatePicker` بقى `(v: string)`. `.map((c:any))` على `clients` بقى `(c: ClientRow)`.
- **ملاحظة تحقق مهمة:** `lawyers` و`isAdmin` موجودين في البروبس بس مش مستخدمين فعليًا جوه الملف (مجرد ملاحظة للأمانة، مفيش تغيير).
- **تأكيد إضافي (مفيش باگ):** راجعت `handleSaveCase` في `useCaseActions.ts` للتأكد إن `form.type`/`form.number` (اللي الملف ده بيبنيهم محليًا) بيتمابوا صح لأعمدة `cases` الحقيقية (`case_type`/`case_number_official`) — الـ mapping سليم 100%، مفيش فصيلة باگ `case_type` هنا لأن الـ hook بيعمل التحويل صراحة.
- فحص TypeScript فعلي (معزول، مع stub لمكتبة `react`) رجع **صفر أخطاء** في الملف، غير الأخطاء البيئية المتوقعة في الملفات التابعة (`utils.ts`/`constants.ts` بتحتاجوا `supabaseClient`/`@supabase/supabase-js` غير متاحين في بيئة الفحص).

**ملاحظة:** مفيش أي باگ جديد اتكشف في الملف ده، ومفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للدفعة التالية من المرحلة 3 (المرشح الأخير في المرحلة: `EditCaseModal.tsx` (28) — هيتم التعامل معاه بحذر شديد وبالتنسيق معاك تحديدًا بسبب إشارته المحتملة لفصيلة باگ `case_type`/`case_number`).

### ✅ دفعة حادية عشر: `EditCaseModal.tsx` (28) — 28 → 0 (منجز، 14 يوليو 2026) — + إصلاح باگ حقيقي بموافقتك الصريحة

**🐛 باگ حقيقي اتكشف واتصلح بموافقتك الصريحة (مش تنظيف أنواع — بند منفصل):**

فحص الأنواع كشف إن `caseData` اللي بييجي لـ `EditCaseModal.tsx` شكله الفعلي `MappedCase` (من `useAppData.ts`)، وده كان ناقص 6 حقول حقيقية موجودة في جدول `cases`:

- **`session_hall`, `secretary_hall`, `secretary_name` — باگ فقدان بيانات فعلي:** الحقول دي بتُحفظ صح وقت إنشاء القضية (`handleSaveCase`)، بس كانت مش موجودة في `MappedCase`، فـ `EditCaseModal.tsx` كان بيقراها `undefined` دايمًا وبيفتح الفورم بحقول فاضية. وعلى الحفظ، `handleUpdateCase` كان بيكتب القيم الفاضية دي `null` **فوق القيم الحقيقية المحفوظة في قاعدة البيانات** — يعني أي تعديل لقضية (حتى تغيير بسيط في العنوان) كان بيمسح قاعة/سكرتير الجلسة المحفوظين فعليًا.
- **`court_floor`, `court_hall` — عرض غلط بس (مفيش فقدان بيانات):** نفس مشكلة القراءة (دايمًا فاضيين في الفورم)، بس `handleUpdateCase` مبيكتبهمش أصلاً لجدول `cases`، فمفيش تأثير على البيانات المحفوظة.
- **`session_time` — اتكشف تاني أثناء الفحص المعزول (TS error فعلي: "Property 'session_time' does not exist on type 'MappedCase'"):** عمود موجود في السكيما بس مش متكتوب في جدول `cases` أصلاً (لا في `handleSaveCase` ولا `handleUpdateCase` — القيمة الحقيقية بتتخزن على مستوى الجلسة في `case_sessions`)، فمفيش فقدان بيانات، بس شاشة التعديل كانت دايمًا بترجع لـ "صباحي" الافتراضي.

**الإصلاح المُطبَّق (`useAppData.ts`):** إضافة الحقول الستة لواجهة `MappedCase`، وإضافتها في الـ `.map()` بتاع `fetchCases` و`searchCases` (بتجيب من `r.court_floor`, `r.court_hall`, `r.session_hall`, `r.secretary_hall`, `r.secretary_name`, `r.session_time` — كل الأعمدة دي موجودة فعليًا في `CaseRow` الحقيقي).

**تحقق إضافي:** راجعت باقي الملفات اللي بتبني/تستهلك `MappedCase` (`ClientDetailModal.tsx`, `UniversalSearchModal.tsx`, `NewStandaloneSessionModal.tsx`, `QuickAddSessionModal.tsx`, `useCaseActions.ts`) — إضافة حقول جديدة للواجهة إضافية بس (additive) ومحدش منهم بيبني كائن `MappedCase` كامل بنفسه، فمفيش أي كسر.

---

**تنظيف الأنواع في `EditCaseModal.tsx` نفسه:**
- بروبس بقت `EditCaseModalProps` (`caseData: MappedCase` — بعد الإصلاح فوق، `onClose`, `onSave: (form: Record<string, any>) => void` — مطابقة لتوقيع `handleUpdateCase` الفعلي في `useCaseActions.ts`، `countryCourts?`, `countryCaseTypes?`).
- نوع محلي جديد `EditCaseForm` (21 حقل) بدل استدلال ضمني. دالة `s(k,v)` بقت جينيريك زي باقي الدفعات. `splitNum(num: string)` و`splitParty(val: string | null)` بقوا متوقين حسب النوع الفعلي لحقول `MappedCase` اللي بيتمرروا منها.
- كل `onChange:(e: any)` بقت متوقة حسب العنصر (`HTMLInputElement`/`HTMLSelectElement` للاثنين `Sel` بتوع المحكمة والتصنيف). `.map((lvl:any)/(t:any))` بقوا `string`. `DatePicker` onChange بقى `(v: string)`. مصفوفة خيارات حالة القضية (`{val,emoji,color}`) اتشال منها الـ `any` بالكامل (النوع مستنتج تلقائيًا من المصفوفة الصريحة).
- فحص TypeScript فعلي (معزول، مع كل الملفات التابعة: `shared.tsx`, `DatePicker.tsx`, `constants.ts`, `utils.ts`, `types.ts`, `useAppData.ts`) رجع **صفر أخطاء حقيقية** بعد إصلاح `MappedCase`، غير الأخطاء البيئية المتوقعة (`supabaseClient`/`@supabase/supabase-js` غير متاحين، والـ `window.__pendingSubscription` في `utils.ts`).

**ملاحظة:** مفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات في `EditCaseModal.tsx` نفسه — الإصلاح الوحيد كان في `useAppData.ts` وكان بموافقتك الصريحة كبند منفصل عن تنظيف الأنواع.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح. **المرحلة 3 خلصت بالكامل** — الباقي المرحلة 4 (شاشات عرض بس، منخفضة الخطورة جدًا) والمرحلة 5 (`App.tsx`/`main.tsx`، مؤجلة عمدًا لآخر حاجة). قولّي لو عايز نكمل على المرحلة 4، أو نوقف هنا مؤقتًا.

---

## المرحلة 4 — سجل الإنجاز

### ✅ دفعة أولى: `src/components/dashboard/DashboardTab.tsx` (44 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `DashboardTabProps` — مطابقة تمامًا لبروبس الفعلية المُرسلة من `App.tsx` (`cases: MappedCase[]`, `clients: MappedClient[]`, `todaySessions/upcomingSessions/missedSessions: SessionFeedItem[]`, `upcomingTasks/missedTasks: TaskFeedItem[]`, `healthErrors: ServiceStatus[]`... إلخ) — كل الأنواع دي مستوردة من `useAppData.ts`/`useDashboardFeed.ts`/`systemHealth.ts` الموجودين بالفعل من المرحلة 2 (مفيش نوع جديد اتضاف لهم).
- `standaloneTarget` بقى `SessionFeedItem | null` بدل `any`.
- `buildSessionCard`/`buildTaskCard` (الدالتين المسؤولتين عن بناء كروت الجلسات/المهام) بقوا بتوقيع كامل بدل كل باراميتراتهم `any`.
- **نوع محلي جديد `LinkedCaseLike`:** فحص الأنواع كشف إن `linkedCase` (المتغيّر اللي بيتحسب في 3 أماكن مختلفة بالملف) بييجي فعليًا من مصدرين مختلفين الشكل: إما `cases.find(...)` (شكله `MappedCase`) أو الكائن المدمج `s.cases` جوه استعلام الجلسة (شكله `SessionCaseEmbed` من `useDashboardFeed.ts`) — الكود الأصلي كان بيتعامل مع الاتنين بنفس المتغير عن طريق `?.`/`||` (زي `linkedCase?.court_name || linkedCase?.court`)، وده سلوك مقصود مش باگ (كل مصدر بيغطي حالة مختلفة). النوع الجديد `Partial<MappedCase> & Partial<SessionCaseEmbed>` بيوثّق الاستخدام الحقيقي ده بالظبط.
- كل الأماكن اللي `linkedCase` بيتحسب فيها اتحطلها كاست موثّق `as LinkedCaseLike | undefined` (والتمرير لـ `setSelectedCase` بكاست `as MappedCase`) — من غير أي تغيير في القيمة الفعلية وقت التشغيل، بس عشان الكومبايلر يقبل النوع المُجمَّع من مصدرين.
- كاستات موثّقة زي باقي الدفعات: `(s.session_date as string)`, `(r.due_date as string)` في كل مكان بيتبني فيه `new Date(...)` من عمود نوعه `string | null` في السكيما (الكود الأصلي كان بيعتمد ضمنيًا إن القيمة موجودة فعليًا، زي ما كانت).
- تمرير `standaloneTarget` لمودال `StandaloneSessionDetailModal` (اللي بيتوقع `session: CaseSessionRow` كامل) بقى بكاست موثّق `as unknown as CaseSessionRow` — نفس نمط الكاست المستخدم في دفعات سابقة لكائنات جزئية (`UniversalSearchModal.tsx`), لأن `standaloneTarget` شكله الفعلي `SessionFeedItem` (نتيجة استعلام مُطبَّع جزئي) مش صف `case_sessions` كامل.
- فحص TypeScript فعلي (معزول، مع كل الملفات التابعة: `useAppData.ts`, `useDashboardFeed.ts`, `systemHealth.ts`, `shared.tsx`, `constants.ts`) رجع **صفر أخطاء حقيقية**، غير الأخطاء البيئية المتوقعة (`react`/`@supabase/supabase-js` غير متاحين في بيئة الفحص المعزولة).

**ملاحظة:** مفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات في الملف — كل التعديلات كانت أنواع وكاستات توثيقية بس. مفيش باگ جديد اتكشف (الحالة الوحيدة اللي شكلها باگ في البداية — `court_name`/`court` — اتضح إنها تعامل مقصود مع مصدرين مختلفين للبيانات، مش باگ).

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4 (المرشح التالي: `TimelineSection.tsx` أو `CalendarTab.tsx`).

### ✅ دفعة ثانية: `src/components/sessions-calendar/CalendarTab.tsx` (28 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `CalendarTabProps` (`cases: MappedCase[]`, `clients: MappedClient[]`, `onOpenCase: (c: MappedCase) => void`, `onOpenStandalone: (s: CalendarSessionRow) => void`) — مطابقة لِـ props الفعلية المُرسلة من `SessionsCalendar.tsx`.
- نوع محلي جديد `CalendarSessionRow` بيوصف بالظبط أعمدة استعلامي `case_sessions` في الملف (نفس أسلوب `SessionFeedItem` في `useDashboardFeed.ts`)، بالإضافة لإعادة استخدام `SessionCaseEmbed` الموجود بالفعل (نفس شكل الـ join `cases(...)` بالضبط) بدل ما يتكرر تعريفه.
- `allSessions` بقت `useState<CalendarSessionRow[]>` بدل `any[]`. `sessionsMap: Record<string, CalendarSessionRow[]>` بدل `Record<string, any[]>`.
- كل الـ `.map`/`.filter`/`.find`/`.forEach` (على الأيام، القضايا، الموكلين، الجلسات) بقت متوقة بالنوع الصحيح بدل `any`. الـ 2 `onChange` بتوع فلتر الشهر/السنة بقوا `React.ChangeEvent<HTMLSelectElement>`.
- **كاستات موثّقة (بدون تغيير سلوك):** `data as unknown as CalendarSessionRow[]` في الاستعلامين (Supabase مش قادر يستنتج نوع دقيق لاستعلام فيه join باسم مستعار)، و`s.session_date as string` في كل مكان بيتقارن أو بيتستخدم فيه كمفتاح Object أو `.localeCompare()` — العمود نوعه `string | null` في السكيما، والكود الأصلي كان بيعتمد ضمنيًا إن القيمة موجودة فعليًا (زي ما كانت، مفيش أي فحص `null` جديد اتضاف).
- فحص TypeScript فعلي (معزول) رجع **صفر أخطاء حقيقية**، غير خطأ `react` البيئي المتوقع.

**ملاحظة:** مفيش أي باگ جديد اتكشف، ومفيش أي تغيير في منطق أو شرط أو نداء قاعدة بيانات. `SessionCard.tsx` (اللي بيستقبل الجلسة من هنا) لسه `any` بالكامل — برّه نطاق الدفعة دي، مفيش أي تعارض نوع لأنه بياخد أي شكل.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4 (المرشح التالي: `TimelineSection.tsx`).

### ✅ دفعة ثالثة: `src/components/case-detail/TimelineSection.tsx` (30 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `TimelineSectionProps` — مطابقة لتوقيعات `useCaseDetailActions.ts` الفعلية (`sessions: CaseSessionRow[]`, `setSessionUpdateTarget: (s: CaseSessionRow) => void`, `deletingSessionId: string | null`, `setConfirmDeleteSession: (v: {id:string,date:string}|null) => void`، `handleAddSession`/`savingSession`/`loadingSessions`/`showAddSession`).
- **نوعين محليين جداد `SessionForm`/`EditingSessionForm`:** فحص الأنواع كشف إن `sessionForm`/`editingSession` بيتعامل معاهم الكود فعليًا كـ"فورم وسيط" (`date`, `time_period`, `location_floor`, `location_hall`, ...) — نفس الشكل اللي `handleUpdateSession` بيتوقعه بالظبط في `useCaseDetailActions.ts` (`{ date: string; time_period?; location_floor?; ... }`)، وده **مختلف عن نوع `editingSession` state المُعلن في الهوك نفسه (`CaseSessionRow | null`)**. النوعين الجداد بيوثّقوا الاستخدام الحقيقي في الملف ده بالظبط، بدل ما يتفرض نوع `CaseSessionRow` غلط كان هيكسر الملف فور ما يتشال الـ `any`.
- كل الـ `onChange`/`onClick` بقت متوقة (`React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent`، أو `string` لـ `DatePicker`/أزرار وقت الجلسة). `sessions.map((s, i))` بقى `(s: CaseSessionRow, i: number)`.
- كاست بسيط `(p as EditingSessionForm)` في الـ 7 أماكن اللي بتبني `setEditingSession(p => ({...p, field: val}))` — عشان التوقيع النوعي لـ `editingSession` (`EditingSessionForm | null`) يسمح بالـ spread، من غير أي تغيير في السلوك وقت التشغيل (الأماكن دي بتتنفذ بس لما `editingSession` أصلاً مش `null`، فالكاست بيوثّق ضمانة موجودة فعلاً في الكود، مش افتراض جديد).
- فحص TypeScript فعلي (معزول) رجع **صفر أخطاء حقيقية**، غير خطأ `react` البيئي المتوقع.

**ملاحظة اتكشفت (مش باگ فعلي، بس نوع state غير دقيق في ملف تاني — برّه نطاق الدفعة دي):**
حالة `editingSession` في `useCaseDetailActions.ts` (اللي اتعمل في جلسة سابقة قبل بداية سجل المرحلة 2 في التقرير ده) متعلّمة `useState<CaseSessionRow | null>`، لكن فعليًا بيتخزّن فيها شكل فورم مختلف تمامًا (`EditingSessionForm` فوق). ده مش بيسبب أي مشكلة وقت التشغيل حاليًا (الكود شغال صح لأن كل حاجة كانت `any`)، بس النوع المُعلن في الهوك مش دقيق. تصحيحه هيحتاج تعديل بسيط في `useCaseDetailActions.ts` (تغيير نوع الـ state بس، مش أي منطق) — قرارك لو عايز نصلحه دلوقتي كبند منفصل أو نسيبه كملاحظة توثيقية بس.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4 (المرشح التالي: `UpcomingSessionsList.tsx` أو `ArchiveTab.tsx`).

### ✅ دفعة رابعة: `src/components/UpcomingSessionsList.tsx` (18 → 0) — منجز، 14 يوليو 2026

**⚠️ ملاحظة مهمة اتكشفت (مش تنظيف أنواع — للعلم فقط، مفيش أي تغيير اتعمل بسببها):**
الملف ده مش متستورد أو مستخدم في أي مكان تاني في الكوباس بالكامل (بحثت في كل المشروع). يعني المكوّن ده "يتيم" — مبني وموجود بس مش متوصّل بأي شاشة فعلية. ده ملحوظة بس، مش تغيير — الملف اتنضّف زي باقي الدفعات بافتراض إنه هيتم استخدامه لاحقًا، وقرارك لو عايز تشيله نهائيًا أو تستخدمه فين.

**تنظيف الأنواع:**
- بروبس بقت `UpcomingSessionsListProps` (`db: SupabaseClient<Database>` — نفس أسلوب `SessionUpdateModal.tsx`، `cases: MappedCase[]`, `clients: MappedClient[]`, `onOpenCase?: (c: MappedCase) => void`).
- نوع محلي جديد `UpcomingSessionRow` بيوصف بالظبط أعمدة استعلام `case_sessions` الأول في الملف، بإعادة استخدام `SessionCaseEmbed` الموجود بالفعل في `useDashboardFeed.ts` لعلاقة `cases` المدمجة (نفس شكل الـ join بالظبط).
- نوع محلي جديد `LatestSessionRow` لاستعلام `case_sessions` التاني (المُصغّر، بس `id,case_id,session_date`).
- نوع محلي جديد `DayInfo` لعنصر اليوم اللي بيتبني في `buildDays()`.
- إعادة استخدام `LinkedCaseLike` (`Partial<MappedCase> & Partial<SessionCaseEmbed>`) بنفس تعريف وأسلوب الكاست اللي في `DashboardTab.tsx` بالظبط — لأن `linkedCase` هنا بييجي من نفس المصدرين المختلفين الشكل بالضبط (كائن `cases` المدمج أو `cases.find(...)` من الـ prop).
- كاستات موثّقة زي باقي الدفعات: `(data || []) as unknown as UpcomingSessionRow[]`/`LatestSessionRow[]` في نتيجتي الاستعلامين (نفس أسلوب `CalendarTab.tsx`)، و`s.session_date as string`/`s.case_id as string` في الأماكن اللي بيتستخدموا فيها كمفاتيح Object (العمودين نوعهم `string | null` في السكيما، والكود الأصلي كان بيعتمد ضمنيًا إن القيمة موجودة، زي ما كانت).
- تمرير `sessionUpdateTarget`/`caseData` لـ `SessionUpdateModal` (اللي بيتوقع `CaseSessionRow`/`CaseRow` كاملين) بقى بكاست موثّق `as unknown as CaseSessionRow`/`CaseRow` — نفس النمط المستخدم في `StandaloneSessionDetailModal.tsx` لنفس المودال بالظبط، من غير أي تغيير في القيمة الفعلية وقت التشغيل.

**ملحوظة تقنية بسيطة (مش تغيير منطق):** إزالة `onNotify: null` من استدعاء `SessionUpdateModal` (البروب اختياري `onNotify?: (msg: string) => void` — تمرير `null` صريح مش نوع مقبول له، وإسقاطه بالكامل مطابق تمامًا لتمرير `undefined`؛ الكود جوه المودال بيتحقق بـ `if(onNotify)` وده `false` في الحالتين، فمفيش أي فرق في السلوك وقت التشغيل).

فحص TypeScript فعلي (معزول، مع كل الملفات التابعة: `SessionUpdateModal.tsx`, `useAppData.ts`, `useDashboardFeed.ts`, `types.ts`, `constants.ts`, `database.types.ts`, `supabaseClient.ts`) رجع **صفر أخطاء حقيقية**، غير الأخطاء البيئية المتوقعة (`react`/`@supabase/supabase-js` غير متاحين، و`data`/`all` implicit any جوه `.then()` — نفس الضوضاء البيئية اللي ظهرت في `CalendarTab.tsx` قبل كده لنفس السبب بالظبط).

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4 (المرشح التالي: `ArchiveTab.tsx`).

### ✅ دفعة خامسة: `src/components/ArchiveTab.tsx` (22 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `ArchiveTabProps` (`cases: MappedCase[]`, `clients: MappedClient[]`) — مطابقة لاستدعاء `App.tsx` الفعلي (`React.createElement(ArchiveTab, { cases, clients })`).
- `docs`/`viewingDoc` بقوا `CaseDocumentRow[]`/`CaseDocumentRow | null` (من `types.ts` المركزي — مطابق تمامًا لأعمدة جدول `case_documents` الحقيقية، بما فيها `file_url` اللي بيتبدّل برابط موقّع طازة في `fetchDocs`).
- `pendingFile` بقى `File | null`، `deletingId` بقى `string | null` (بيتخزن فيه `doc.id` بس فعليًا)، `fileInputRef` بقى `useRef<HTMLInputElement>(null)`.
- `catColors` بقى `Record<string, string>` بدل `Record<string, any>` (القيم كلها className strings).
- كل الـ `.map`/`.find`/`.filter` (على `docs`, `cases`, `CATS`) بقت متوقة بالنوع الصحيح، وكل `onChange` بقى `React.ChangeEvent<HTMLInputElement>`/`React.ChangeEvent<HTMLSelectElement>` حسب العنصر.
- `getDocMeta`/`handleDelete` بقوا بياخدوا `CaseDocumentRow` بدل `any`.
- كاستات موثّقة (بدون تغيير سلوك): `doc.storage_path as string` و`doc.file_url as string` (الأعمدة نوعها `string | null` في السكيما، والكود الأصلي كان بيعتمد ضمنيًا إن القيمة موجودة فعليًا وقت الاستخدام، زي ما كانت)، و`catColors[doc.category as string]` (نفس المنطق بالظبط — `catColors[null]` في JS كان برضه هيرجع `undefined` ويقع على القيمة الافتراضية `||`، فمفيش أي فرق في الناتج الفعلي).
- `(pendingFile.name.split('.').pop() as string).toLowerCase()` — كاست بسيط لأن `.pop()` نوعه `string | undefined` رسميًا، رغم إن `pendingFile.name` مضمون فيه نقطة دايمًا عمليًا (validateUploadFile بيتحقق من الامتداد قبل كده).
- استدعاء `getDocMeta(pendingFile as unknown as CaseDocumentRow)` في فورم الرفع — **كاست بس، مفيش أي تغيير في القيمة الممرة وقت التشغيل** (لسه `pendingFile` نفسه اللي بيتمرر، مش كائن جديد).

**⚠️ ملاحظة اتكشفت (مش باگ بمعنى كسر البيانات، بس سلوك عرض دايمًا ثابت — للعلم فقط، مفيش أي تغيير اتعمل بسببها):**
في فورم الرفع (قبل الضغط على "رفع")، أيقونة معاينة الملف بتتحدد بـ `getDocMeta(pendingFile)` — لكن `pendingFile` هنا كائن `File` خام (من `<input type="file">`)، وده معندوش خاصية `original_name` ولا `file_name` (اللي `getDocMeta` بتقرا منهم اسم الملف لتحديد نوعه) — بس عنده `.name`. يعني الأيقونة المعروضة في فورم الرفع دايمًا بترجع 📎 (الأيقونة الافتراضية) بدل ما تعكس نوع الملف الفعلي (📄 PDF، 🖼 صورة...)، مهما كان امتداد الملف. ده تأثير بصري بس (الأيقونة قبل الرفع)، مفيش أي تأثير على الملف اللي بيترفع فعليًا أو بياناته. تصحيحه (لو حبيت) هيحتاج تمرير `{original_name: pendingFile.name}` بدل `pendingFile` — تغيير سطر واحد بس، قرارك.

فحص TypeScript فعلي (معزول، مع كل الملفات التابعة: `PdfViewerModal.tsx`, `shared.tsx`, `constants.ts`, `useAppData.ts`, `supabaseClient.ts`, `utils.ts`, `types.ts`) رجع **صفر أخطاء حقيقية**، غير الأخطاء البيئية المتوقعة المعتادة.

**ملاحظة إضافية (بدون تغيير):** بروب `clients` بيتستقبل في الملف بس مش بيتستخدم فعليًا في أي مكان جوه — نفس الحال زي ما كان قبل التنظيف، اتسابت زي ما هي.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4.

### ✅ دفعة سادسة: `src/components/sessions-calendar/MonthListTab.tsx` (18 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `MonthListTabProps` — مطابقة لاستدعاء `SessionsCalendar.tsx` الفعلي (`cases: MappedCase[]`, `clients: MappedClient[]`, `onOpenCase: (c: MappedCase) => void`, `onOpenReminders: () => void` — مؤكدة من `App.tsx` (`() => { setRemindersInitialFilter('overdue'); setTab('reminders'); }`)، `onOpenStandalone: (s: MonthSessionRow) => void`).
- **نوع محلي جديد `MonthSessionRow`:** بدل ما يتكرر تعريف كل أعمدة الجلسة من الصفر، اتعمل `extends CalendarSessionRow` (النوع المُصدَّر بالفعل من `CalendarTab.tsx`) + الأعمدة الثلاثة الإضافية الحقيقية المطلوبة في select الملف ده بس (`plaintiff_national_id`, `plaintiff_power_of_attorney`, `defendant_national_id` — اتأكدت من `database.types.ts` إنهم أعمدة حقيقية في `case_sessions`).
- نوعين محليين جداد `WeekBound`/`WeekInfo` لعناصر `weekBounds`/`weeks` بدل `any`.
- `tasks`/`tasksMap` بقوا `TaskFeedItem[]`/`Record<string, TaskFeedItem[]>` (نوع مُعاد استخدامه من `useDashboardFeed.ts`) بدل `any[]` — رغم إن الحالة دي دايمًا بتتبني فاضية (`setTasks([])`) في الكود الحالي، النوع بيوثّق الشكل المقصود لو اتفعّلت لاحقًا.
- كل `.map`/`.forEach`/`.find` بقت متوقة بالنوع الصحيح، و`prevMonth`/`nextMonth` (اللي بيستخدموا `setViewYear`/`setViewMonth` بصيغة callback) بقوا `(y: number)`/`(m: number)` بدل `any`.
- `handleGoogleExport` بقت بتاخد `(s: MonthSessionRow, e: React.MouseEvent)` بدل `any, any`.
- كاست موثّق واحد: `(data || []) as unknown as MonthSessionRow[]` في نتيجة الاستعلام (نفس أسلوب `CalendarTab.tsx`/`ArchiveTab.tsx`)، و`s.session_date as string`/`r.due_date as string` في مفاتيح الـ `Record` (نفس نمط الكاستات الموثّقة في كل الدفعات السابقة).

فحص TypeScript فعلي (معزول، مع كل الملفات التابعة: `CalendarTab.tsx`, `DayCard.tsx`, `MonthWeekView.tsx`, `useAppData.ts`, `useDashboardFeed.ts`, `shared.tsx`, `constants.ts`) رجع **صفر أخطاء حقيقية**، غير الأخطاء البيئية المتوقعة المعتادة (`react`/`@supabase/supabase-js` غير متاحين، و`data` implicit any جوه `.then()`).

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4.

### ✅ دفعة سابعة: `src/components/sessions-calendar/MissedTab.tsx` (10 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `MissedTabProps` — مطابقة لاستدعاء `SessionsCalendar.tsx` الفعلي (`cases: MappedCase[]`, `clients: MappedClient[]`, `onOpenCase: (c: MappedCase) => void`, `onOpenReminders: () => void`, `onOpenStandalone: (s: CalendarSessionRow) => void`).
- أعيد استخدام `CalendarSessionRow` من `CalendarTab.tsx` مباشرة بدل ما يتعمل نوع جديد — أعمدة استعلام `case_sessions` في الملف ده مطابقة تمامًا لنفس الأعمدة المُعرّفة في `CalendarTab.tsx`. وأعيد استخدام `TaskFeedItem` من `useDashboardFeed.ts` لنفس السبب (نفس أعمدة select الـ `reminders` بالظبط).
- نوع محلي جديد `LinkedCaseLike` (`Partial<MappedCase> & Partial<SessionCaseEmbed>`) بنفس تعريف وأسلوب `DashboardTab.tsx`/`UpcomingSessionsList.tsx` — لأن `linkedCase` هنا بييجي من نفس المصدرين المختلفين الشكل بالظبط (كائن `cases` المدمج أو `cases.find(...)` من الـ prop).
- كل الـ `.filter`/`.map` بقت متوقة بالنوع الصحيح، و`fmtDate` بقت بتاخد `s.session_date as string` (كاست بسيط، العمود نوعه `string | null` في السكيما).
- كاستات موثّقة زي باقي الدفعات: `(data || []) as unknown as CalendarSessionRow[]`/`TaskFeedItem[]` في نتيجتي الاستعلامين، و`onOpenCase(linkedCase as MappedCase)` عند فتح القضية من الجلسة الفائتة — نفس نمط الكاست المستخدم في `UpcomingSessionsList.tsx` بالظبط لنفس الحالة.

فحص TypeScript فعلي (معزول، مع كل الملفات التابعة: `CalendarTab.tsx`, `SessionCard.tsx`, `TaskCard.tsx`, `useAppData.ts`, `useDashboardFeed.ts`, `supabaseClient.ts`, `utils.ts`) رجع **صفر أخطاء حقيقية**، غير الأخطاء البيئية المتوقعة المعتادة (`react`/`@supabase/supabase-js` غير متاحين، و`data` implicit any جوه `.then()`).

**ملاحظة:** مفيش أي باگ جديد اتكشف. `TaskCard.tsx` (اللي بيستقبل عنصر المهمة) لسه `any` بالكامل — برّه نطاق الدفعة دي، مفيش أي تعارض نوع لأنه بياخد أي شكل.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4.

### ✅ دفعة ثامنة: `src/components/dashboard/ClientsTab.tsx` (8 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `ClientsTabProps` — مطابقة لاستدعاء `App.tsx` الفعلي (`cases: MappedCase[]`, `clients: MappedClient[]`, `clientSearch: string`, `setClientSearch: (v: string) => void`, `clientsPage: number`, `setClientsPage: (n: number) => void`, `clientsTotal: number`, `clientsLoading: boolean`, `fetchClients: (page?, search?) => void`, `setSelectedClient: (c: MappedClient) => void`, `setShowClientModal: (v: boolean) => void`).
- `isEntity`, `filtered`, `indCount`, `entCount`، وكل الـ `.filter`/`.map` بقوا متوقين بـ `MappedClient`/`MappedCase` بدل `any`.
- **استثناء اتصلح بدل ما يتسايب:** السطرين اللي كانوا بيستخدموا `window as any` لتخزين مؤقت البحث المؤجّل (debounce timer) اتحولوا لنوع صريح موثّق (`interface WindowWithClientSearchTimer extends Window { _clientSearchTimer?: ReturnType<typeof setTimeout> }`) بدل ما يفضلوا `any` — من غير أي تغيير في السلوك وقت التشغيل.

فحص TypeScript فعلي (معزول، مع كل الملفات التابعة: `constants.ts`, `useAppData.ts`, `supabaseClient.ts`, `utils.ts`) رجع **صفر أخطاء حقيقية** في الملف — غير الضوضاء البيئية المعتادة، وأخطاء موجودة أصلاً (قبل الدفعة دي) في `utils.ts` (ملف تاني، برّه نطاق الدفعة).

**ملاحظة:** مفيش أي باگ جديد اتكشف.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4 (المرشح التالي: `UpcomingWidget.tsx`).

### ✅ دفعة تاسعة: `src/components/sessions-calendar/UpcomingWidget.tsx` (7 → 0) — منجز، 14 يوليو 2026

**⚠️ ملاحظة مهمة اتكشفت (مش تنظيف أنواع — للعلم فقط، مفيش أي تغيير اتعمل بسببها):**
الملف ده — زي `UpcomingSessionsList.tsx` قبل كده بالظبط — مش متستورد أو مستخدم فعليًا في أي مكان. بيتم استيراده (`import`) في `CalendarTab.tsx` بس من غير أي استدعاء `React.createElement(UpcomingWidget, ...)` في أي مكان في المشروع كله. يعني مكوّن "يتيم" تاني. اتنضّف زي باقي الدفعات بافتراض إنه هيتم استخدامه لاحقًا، وقرارك لو عايز تشيله أو تستخدمه فين.

**تنظيف الأنواع:**
- بروبس بقت `UpcomingWidgetProps` (`cases: MappedCase[]`, `clients: MappedClient[]`, `onOpenCase?: (c: MappedCase) => void` — اختياري لأن الكود بيتحقق منه بـ `onOpenCase &&` قبل الاستخدام).
- أعيد استخدام `CalendarSessionRow` من `CalendarTab.tsx` مباشرة (نفس أعمدة استعلام `case_sessions` بالظبط زي `CalendarTab.tsx`/`MissedTab.tsx`).
- نوع محلي جديد `LinkedCaseLike` بنفس تعريف `MissedTab.tsx`/`DashboardTab.tsx` (`Partial<MappedCase> & Partial<SessionCaseEmbed>`).
- نوع محلي جديد `UrgencyStyle` (`{bg:string; border:string; text:string}`) لكائن ألوان مستوى الإلحاح (`red`/`amber`/`blue`/`slate`) بدل `st: any`.
- كاست موثّق واحد: `(data || []) as unknown as CalendarSessionRow[]` في نتيجة الاستعلام، و`s.session_date as string` في `formatDate`، و`onOpenCase(linkedCase as MappedCase)` — نفس الأنماط المستخدمة في `MissedTab.tsx`/`UpcomingSessionsList.tsx`.

فحص TypeScript فعلي (معزول، مع كل الملفات التابعة: `CalendarTab.tsx`, `SessionCard.tsx`, `useAppData.ts`, `useDashboardFeed.ts`, `supabaseClient.ts`, `utils.ts`) رجع **صفر أخطاء حقيقية**، غير الأخطاء البيئية المتوقعة المعتادة.

**ملاحظة:** مفيش أي باگ جديد اتكشف.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4.

### ✅ دفعة عاشرة: `src/components/case-detail/DocsSection.tsx` (7 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `DocsSectionProps` — مطابقة تمامًا لتوقيعات `useCaseDetailActions.ts` الفعلية (`fileInputRef: React.RefObject<HTMLInputElement | null>`, `handleFileSelect: (e: { target: HTMLInputElement }) => void`, `pendingFile: File | null`, `handleUploadDoc: () => void | Promise<void>`, `docs: CaseDocWithUrl[]`, `setConfirmDeleteDoc: (v: {id, file_name, storage_path} | null) => void`, `deletingDocId: string | null`، إلخ) — كل ده كان أصلًا متوقّن بالكامل في الهوك، مجرد ما كانش متوصّل بالملف ده.
- **تعديل نوعي بسيط برّه الملف نفسه:** نوع `CaseDocWithUrl` (`CaseDocumentRow & {file_url: string|null}`) كان معرّف جوه `useCaseDetailActions.ts` بس مش `export`— اتضاف `export` بس (سطر واحد، بدون أي تغيير في القيمة أو المنطق) عشان `DocsSection.tsx` يقدر يستورده بدل ما يتكرر تعريفه من الصفر.
- `docs.filter`/`.map` بقوا متوقين بـ `CaseDocWithUrl`، و`Record<string, any>` الخاص بألوان التصنيف بقى `Record<string, string>` (القيم كلها className strings).
- `onChange` بتاعت `Inp`/`Sel`/حقل البحث بقت `React.ChangeEvent<HTMLInputElement>`/`React.ChangeEvent<HTMLSelectElement>` حسب العنصر.
- **كاستات ظهرت بعد فحص TypeScript الفعلي (نفس نمط `created_at`/`storage_path` في `ArchiveTab.tsx`/`useAdminBackup.ts` قبل كده):** الفحص الفعلي كشف إن `doc.original_name || doc.file_name` (عمودين نوعهم `string | null` في السكيما) بيتمرر لـ `.test()` (اللي بتاخد `string` بس رسميًا) في 5 أماكن، و`doc.created_at` (برضه `string | null`) بيتمرر لـ `new Date()`. الكود الأصلي كان بيعتمد ضمنيًا إن القيمة موجودة فعليًا وقت الاستخدام (لأي مستند فعلاً موجود، الاسم والتاريخ لازم يكونوا موجودين) — اتضافت كاستات `as string` في الـ 6 أماكن دي، من غير أي تغيير في الشرط أو الترتيب أو أي قيمة فعلية وقت التشغيل.

فحص TypeScript فعلي (معزول) رجع **صفر أخطاء حقيقية** في `DocsSection.tsx` نفسه — غير الضوضاء البيئية المعتادة. (فيه أخطاء implicit-any موجودة أصلًا في دوال تانية جوه `useCaseDetailActions.ts` — برّه نطاق الدفعة دي، ومفيش أي علاقة بينها وبين إضافة `export` اللي اتعملت.)

**ملاحظة:** مفيش أي باگ جديد اتكشف — كل الكاستات كانت توثيق لضمانة وقت التشغيل موجودة فعلًا، مش تغيير في المنطق.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4.

### ✅ دفعة حادية عشرة: `src/components/dashboard/CasesTab.tsx` (5 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `CasesTabProps` — مطابقة لاستدعاء `App.tsx` الفعلي (`cases: MappedCase[]`, `casesFilter: string`, `fetchCases: (page?, filter?) => void`, `searchCases: (term, filter?) => void`, `setSelectedCase: (c: MappedCase) => void`, `dbError: string | null`، إلخ — كل الأنواع مطابقة لتوقيعات `useAppData.ts` الفعلية).
- نوع محلي جديد `CaseSection` بيوصف شكل عناصر مصفوفة `caseSections` الثابتة (تابات نشطة/مؤجلة/منتهية/مغلقة) بدل `any`.
- `renderCaseCard`, `caseSections.map`, `cases.map` بقوا متوقين بـ `MappedCase`/`CaseSection` بدل `any`.

فحص TypeScript فعلي (معزول) رجع **صفر أخطاء حقيقية**، غير الضوضاء البيئية المعتادة.

**ملاحظة:** مفيش أي باگ جديد اتكشف.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4.

### ✅ دفعة اثنا عشرة: `src/components/case-detail/NotesSection.tsx` (5 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `NotesSectionProps` — مطابقة تمامًا لاستدعاء `CaseDetailView.tsx` الفعلي، وكل الحقول موقّتة بنفس أنواع `useCaseDetailActions.ts` (مثلاً `handleUpdateNote: (noteId: string, content: string) => void | Promise<void>`، `setConfirmDeleteNote: (v: {id, preview} | null) => void`).
- `notes: CaseNoteRow[]` بدل `any[]` — نوع مُصدَّر بالفعل من `types.ts` (`Tables<'case_notes'>`)، مفيش نوع جديد اتعمل.
- `onChange` بتاعت الـ `textarea`ين بقت `React.ChangeEvent<HTMLTextAreaElement>` بدل `any`.
- `notes.map((n: any, i: any) => ...)` بقت `notes.map((n: CaseNoteRow) => ...)` — البارامتر `i` (index) اتشال لأنه ماكانش مستخدم في الكود أصلًا.
- **كاستات ظهرت بعد فحص TypeScript الفعلي (نفس نمط `DocsSection.tsx`):** `content`/`created_at` أعمدة نوعها `string | null` في السكيما، بس بيتم استخدامها في 3 أماكن بافتراض إنها موجودة فعليًا وقت العرض (`new Date(n.created_at)`, `setEditingNoteText(n.content)`, `(n.content||'').slice(0,40)`) — اتضافت كاستات `as string` في الـ 3 أماكن دي بس، من غير أي تغيير في الشرط أو القيمة الفعلية وقت التشغيل.

فحص TypeScript فعلي (معزول، مع `types.ts`, `constants.ts`) رجع **صفر أخطاء حقيقية** في الملف — غير الضوضاء البيئية المعتادة (`react`/`@supabase/supabase-js` غير متاحين، وأخطاء implicit-any موجودة أصلًا في `utils.ts` برّه نطاق الدفعة).

**ملاحظة:** مفيش أي باگ جديد اتكشف. كل الكاستات كانت توثيق لضمانة وقت التشغيل موجودة فعلًا (أي ملاحظة معروضة لازم يكون ليها محتوى وتاريخ إنشاء)، مش تغيير في المنطق.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4 (المرشح التالي: `InfoSection.tsx`، برضه 5 `any`).

### ✅ دفعة تلاتاشر: `src/components/case-detail/InfoSection.tsx` (5 → 0) — منجز، 14 يوليو 2026

**تنظيف الأنواع:**
- بروبس بقت `InfoSectionProps` — `caseData: MappedCase` (مش `CaseRow`)، لأن القيمة الفعلية اللي بتوصل هنا (عبر `CaseDetailView.tsx` ← `App.tsx` ← `selectedCase`) هي عنصر من مصفوفة `cases` المُطبّعة (`MappedCase[]` من `useAppData.ts`)، مش صف خام من الجدول. **ده مهم:** `caseData.type`/`caseData.number` هنا **مش نفس باگ** `case_type`/`case_number` اللي اتكشف قبل كده في `useCaseDetailActions.ts` — هناك كانت المشكلة إن الهوك بياخد `CaseRow` خام (الأعمدة الحقيقية `case_type`/`case_number_official`، مفيش `type`/`number`). هنا `MappedCase` عندها فعليًا حقلين اسمهم `type`/`number` بالظبط (اتعملهم mapping صريح في `useAppData.ts`: `type: r.case_type || 'عام'`, `number: r.case_number_official || '—'`) — فمفيش أي باگ، القيم بتوصل صح فعليًا. اتأكدت من ده بمطابقة كل حقل مستخدم في الملف (`title`, `type`, `court`, `court_level`, `circuit_number`, `number`, `date`, `status`, `plaintiff`, `defendant`) مع تعريف `MappedCase` حقل حقل.
- `client: MappedClient | null`, `sessions: CaseSessionRow[]`, `notes: CaseNoteRow[]`, `docs: CaseDocWithUrl[]` — كلهم أنواع مُصدَّرة بالفعل (من `useAppData.ts`/`types.ts`/`useCaseDetailActions.ts`)، مفيش نوع جديد اتعمل غير نوع محلي واحد.
- نوع محلي جديد `InfoRow` (`{label: string; value: string | null}`) لعناصر مصفوفة الصفوف الثابتة (`caseSections`-وية الشكل) بدل الـ 3 `any` في `.filter`/`.map` (`r`, `row`, `arr`).

فحص TypeScript فعلي (معزول، مع `types.ts`, `useAppData.ts`, `useCaseDetailActions.ts`, `constants.ts`, `utils.ts`, `supabaseClient.ts`, `systemHealth.ts`) رجع **صفر أخطاء حقيقية** في `InfoSection.tsx` نفسه — غير الضوضاء البيئية المعتادة، وأخطاء implicit-any موجودة أصلًا في دوال تانية جوه `useCaseDetailActions.ts` (برّه نطاق الدفعة، زي ما اتقال في دفعة `DocsSection.tsx`/`NotesSection.tsx`).

**ملاحظة:** مفيش أي باگ جديد اتكشف — بالعكس، الفحص أكّد إن الحقول هنا سليمة وموثّقة صح، ومفيش أي تشابه فعلي مع باگ `case_type` القديم رغم تشابه الاسم.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4.

**تنظيف الأنواع:**
- بروبس بقت `CasesTabProps` — مطابقة لاستدعاء `App.tsx` الفعلي (`cases: MappedCase[]`, `casesFilter: string`, `fetchCases: (page?, filter?) => void`, `searchCases: (term, filter?) => void`, `setSelectedCase: (c: MappedCase) => void`, `dbError: string | null`، إلخ — كل الأنواع مطابقة لتوقيعات `useAppData.ts` الفعلية).
- نوع محلي جديد `CaseSection` بيوصف شكل عناصر مصفوفة `caseSections` الثابتة (تابات نشطة/مؤجلة/منتهية/مغلقة) بدل `any`.
- `renderCaseCard`, `caseSections.map`, `cases.map` بقوا متوقين بـ `MappedCase`/`CaseSection` بدل `any`.

فحص TypeScript فعلي (معزول) رجع **صفر أخطاء حقيقية**، غير الضوضاء البيئية المعتادة.

**ملاحظة:** مفيش أي باگ جديد اتكشف.

**الحالة:** في انتظار تأكيد بناء Vercel ناجح قبل الانتقال للملف التالي في المرحلة 4.

### ✅ دفعة رابعة عشرة (دفعة كبيرة، 7 ملفات مرة واحدة بطلبك): آخر ملفات المرحلة 4 — منجز، 14 يوليو 2026

**الملفات:**
1. `src/components/sessions-calendar/MonthWeekView.tsx` (4 → 0)
2. `src/components/sessions-calendar/DayCard.tsx` (3 → 0)
3. `src/components/sessions-calendar/SessionCard.tsx` (2 → 0)
4. `src/components/dashboard/TeamTab.tsx` (2 → 0)
5. `src/components/sessions-calendar/TaskCard.tsx` (1 → 0)
6. `src/components/sessions-calendar/DayDivider.tsx` (1 → 0)
7. `src/components/dashboard/AppHeader.tsx` (1 → 0)

**تنظيف الأنواع:**
- `MonthWeekView.tsx`: بروبس بقت `MonthWeekViewProps` مطابقة لاستدعاء `MonthListTab.tsx` الفعلي (`weeks: WeekInfo[]`, `sessionsMap/tasksMap: Record<string, ...>`, `cases: MappedCase[]`, `clients: MappedClient[]`، إلخ). **تعديل نوعي بسيط برّه الملف:** `WeekInfo` كان معرّف في `MonthListTab.tsx` بس مش `export` — اتضاف `export` بس (سطر واحد، بدون تغيير قيمة) عشان `MonthWeekView.tsx` يستورده بدل ما يتكرر تعريفه.
- `DayCard.tsx`/`DayDivider.tsx`: **ملاحظة — مكوّنين "يتيمين":** زي `UpcomingWidget.tsx` قبل كده، الاتنين متستوردين (`import`) في `MonthListTab.tsx` بس من غير أي استدعاء فعلي (`React.createElement(DayCard,...)`) في أي مكان في المشروع كله. اتنضّفوا زي باقي الدفعات بافتراض إنهم هيتم استخدامهم لاحقًا، وأنواعهم اتبنت مطابقة تمامًا لتوقيعات `SessionCard`/`TaskCard` اللي بيستخدموهم داخليًا.
- `SessionCard.tsx`: بروبس بقت `SessionCardProps` — `s: CalendarSessionRow` (النوع المشترك لكل نداءات المكوّن الفعلية من `CalendarTab.tsx`؛ و`MonthSessionRow`/غيرها بتتوافق معاه لأنها `extends` منه). نوع محلي `LinkedCaseLike` (نفس نمط `MissedTab.tsx`/`DashboardTab.tsx` بالظبط، مفيش نوع جديد اتعمل من الصفر).
  **⚠️ باگ حقيقي اتكشف (مش بند تنظيف — للعلم فقط، مفيش تصحيح اتعمل، بس كاست موثّق للحفاظ على نفس السلوك):** لما القضية مش من ضمن الصفحة المحمّلة حاليًا، الملف بيجيب القضية بمعرفها مباشرة (`db.from('cases')...`) ويبني نسخة يدوية من `MappedCase` — بس النسخة دي ناقصة 6 حقول حقيقية (`court_floor`, `court_hall`, `session_hall`, `secretary_hall`, `secretary_name`, `session_time`) موجودة في تعريف `MappedCase` الفعلي في `useAppData.ts` (نفس الحقول اللي كانت سبب باگ فقدان بيانات موثّق قبل كده). يعني لو قضية اتفتحت من هنا بالذات (من جلسة لقضية غير محمّلة) وبعدين اتعدّلت، ممكن قاعة/سكرتير الجلسة يترمسحوا. **قرارك:** لو عايز نصلحها فعليًا (بإضافة نفس الـ 6 حقول هنا برضه)، قولّي وهنعملها كبند منفصل.
- `TeamTab.tsx`: بروبس بقت `TeamTabProps` — `lawyers: ProfileRow[]` (نفس نوع `lawyers` state في `useAppData.ts`)، `lawyers.map` بقت متوقة.
- `TaskCard.tsx`: بروبس بقت `TaskCardProps` — `r: TaskFeedItem` (نوع مُصدَّر بالفعل من `useDashboardFeed.ts`، بيطابق كل الحقول المستخدمة `id/title/due_date/notes` تمامًا).
- `AppHeader.tsx`: بروبس بقت `AppHeaderProps` مطابقة لاستدعاء `App.tsx` الفعلي (`profile: ProfileRow | null`, `fetchCases: (page?, filter?) => void | Promise<void>`، إلخ). **كاست موثّق واحد بس:** زرار الهامبرغر بيستخدم `setShowMenu((p: boolean)=>!p)` (صيغة "functional updater")، بس البروب المُعلن من `App.tsx` نوعه `(v: boolean) => void` بسيط (مش `Dispatch<SetStateAction<boolean>>`) — شغالة فعليًا وقت التشغيل بس لأن `App.tsx` بيمرر `setShowHeaderMenu` (دالة state الحقيقية) اللي بتفهم صيغة الـ updater تلقائيًا. اتضاف كاست نوع (`as unknown as ...`) على استدعاء الزرار بس، من غير أي تغيير في القيمة أو السلوك وقت التشغيل — ده مش باگ فعلي (شغال صح)، بس نوعه غير دقيق.

فحص TypeScript فعلي (معزول، لكل الـ 7 ملفات مع اعتمادياتهم المتبادلة: `CalendarTab.tsx`, `MonthListTab.tsx`, `useAppData.ts`, `useDashboardFeed.ts`, `types.ts`, `shared.tsx`, `constants.ts`, `utils.ts`, `supabaseClient.ts`, `systemHealth.ts`، وكمان `App.tsx` للتأكد من عدم كسر استدعاءات `AppHeader`/`TeamTab`) رجع **صفر أخطاء حقيقية** في كل الملفات السبعة — غير الضوضاء البيئية المعتادة.

**الحالة:** 🎉 **المرحلة 4 خلصت بالكامل (18/18 ملف).** في انتظار تأكيد بناء Vercel ناجح. بعد كده الباقي بس المرحلة 5 (`App.tsx`/`main.tsx`) — دي مؤجلة عمدًا وباحتياط إضافي زي ما اتقال في خطة البداية؛ قرارك تمامًا لو عايز نبدأها أو نوقف هنا.

---

## ⚠️ اكتشاف مهم بعد إعادة فحص المشروع كامل (14 يوليو 2026)

بعد ما خلصت المرحلة 4، عملت فحص شامل لكل ملفات `src/` (عدا `App.tsx`/`main.tsx` المؤجلين عمدًا) عشان أتأكد مفيش حاجة فاتت. النتيجة: **تعداد الخطة الأصلي (§1 فوق) كان تقدير أولي مش شامل** — فيه مساحة كبيرة من الكود فيها `any` حقيقي **ومكانتش متضمّنة خالص** في أمثلة أي مرحلة من المراحل التلاتة (2، 3، 4) اللي اتقفلوا.

**المهم:** كل الملفات اللي **كانت** فعليًا مذكورة كأمثلة في المراحل 2/3/4 اتنضّفت بالكامل ومفيش سهو فيها — أي `any` باقي فيها دلوقتي استثناءات موثّقة بوعي (زي `Record<string, any>` لبيانات الفورم الديناميكية في `useCaseActions.ts`/`useClientActions.ts`/`EditCaseModal.tsx`/`NewCaseModal.tsx`، و`db.from(table as any)` لأسماء الجداول الديناميكية في `utils.ts`/`constants.ts`/`useAdminBackup.ts`، و`caseDataLoose` الموثّق في `useCaseDetailActions.ts`) — مش أي حاجة اتنسيت.

### الملفات اللي فيها `any` حقيقي ومكانتش جوه تعداد الخطة أصلًا

| الملف | عدد `any` |
|---|---|
| `src/components/FeesTab.tsx` | 32 |
| `src/components/AILegalAssistant.tsx` | 32 |
| `src/components/admin/sections/OfficeSection.tsx` | 15 |
| `src/components/shared.tsx` | 14 |
| `src/components/fees/FeeCard.tsx` | 14 |
| `src/components/CaseDetailView.tsx` | 14 |
| `src/components/AdminPanel.tsx` | 14 |
| `src/components/admin/sections/ActivitySection.tsx` | 13 |
| `src/components/DatePicker.tsx` | 12 |
| `src/components/admin/sections/SessionsSection.tsx` | 8 |
| `src/components/admin/sections/UsersSection.tsx` | 5 |
| `src/components/SessionsCalendar.tsx` | 5 |
| `src/components/app/HeaderMenu.tsx` | 4 |
| `src/components/admin/sections/PortalSection.tsx` | 4 |
| `src/components/admin/sections/LegalLibrarySection.tsx` | 4 |
| `src/components/LoginScreen.tsx` | 4 |
| `src/components/CountrySettings.tsx` | 4 |
| `src/components/admin/sections/SecuritySection.tsx` | 3 |
| `src/components/admin/sections/BackupSection.tsx` | 2 |
| `src/components/admin/icons.ts` | 2 |
| **الإجمالي** | **~205** |

بالإضافة لـ `App.tsx` (25) و`main.tsx` (24) — المرحلة 5 المؤجلة عمدًا زي ما هي.

### ليه حصل كده

التقدير الأصلي (~18 هوك للمرحلة 2، ~25 مودال للمرحلة 3، ~30 شاشة عرض للمرحلة 4) اتبنى على جزء من المشروع مش كل الملفات — ومكانش شامل شاشة الأدمن بالكامل (`AdminPanel.tsx` + كل ملفات `admin/sections/*`)، ولا `FeesTab.tsx`/`fees/FeeCard.tsx`، ولا `AILegalAssistant.tsx`، ولا `shared.tsx` (مكوّنات مشتركة زي `Inp`/`Sel`)، ولا `CaseDetailView.tsx` نفسها (الحاوية الأم لملفات `case-detail/*` اللي اتنضّفت)، ولا `DatePicker.tsx`/`SessionsCalendar.tsx`/`LoginScreen.tsx`/`CountrySettings.tsx`/`HeaderMenu.tsx`.

### الحالة الحقيقية للمشروع دلوقتي

- ✅ كل ملفات المراحل 2 و3 و4 **اللي كانت متعدّدة في الخطة** — خلصت فعلاً، صفر `any` حقيقي غير الاستثناءات الموثّقة.
- ⏳ **مساحة جديدة مكتشَفة (~205 `any`)** — لسه متبناش، مستنية قرارك: نضيفها كمرحلة جديدة (تقريبًا "مرحلة 4.5") بنفس منهجية الفحص/البناء المتبعة، وبنفس ترتيب الأولوية (الأقرب لكتابة بيانات حقيقية الأول)؟ أو نسيبها وتوقف هنا؟
- 🔒 المرحلة 5 (`App.tsx`/`main.tsx`، 49 `any`) — لسه مؤجلة عمدًا زي الاتفاق الأصلي.

**قرارك تمامًا.**
