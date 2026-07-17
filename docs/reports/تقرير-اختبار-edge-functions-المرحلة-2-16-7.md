# تقرير اختبارات Edge Functions — المرحلة 2
**التاريخ:** 16 يوليو 2026
**الوضع الحالي:** بدأنا بـ `saas-admin` (أول فانكشن في جدول المرحلة 2). باقي 10 فانكشنز.

---

## 🔴 باگ حقيقي مكتشف: `saas-admin/index.ts` — أخطاء الأكشنز بترجع rejection بدل رد JSON لطيف

**الموقع:** جوه الـ `Deno.serve` handler الرئيسي، في الـ `switch`:
```js
switch (action) {
  case 'query':                return actionQuery(rest);
  case 'createOfficeWithAdmin': return actionCreateOffice(rest);
  ...
}
```

**السبب التقني:** الأسطر دي جوه `try` بلوك، لكن من غير `await`. في جافاسكريبت، `return someAsyncCall()` من غير `await` جوه `try` **مبيتلقطش بالـ `catch` بتاعتها** لو الـ promise فشل — لأن الـ `return` بيخرج من نطاق الـ `try` قبل ما الفشل يحصل فعليًا (الـ rejection بيوصل بعد كده، بره نطاق المحاولة). اتأكد السلوك ده بتجربة منفصلة صغيرة في Node (مش تخمين):

```js
async function foo() { throw new Error('boom'); }
async function handler() {
  try { return foo(); } catch (e) { return 'caught: ' + e.message; }
}
handler().catch(e => console.log('REJECTED:', e.message)); // → REJECTED: boom
```

**الأثر العملي:** لو `actionQuery` أو `actionCreateOffice` رمى استثناء داخلي (مثلاً فشل إنشاء حساب Auth، أو فشل طلب REST لـ Supabase)، الـ handler كله بيرجع rejected promise بدل الرد المصمم له (`json({error: msg}, 500)`). تحت `Deno.serve` الحقيقي، ده معناه إن العميل هياخد صفحة خطأ عامة من Deno مش رسالة الخطأ العربية اللطيفة اللي الكود متصمم يرجّعها — يعني رسائل الأخطاء دي (زي "فشل إنشاء حساب الأدمن") **ممكن متوصلش للعميل خالص** في الحالات دي.

**اتأكد عمليًا بتست حقيقي فشل** (`saas-admin/index.test.ts` — سيناريو "فشل إنشاء حساب Auth"): بدل ما يرجع status 500، الطلب بيرمي (rejects) فعليًا.

**الإصلاح المقترح (سطر واحد لكل حالة، منخفض المخاطرة):**
```js
case 'query':                return await actionQuery(rest);
case 'createOfficeWithAdmin': return await actionCreateOffice(rest);
```

**✅ تم الإصلاح (17 يوليو 2026):** الاتنين اتصلحوا فعليًا في `saas-admin/index.ts` (`await` قبل `actionQuery`/`actionCreateOffice`، وكمان قبل `actionLogin` لنفس السطر بالاتساق مع باقي الفانكشن). التست الموثّق للسلوك المكسور اتظبط ليتوقع الآن `status 500` + رسالة الخطأ الفعلية بدل `rejects.toThrow()`.

**ملاحظة:** نفس النمط (`return` بدون `await` جوه `try`) موجود كمان في `action==='login'`، لكن `actionLogin` مالهاش أي مسار بيرمي استثناء فعليًا (كل حالاتها بترجع `json(...)` أو `recordAttempt` اللي عندها try/catch داخلي) — فمش مؤثر عمليًا هناك. **لازم نتأكد من نفس النمط ده في باقي الفانكشنز التسعة الباقية وقت ما نوصلهم** (خصوصًا اللي بتستخدم نفس أسلوب الـ switch).

---

## حالة الاختبارات — `saas-admin`

| الملف | الحالة |
|---|---|
| `supabase/functions/_shared/edgeTestUtils.ts` | ✅ بنية تحتية مشتركة (stub لـ `Deno` global + fetch router) — اتصلح فيها باگين وقت التطوير: (1) حل مسار الاستيراد كان بيعتمد غلط على `import.meta.url` اللي بيرجع بروتوكول `http:` وهمي جوه بيئة `jsdom`، (2) `Response` بحالة 204 كان بيتحط له body غلط (ممنوع بالـ spec) |
| `supabase/functions/saas-admin/index.test.ts` | ✅ يغطي: CORS، brute-force lockout (بما فيه استثناء IP المجهول العمدي)، مقارنة الباسورد، صلاحية/انتهاء/تزييف التوكن، whitelist الجداول في `query`، منع DELETE الجماعي، مسار `createOfficeWithAdmin` الناجح، ومسار الفشل (موصوف كسلوك حالي معطوب — شوف الباگ فوق) |

