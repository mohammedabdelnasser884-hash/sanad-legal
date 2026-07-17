# مرجع فحص Supabase — تجهيز اختبارات عزل الـ Tenants (المرحلة 1)
**التاريخ:** 16 يوليو 2026
**الهدف من الملف ده:** كل استعلام SQL اتعمل على Supabase أثناء تجهيز خطة اختبارات RLS + نتيجته الحقيقية، مجمّعين هنا كمرجع. **لو عدّلت أي حاجة بعد كده (policy، function، عمود)، افتح الملف ده الأول** وشوف هل التعديل بيمس حاجة موثّقة هنا — لو أيوه، شغّل نفس الاستعلام تاني وحدّث النتيجة هنا بدل ما تستنى لحد ما حاجة تتكسر.

**حالة الاتصال وقت الفحص:** مشروع Supabase واحد بس (إنتاج حقيقي، مفيش staging منفصل). أي اختبار مستقبلي هيستخدم `BEGIN...ROLLBACK` عشان ميأثرش على بيانات حقيقية.

---

## استعلام 1 — حالة RLS والسياسات على مستوى الـ schema كله

**ليه اتعمل:** عشان نعرف الصورة الحقيقية المطبّقة فعليًا (مش زي ما مكتوب في ملفات الـ migrations المحلية، اللي ممكن ميبقوش مطابقين للواقع).

```sql
select jsonb_build_object(
  'tables_with_tenant_id', (
    select jsonb_agg(jsonb_build_object('table', c.table_name) order by c.table_name)
    from information_schema.columns c
    where c.table_schema = 'public' and c.column_name = 'tenant_id'
  ),
  'rls_status', (
    select jsonb_agg(jsonb_build_object(
      'table', t.tablename, 'rls_enabled', t.rowsecurity
    ) order by t.tablename)
    from pg_tables t
    where t.schemaname = 'public'
  ),
  'policies', (
    select jsonb_agg(jsonb_build_object(
      'table', p.tablename, 'policy_name', p.policyname, 'command', p.cmd,
      'roles', p.roles, 'using_expr', p.qual, 'with_check_expr', p.with_check
    ) order by p.tablename, p.policyname)
    from pg_policies p
    where p.schemaname = 'public'
  )
) as sanad_rls_audit;
```

### النتيجة (16 يوليو 2026)

**الجداول اللي فيها عمود `tenant_id` (19 جدول):**
`activity_log`, `backups`, `case_documents`, `case_events`, `case_fees`, `case_notes`, `case_sessions`, `cases`, `clients`, `fee_payments`, `invoices`, `law_firms`, `office_settings`, `platform_audit_logs`, `profiles`, `reminders`, `tenant_invoices`, `tenant_usage_stats`, `whatsapp_logs`

**RLS مفعّل (`rowsecurity = true`) على كل الـ 31 جدول في الـ schema من غير استثناء واحد**، من ضمنهم جداول من غير `tenant_id` زي: `client_messages`, `client_portal_pins`, `client_portal_sessions`, `law_articles`, `laws`, `legal_categories`, `office_login_attempts`, `pin_attempts`, `platform_audit_logs`, `portal_pin_attempts`, `push_subscriptions`, `saas_admin_login_attempts`, `tenants`.

**⚠️ ملاحظة:** 3 جداول (`office_login_attempts`, `portal_pin_attempts`, `saas_admin_login_attempts`) عندهم RLS مفعّل **بدون أي policy مسجّلة خالص** — يعني مقفولين تمامًا على أي حد غير `service_role` (اللي بيتجاوز RLS أصلًا). ده متوقع لجداول محاولات الدخول (لازم تتلمس من فانكشن سيرفر بس)، لكن لازم يتأكد إن مفيش كود React بيحاول يستعلم عليهم مباشرة (هيفشل لو حصل).

**جدول السياسات الكامل لكل جدول فيه `tenant_id` (النص الحرفي لكل policy):**

| الجدول | اسم الـ Policy | العملية | `USING` | `WITH CHECK` |
|---|---|---|---|---|
| `activity_log` | `activity_log_insert` | INSERT | — | `tenant_id = current_tenant_id()` |
| `activity_log` | `activity_log_select` | SELECT | `tenant_id = current_tenant_id() AND get_my_role()='admin'` OR `is_super_admin()` | — |
| `activity_log` | `admins_can_read_activity` | SELECT | EXISTS على `profiles` بشرط `role='admin'` و(`is_super_admin` أو نفس `tenant_id`) | — |
| `backups` | `tenant_scoped_backups` | ALL | `get_my_role()='admin' AND tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `case_documents` | `tenant_scoped_case_documents` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `case_events` | `tenant_scoped_case_events` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `case_fees` | `tenant_scoped_case_fees` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `case_notes` | `tenant_scoped_case_notes` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `case_sessions` | `tenant_scoped_case_sessions` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `cases` | `tenant_scoped_cases` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `clients` | `tenant_scoped_clients` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `fee_payments` | `tenant_scoped_fee_payments` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `invoices` | `invoices_insert_own_tenant` | INSERT | — | `tenant_id = current_tenant_id()` |
| `invoices` | `invoices_select_own_tenant` | SELECT | `tenant_id=current_tenant_id()` OR `is_super_admin()` | — |
| `law_firms` | `tenant_scoped_law_firms` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `office_settings` | `office_settings_select` | SELECT | `tenant_id=current_tenant_id()` OR `is_super_admin()` | — |
| `office_settings` | `office_settings_insert` | INSERT | — | `tenant_id=current_tenant_id() AND get_my_role()='admin'` OR `is_super_admin()` |
| `office_settings` | `office_settings_update` | UPDATE | `tenant_id=current_tenant_id() AND get_my_role()='admin'` OR `is_super_admin()` | نفس الشرط |
| `office_settings` | `office_settings_delete` | DELETE | `tenant_id=current_tenant_id() AND get_my_role()='admin'` OR `is_super_admin()` | — |
| `platform_audit_logs` | `super_admin_only_audit_logs` | ALL | `is_super_admin()` فقط (من غير ربط بـ `tenant_id`) | نفس الشرط |
| `profiles` | `profiles_select` | SELECT | `user_id=auth.uid()` OR `tenant_id=current_tenant_id()` OR `is_super_admin()` | — |
| `profiles` | `profiles_insert_super_admin_only` | INSERT | — | `is_super_admin()` فقط |
| `profiles` | `profiles_update` | UPDATE | `user_id=auth.uid()` OR (`tenant_id=current_tenant_id() AND get_my_role()='admin'`) OR `is_super_admin()` | نفس الشرط |
| `profiles` | `profiles_delete` | DELETE | `tenant_id=current_tenant_id() AND get_my_role()='admin'` OR `is_super_admin()` | — |
| `reminders` | `tenant_scoped_reminders` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |
| `tenant_invoices` | `tenant_scoped_tenant_invoices` | SELECT | `tenant_id=current_tenant_id()` OR `is_super_admin()` | — |
| `tenant_invoices` | `super_admin_manage_tenant_invoices` | ALL | `is_super_admin()` فقط | نفس الشرط |
| `tenant_usage_stats` | `tenant_scoped_usage_stats` | SELECT | `tenant_id=current_tenant_id()` OR `is_super_admin()` | — |
| `tenant_usage_stats` | `super_admin_manage_usage_stats` | ALL | `is_super_admin()` فقط | نفس الشرط |
| `whatsapp_logs` | `tenant_scoped_whatsapp_logs` | ALL | `tenant_id=current_tenant_id()` OR `is_super_admin()` | نفس الشرط |

**جداول مرتبطة بالعزل بشكل غير مباشر (عن طريق `clients`/`client_portal_sessions`)، مش عندها `tenant_id` مباشر:**
- `client_messages` — عزل عن طريق `client_id → clients.tenant_id`
- `client_portal_pins` — نفس الأسلوب
- `client_portal_sessions` — `service_role` بس (`ALL`, `using: true`) — مفيش وصول مباشر لأي role تاني خالص

**مكتبة قانونية (`laws`, `law_articles`, `legal_categories`):** `is_super_admin()` فقط على كل العمليات بما فيها SELECT — يعني وصول المستخدم العادي للمحتوى القانوني لازم يعدي حصريًا من خلال Edge Functions (`ai-chat`/`embed-query`) اللي بتستخدم `service_role`.

---

## استعلام 2 — تعريف دوال الـ RLS المساعدة الحقيقية

**ليه اتعمل:** كل الـ policies فوق بتعتمد على 3 دوال (`current_tenant_id`, `get_my_role`, `is_super_admin`). كان موجود تعريف واحد بس (`current_tenant_id`) في ملفات الـ migrations المحلية — محتاجين نتأكد إنه مطابق للحقيقي، ونجيب التانيين اللي مكانوش موثّقين محليًا خالص.

```sql
select jsonb_agg(jsonb_build_object(
  'function_name', p.proname,
  'arguments', pg_get_function_arguments(p.oid),
  'return_type', pg_get_function_result(p.oid),
  'security', case when p.prosecdef then 'SECURITY DEFINER' else 'INVOKER' end,
  'source', p.prosrc
) order by p.proname) as sanad_rls_helper_functions
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('current_tenant_id', 'get_my_role', 'is_super_admin');
```

### النتيجة (16 يوليو 2026)

**`current_tenant_id()`** → `uuid`, `SECURITY DEFINER` — **مطابق تمامًا** للنسخة الموجودة في `database/migrations/sql-migrations-phase2/07-tenant-subscription-enforcement.sql` (مفيش فرق/drift):
```sql
select p.tenant_id
from public.profiles p
join public.tenants t on t.id = p.tenant_id
where p.user_id = auth.uid()
  and (t.status is null or t.status <> 'suspended')
  and (t.status is distinct from 'trial' or t.trial_ends_at is null or t.trial_ends_at >= now())