**الفانكشن الجاية حسب ترتيب الجدول وقتها:** `admin-actions`.

---

## حالة الاختبارات — `admin-actions` (16 يوليو 2026)

| الملف | الحالة |
|---|---|
| `supabase/functions/admin-actions/index.test.ts` | ✅ 29 تست اتكتبت بقراءة الكود الحقيقي (`force_signout`, `change_password`, `create_lawyer`, CORS، هوية الطالب، action غير معروف، خطأ عام). **✅ تأكيد فعلي (17 يوليو 2026):** ضمن إجمالي 12 ملف/197 تست ناجحة في نفس تشغيل `npm run test` الشامل (تفاصيل رقمها الفردي في هذا التشغيل لسه محتاجة تأكيد منفصل بالاسم). |

**ملاحظة سلوك مختلفة عن `saas-admin`:** `admin-actions` بيرجع `status 200` دايمًا مع `{error}` جوه الـ body للأخطاء المنطقية (مش HTTP status code مختلف)، عكس `saas-admin`. موثّق في تعليقات التست.

---

## حالة الاختبارات — `client-portal-api` (17 يوليو 2026)

| الملف | الحالة |
|---|---|
| `supabase/functions/client-portal-api/index.test.ts` | ✅ 47 تست اتكتبت بقراءة الكود الحقيقي مباشرة (مفيش تخمين اسم جدول/عمود — كل اسم مأخوذ حرفيًا من `client-portal-api/index.ts`). **✅ مؤكدة شغالة فعليًا (47/47 تست عدّت، 17 يوليو 2026، تشغيل حقيقي من الكودسبيس).** |

### 🔴 باگ حقيقي إضافي مكتشف: نفس نمط `return` بدون `await`، لكن هنا أوسع بكتير

**الموقع:** الـ `Deno.serve` handler الرئيسي في `client-portal-api/index.ts` — كل من `actionFind`/`actionVerify` (فوق التحقق من التوكن) وكل حالات الـ `switch` (`getCases`/`getClient`/`getCaseFees`/`getCaseSessions`/`getCaseDocuments`/`getMessages`/`sendMessage`) بيتكتبوا:
```js
if (action === 'find')   return actionFind(rest_body, ip);
if (action === 'verify') return actionVerify(rest_body, ip);
...
switch (action) {
  case 'getCases': return actionGetCases(claims);
  ...
}
```
كل ده جوه نفس الـ `try` بلوك بتاع الـ handler. **نفس آلية الباگ الموثّقة في `saas-admin`** (`return` لـ promise من غير `await` بيتخطى الـ `catch` بتاعها لو فشلت) — بس هنا بتغطي **كل الأكشنز التسعة بلا استثناء**، مش بس مسارين محددين زي `saas-admin`. يعني أي استثناء داخلي (فشل `rest()` أو `rpc()` لأي سبب — الشبكة، قاعدة بيانات مش متاحة، إلخ) في أي أكشن من التسعة بيوصل كـ **rejection خام** بدل رد JSON عربي لطيف بحالة 500.

**اتأكد بتست حقيقي فشل** (`client-portal-api/index.test.ts` — سيناريو "فشل استعلام داخلي (getClient)"): الطلب بيرمي (rejects) فعليًا بدل ما يرجع status 500.

**الإصلاح المقترح (نفس نمط saas-admin، سطر واحد لكل حالة):**
```js
if (action === 'find')   return await actionFind(rest_body, ip);
case 'getCases':          return await actionGetCases(claims);
```

**✅ تم الإصلاح (17 يوليو 2026):** كل الأكشنز التسعة (`find`, `verify`, `getCases`, `getClient`, `getCaseFees`, `getCaseSessions`, `getCaseDocuments`, `getMessages`, `sendMessage`) بقوا بـ `await` في `client-portal-api/index.ts`. التست الموثّق للسلوك المكسور اتظبط ليتوقع `status 500` + رسالة الخطأ الفعلية (`data?.message`) بدل `rejects.toThrow()`.