```

**`get_my_role()`** → `text`, `SECURITY DEFINER` (مكانش موثّق محليًا قبل كده):
```sql
SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
```

**`is_super_admin()`** → `boolean`, `SECURITY DEFINER` (مكانش موثّق محليًا قبل كده):
```sql
select coalesce((select is_super_admin from public.profiles where user_id = auth.uid()), false)
```

**الخلاصة التقنية:** الثلاثة دوال بتعتمد على `auth.uid()` وبتقرا من `profiles`/`tenants`. يعني أي اختبار RLS لازم يحاكي الجلسة عن طريق `set local role authenticated; set local request.jwt.claims = '{"sub":"<uuid>"}';` قبل ما يجرب أي عملية.

---

## استعلام 3 — قرارات تصميم اتأكدت (مش أخطاء)

بعد مراجعة نتيجة استعلام 1، طلعت 3 حالات شكلها غريب لأول وهلة، لكن **اتأكدت من صاحب المشروع في 16 يوليو 2026 إنها مقصودة، مش باگ:**

| الجدول | السلوك | الحالة |
|---|---|---|
| `activity_log` | مفيش UPDATE/DELETE خالص (سجل غير قابل للتعديل)، والـ SELECT للأدمن بس (الموظف العادي مايشوفش السجل خالص) | ✅ مقصود |
| `invoices` | مفيش UPDATE/DELETE خالص من الواجهة — أي تعديل/إلغاء فاتورة لازم يعدي من Edge Function بـ `service_role` | ✅ مقصود |
| `laws`/`law_articles`/`legal_categories` | مفيش وصول مباشر غير `is_super_admin()`، العرض للمستخدم العادي كله عن طريق AI functions | ✅ مقصود |

**لو حد قرر يغيّر أي واحدة من الثلاثة دي مستقبلًا، لازم يحدّث الجدول ده كمان — مش بس الكود.**

---

## استعلام 4 — بنية `profiles` و`tenants` (لتجهيز بيانات اختبار صحيحة)

**ليه اتعمل:** عشان نبني صف تجريبي صحيح (تينانت + مستخدم) من غير تخمين اسم عمود أو نوعه.

```sql
select jsonb_build_object(
  'profiles_columns', (
    select jsonb_agg(jsonb_build_object(
      'column', c.column_name, 'type', c.data_type,
      'nullable', c.is_nullable, 'default', c.column_default
    ) order by c.ordinal_position)
    from information_schema.columns c
    where c.table_schema='public' and c.table_name='profiles'
  ),
  'tenants_columns', (
    select jsonb_agg(jsonb_build_object(
      'column', c.column_name, 'type', c.data_type,
      'nullable', c.is_nullable, 'default', c.column_default
    ) order by c.ordinal_position)
    from information_schema.columns c
    where c.table_schema='public' and c.table_name='tenants'
  ),
  'profiles_foreign_keys', (
    select jsonb_agg(jsonb_build_object(
      'constraint', tc.constraint_name, 'column', kcu.column_name,
      'references_table', ccu.table_name, 'references_column', ccu.column_name
    ))
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name
    join information_schema.constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name
    where tc.table_schema='public' and tc.table_name='profiles' and tc.constraint_type='FOREIGN KEY'
  ),
  'tenants_status_check', (
    select pg_get_constraintdef(con.oid)
    from pg_constraint con join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'tenants' and con.contype = 'c'
    limit 1
  )
) as sanad_test_fixture_requirements;
```

### النتيجة (16 يوليو 2026)

**⚠️ اكتشاف مهم (وقت الفحص في 16 يوليو 2026، أول اليوم):** `profiles.user_id` **مفيهوش Foreign Key على `auth.users`**. معناها عمليًا: نقدر نعمل مستخدمين تجريبيين بـ `user_id` وهمي (UUID عشوائي) من غير الحاجة لإنشاء حساب دخول حقيقي في نظام الـ Auth — بيسهّل بناء بيانات الاختبار كتير.

**🔴 تحديث (16 يوليو 2026، بعد أول تشغيل فعلي للسكريبت):** النتيجة دي طلعت **غير مطابقة للواقع الحالي**. أول تشغيل حقيقي للسكريبت جاب الايرور:
```
ERROR: 23503: insert or update on table "profiles" violates foreign key constraint "profiles_user_id_fkey"
DETAIL: Key (user_id)=(...) is not present in table "users".
```
يعني الـ FK (`profiles_user_id_fkey`) **موجود فعليًا دلوقتي** ويشاور على `auth.users(id)` (`ON DELETE CASCADE`). إما إنه اتضاف بعد أول فحص في نفس اليوم، أو إن الفحص الأول كان غلط. **الدرس المستفاد: أي معلومة في الملف ده ليها تاريخ فحص، ولو فيه فرق زمني — ولو ساعات — بين التوثيق والتنفيذ الفعلي، لازم يتأكد منها تاني وقت التنفيذ، مش يتاخد على إنها لسه صحيحة.** شوف استعلام 8 و9 للتفاصيل الكاملة والحل.

**`tenants` — القيم الافتراضية المهمة:**
- `status` → افتراضيًا `'trial'`
- `trial_ends_at` → افتراضيًا `now() + 14 يوم`
- معناها: تينانت جديد من غير تحديد `status` صراحةً بيتحسب "شغال" تلقائيًا في `current_tenant_id()`.

**`profiles` — الأعمدة المهمة للاختبار:** `role` (افتراضي `lawyer`)، `rbac_role` (افتراضي `lawyer`، NOT NULL)، `is_super_admin` (افتراضي `false`، NOT NULL)، `is_active` (افتراضي `true`)، `tenant_id` (nullable، الـ FK الوحيد المهم هنا وبيشاور على `tenants.id`).

---

## استعلام 5 — الأعمدة الإجبارية والـ Foreign Keys لباقي الجداول (19 جدول + المرتبطين)

**ليه اتعمل:** عشان نبني صف تجريبي كامل وصحيح في كل جدول من غير تخمين — بالظبط نفس نوع الباگ اللي كان موجود قبل كده (`power_of_attorney`).

```sql
select jsonb_build_object(
  'required_columns', (
    select jsonb_agg(jsonb_build_object(
      'table', c.table_name, 'column', c.column_name, 'type', c.data_type
    ) order by c.table_name, c.ordinal_position)
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name in (
        'activity_log','backups','case_documents','case_events','case_fees',
        'case_notes','case_sessions','cases','clients','fee_payments','invoices',
        'law_firms','office_settings','platform_audit_logs','reminders',
        'tenant_invoices','tenant_usage_stats','whatsapp_logs',
        'client_messages','client_portal_pins','client_portal_sessions'
      )
      and c.is_nullable = 'NO'
      and c.column_default is null
  ),
  'foreign_keys', (
    select jsonb_agg(jsonb_build_object(
      'table', tc.table_name, 'column', kcu.column_name,
      'references_table', ccu.table_name, 'references_column', ccu.column_name
    ))
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name
    join information_schema.constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name
    where tc.table_schema='public' and tc.constraint_type='FOREIGN KEY'
      and tc.table_name in (
        'activity_log','backups','case_documents','case_events','case_fees',
        'case_notes','case_sessions','cases','clients','fee_payments','invoices',
        'law_firms','office_settings','platform_audit_logs','reminders',
        'tenant_invoices','tenant_usage_stats','whatsapp_logs',
        'client_messages','client_portal_pins','client_portal_sessions'
      )
) as sanad_fixture_schema_batch2;
```

### النتيجة (16 يوليو 2026)

**سلسلة الاعتماديات (لازم تتبني بالترتيب ده في أي بيانات تجريبية):**
1. `tenants` (مفيش اعتمادية)
2. `profiles` (يعتمد على `tenants`) + `law_firms` (يعتمد على `tenants`)
3. `clients` (يعتمد على `tenants`, `law_firms`, `profiles.lawyer_id`)
4. `cases` (يعتمد على `tenants`, `clients`, `law_firms`)
5. `case_fees`, `case_sessions`, `case_documents`, `case_events` (تعتمد على `cases` + `clients` + `tenants`)
6. `fee_payments` (يعتمد على `case_fees`, `clients`, `tenants`)
7. `invoices` (يعتمد على `cases`, `clients`, `fee_payments`)
8. `client_messages`, `client_portal_pins`, `client_portal_sessions` (تعتمد على `clients` بس)

**الأعمدة الإجبارية (NOT NULL بدون default) لكل جدول:**

| الجدول | الأعمدة الإجبارية |
|---|---|
| `activity_log` | `action` |
| `case_events` | `event_type`, `event_date`, `description` |
| `case_fees` | `case_id` |
| `cases` | `case_number_official`, `title`, `court_name` |
| `client_messages` | `content` |
| `client_portal_sessions` | `token` |
| `clients` | `client_name` |
| `fee_payments` | `amount` |
| `invoices` | `tenant_id`, `invoice_number`, `amount` |
| `law_firms` | `firm_name` |
| `platform_audit_logs` | `user_id`, `action` |
| `reminders` | `title`, `due_date` |
| `tenant_invoices` | `tenant_id`, `billing_period_start`, `billing_period_end`, `amount_due` |
| `tenant_usage_stats` | `tenant_id` |
| `whatsapp_logs` | `id` (بس، `bigint` — على الأغلب `identity`/`serial`) |
| `backups`, `case_documents`, `case_notes`, `case_sessions`, `client_portal_pins`, `office_settings` | مفيش أعمدة إجبارية إضافية غير `tenant_id` (موجود أصلاً في كل الجداول دي) |

---

## استعلام 6 — التأكد من قيم `role` و`rbac_role` الحقيقية (بعد فشل أول محاولة تشغيل للسكريبت)

**ليه اتعمل:** أول تشغيل لسكريبت `phase1-tenant-isolation-test.sql` فشل بالايرور:
```
ERROR: 22P02: invalid input value for enum user_role: "admin"
```
اتضح إن `rbac_role` (مش `role`) هو العمود اللي نوعه `enum user_role`، وإن القيمة `'admin'` مكانتش من ضمن قيم الـ enum، فكان لازم نتأكد من:
1. نوع كل عمود من التنين (`role`, `rbac_role`) فعليًا.
2. القيم المسموحة في الـ enum `user_role`.

```sql
select jsonb_build_object(
  'role_column_type', (
    select udt_name from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='role'
  ),
  'rbac_role_column_type', (
    select udt_name from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='rbac_role'
  ),
  'user_role_enum_values', (
    select jsonb_agg(e.enumlabel order by e.enumsortorder)
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'user_role'
  )
) as sanad_role_enum_check;
```

### النتيجة (16 يوليو 2026)

- `role` → نوعه **`text`** عادي (مش enum). القيم الحقيقية المستخدمة عليه في البيانات: `'lawyer'`, `'viewer'`, `'admin'` (شوف استعلام 7). كل الـ RLS policies (زي `get_my_role()`) بتعتمد على العمود ده.
- `rbac_role` → نوعه **`enum user_role`**. القيم المسموحة في تعريف الـ enum: `owner`, `lawyer`, `assistant`, `staff`, `client_portal`, `super_admin`.

**⚠️ ملاحظة مهمة:** القيمة `'admin'` مش موجودة في تعريف الـ enum `user_role` خالص — أقرب قيمة منطقية ليها هي `owner` أو `super_admin`، لكن شوف استعلام 7 قبل ما تفترض إنها دي المستخدمة فعليًا.

---

## استعلام 7 — التوزيع الفعلي لتوليفات (`role`, `rbac_role`, `is_super_admin`) في بيانات الإنتاج

**ليه اتعمل:** معرفة قيم الـ enum النظرية (استعلام 6) مش كفاية — لازم نعرف إيه التوليفة **المستخدمة فعليًا** في صفوف حقيقية، عشان بيانات الاختبار تحاكي الواقع مش التصميم النظري للـ enum.

```sql
select jsonb_agg(jsonb_build_object(
  'role', role,
  'rbac_role', rbac_role,
  'is_super_admin', is_super_admin,
  'n', n
) order by n desc) as result
from (
  select role, rbac_role, is_super_admin, count(*) as n
  from profiles
  group by role, rbac_role, is_super_admin
) t;
```

### النتيجة (16 يوليو 2026)

```json
[
  {"n": 3, "role": "lawyer", "rbac_role": "lawyer", "is_super_admin": false},
  {"n": 1, "role": "viewer", "rbac_role": "lawyer", "is_super_admin": false},
  {"n": 1, "role": "admin",  "rbac_role": "lawyer", "is_super_admin": true}
]
```

**الخلاصة:** رغم إن الـ enum `user_role` بتاع `rbac_role` معرّف فيه قيم زي `owner`/`super_admin`، **كل الصفوف الحالية في الإنتاج (بما فيهم صف الأدمن وصف السوبر أدمن) لسه `rbac_role='lawyer'` بدون استثناء.** الفرق الفعلي بين الأدوار بيتحدد بالكامل من عمود `role` النصي (`'lawyer'` / `'viewer'` / `'admin'`) + `is_super_admin`، مش من `rbac_role`. يعني:
- نظام الـ RBAC الجديد (enum) موجود كتعريف بس **مش مفعّل استخدامه فعليًا لسه** في البيانات الحالية.
- أي بيانات اختبار لازم تحاكي الواقع الحالي: `rbac_role='lawyer'` لكل الصفوف، بغض النظر عن `role`.
- لو حد فعّل استخدام الـ enum الجديد فعليًا في المستقبل (يعني بدأ يحط `owner`/`super_admin` في `rbac_role` بجد)، لازم يرجع للملف ده ويحدّث الجدول، ويحتمل التست يحتاج يتوسّع يغطي الحالتين.

---

## استعلام 8 — شكل `auth.users` الحقيقي (بعد اكتشاف الـ FK غير المتوقع)

**ليه اتعمل:** بعد ما اتأكد إن `profiles.user_id` بقى مربوط فعليًا بـ `auth.users(id)`، لازم نعرف الأعمدة الإجبارية فيه (بدون تخمين) عشان نقدر ننشئ صف تجريبي صحيح جواه، وناخد نص الـ FK نفسه للتأكيد.

```sql
select jsonb_build_object(
  'auth_users_required_columns', (
    select jsonb_agg(jsonb_build_object(
      'column', c.column_name, 'type', c.data_type,
      'nullable', c.is_nullable, 'default', c.column_default
    ) order by c.ordinal_position)
    from information_schema.columns c
    where c.table_schema = 'auth' and c.table_name = 'users'
      and c.is_nullable = 'NO' and c.column_default is null
  ),
  'auth_users_all_columns_sample', (
    select jsonb_agg(c.column_name order by c.ordinal_position)
    from information_schema.columns c
    where c.table_schema = 'auth' and c.table_name = 'users'
  ),
  'profiles_user_id_fk_definition', (
    select pg_get_constraintdef(con.oid)
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'profiles' and con.conname = 'profiles_user_id_fkey'
  )
) as sanad_auth_users_check;
```

### النتيجة (16 يوليو 2026)

- **العمود الإجباري الوحيد** في `auth.users` (NOT NULL بدون default) هو `id` (`uuid`). كل باقي الأعمدة (`email`, `encrypted_password`, `role`, `raw_app_meta_data`, ...) نالابل أو ليها default، فمش لازم نحطها في بيانات الاختبار.
- تعريف الـ FK الفعلي: `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`.

---

## استعلام 9 — التأكد من عدم وجود Trigger على `auth.users` قبل الإدخال اليدوي

**ليه اتعمل:** قبل ما نعمل INSERT يدوي في `auth.users`، لازم نتأكد إن مفيش trigger شائع (زي `on_auth_user_created`) بينشئ صف في `profiles` تلقائيًا — لو موجود، الـ INSERT اليدوي بتاعنا في `profiles` بعد كده هيتصادم معاه (duplicate key على `user_id`).

```sql
select jsonb_build_object(
  'triggers_on_auth_users', (
    select jsonb_agg(jsonb_build_object(
      'trigger_name', t.tgname,
      'function_called', p.proname,
      'timing_event', pg_get_triggerdef(t.oid)
    ))
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_proc p on p.oid = t.tgfoid
    where n.nspname = 'auth' and c.relname = 'users'
      and not t.tgisinternal
  ),
  'unique_constraints_on_auth_users', (
    select jsonb_agg(pg_get_constraintdef(con.oid))
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'users'
      and rel.relnamespace = 'auth'::regnamespace
      and con.contype in ('u','p')
  )
) as sanad_auth_users_triggers_check;
```

### النتيجة (16 يوليو 2026)

- **مفيش أي trigger** على `auth.users` (`triggers_on_auth_users` = `null`). آمن نعمل INSERT يدوي في `auth.users` من غير ما نخاف من تصادم مع صف `profiles` بيتعمل تلقائيًا.
- القيود الوحيدة (`unique`/`primary key`) على الجدول: `UNIQUE (phone)` و`PRIMARY KEY (id)`. مفيش قيد `unique` صريح على `email` في نتيجة الفحص ده — بما إننا هندخل `id` بس وهنسيب `email` فاضي (`null`)، النقطة دي مش مؤثرة على السكريبت الحالي، لكن لو حد حب يستخدم `email` حقيقي مستقبلًا في بيانات تجريبية لازم يتأكد منها بالفحص برضو مش بالتخمين.

**القرار النهائي:** إضافة `INSERT INTO auth.users (id) VALUES (lawyer_a), (admin_a), (inactive_a), (lawyer_b), (superadmin);` قبل الإدخال في `profiles` مباشرة، جوه نفس الـ `DO` block (نفس المتغيرات)، وجوه نفس `BEGIN...ROLLBACK` العام — فمفيش أي أثر هيفضل في `auth.users` بعد التشغيل.

---

## الخطوة الجاية

كل المعلومات اللي فوق كافية دلوقتي لبناء سكريبت اختبار عزل الـ Tenants الفعلي (المرحلة 1) بأسلوب `BEGIN...ROLLBACK` — من غير أي حاجة متأكدة عن طريق تخمين. السكريبت هيتسلّم في دفعة منفصلة، وأي استعلام جديد هيتضاف هنا أول ما يتعمل.