**تأثير على باقي الفانكشنز المتبقية:** فحصنا `office-login`/`office-secrets` قبل الإصلاح ده — الاتنين مفيهمش نفس النمط أصلًا (كل نداءات `rest()`/`rpc()` فيهم بتتعمل بـ `await` قبل أي `return` أصلًا). يبقى نفس الفحص لسه مطلوب في الأربعة الباقيين (`ai-chat`/`embed-batch`/`embed-query`/`process-law-extract`، `session-alerts`/`telegram-send`) وقت كتابة تستاتهم.

---

## ✅ ختام: إقفال باگ الـ `await` (17 يوليو 2026)

القرار المعلّق في نهاية خطة الاختبارات اتاخد: نقفل الباگ في `saas-admin` و`client-portal-api` قبل الاستمرار في المرحلة 2.

| الفانكشن | الإصلاح | التست |
|---|---|---|
| `saas-admin/index.ts` | `await` أُضيفت لـ `actionLogin`, `actionQuery`, `actionCreateOffice` | تست "فشل إنشاء حساب Auth" اتظبط: بيتوقع الآن `status 500` + `data.error === 'فشل إنشاء المستخدم في Auth'` بدل `rejects.toThrow()` |
| `client-portal-api/index.ts` | `await` أُضيفت لكل التسعة أكشنز (`find`, `verify`, `getCases`, `getClient`, `getCaseFees`, `getCaseSessions`, `getCaseDocuments`, `getMessages`, `sendMessage`) | تست "فشل استعلام داخلي (getClient)" اتظبط: بيتوقع الآن `status 500` + `data.error === 'قاعدة البيانات مش متاحة دلوقتي'` بدل `rejects.toThrow()` |

**✅ تم التأكد (17 يوليو 2026):** `npm run test` اتشغّل فعليًا من الكودسبيس — 12 ملف/197 تست، كلهم عادّين من غير فشل. الإصلاح ماكسرش أي تست موجود.

**الجاية:** استكمال المرحلة 2 — `office-login`/`office-secrets` (تم فحصهم مسبقًا: لا يحتويان نفس نمط الباگ).

---

## حالة الاختبارات — `office-login` و `office-secrets` (17 يوليو 2026)

| الملف | الحالة |
|---|---|
| `supabase/functions/office-login/index.test.ts` | ✅ اتكتب بقراءة الكود الحقيقي بالكامل (مفيش تخمين). يغطي: CORS، `action` غير `login`، مدخلات ناقصة، lockout بالإيميل وبالـ IP كل واحد لوحده، فشل GoTrue، كل حالات الـ profile (مفيش/`is_active=false`/`is_locked=true`) مع تأكيد `revokeToken` بيتنده بالتوكن الصح، كل حالات الـ tenant (مفيش/`suspended`/`trial` منتهي/`trial` سليم/`trial_ends_at=null`)، ومسار النجاح الكامل (تحديث `last_login`+`failed_login_attempts`، استخدام `x-forwarded-for`، trim الإيميل). **✅ مؤكدة شغالة فعليًا (19/19 تست عدّت، 17 يوليو 2026).** |
| `supabase/functions/office-secrets/index.test.ts` | ✅ اتكتب بقراءة الكود الحقيقي بالكامل. يغطي: CORS، كل مسارات `getAuthorizedCaller` (من غير هيدر/توكن غير صالح/رد `auth/v1/user` من غير `id`/مفيش profile/`is_active=false`)، فحص الصلاحية (`role !== admin` بدون `is_super_admin`، وتأكيد إن `is_super_admin=true` كافي حتى لو الدور مش admin)، فحص `tenant_id` فاضي، كل الأكشنز التلاتة (`saveGroqKey`/`saveTgDailyToken`/`saveTgInstantToken`) بحالتي فشل المدخل ونجاحه، تأكيد إن الـ RPC بياخد `tenant_id` من الـ profile نفسه مش من البودي (منع حقن مكتب تاني)، وفشل الـ RPC → 500. **✅ مؤكدة شغالة فعليًا (17/17 تست عدّت، 17 يوليو 2026).** |

**ملاحظة فحص باگ الـ `await`:** الاتنين اتفحصوا قبل كتابة التستات (وموثّق فوق) — مفيهمش نفس نمط `return` بدون `await`، فمفيش حاجة تتصلح هنا.

**الفانكشن الجاية حسب ترتيب الجدول:** `ai-chat` / `embed-batch` / `embed-query` / `process-law-extract`.
