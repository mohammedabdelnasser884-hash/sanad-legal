// ══════════════════════════════════════════════════════════════
//  إعدادات ESLint — فحص أساسي لأخطاء TypeScript الشائعة + قواعد
//  React Hooks (rules-of-hooks و exhaustive-deps تحديدًا).
//
//  الهدف الأساسي من الإضافة دي: كشف مشاكل الـ dependency arrays في
//  useEffect/useCallback/useMemo تلقائيًا وقت الكتابة، بدل ما تتكشف
//  بالصدفة وانت بتقرا الكود يدويًا (زي حالة useAutoLogout.ts اللي
//  اتكتشفت في المراجعة).
//
//  التشغيل: npm run lint
//  ⚠️ محتاج npm install الأول عشان يجيب الحزم الجديدة المضافة في
//  package.json (eslint, typescript-eslint, eslint-plugin-react-hooks).
// ══════════════════════════════════════════════════════════════
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'supabase/functions'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // ── مخففة مؤقتًا عشان الكود الحالي (strict: false في tsconfig) ──
      // مايطلعش مئات التحذيرات مرة واحدة. ينفع تتشدد تدريجيًا لاحقًا.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // ── القواعد الأهم فعليًا (تفضل شغالة بكامل قوتها) ──
      'react-hooks/rules-of-hooks': 'error',   // استخدام غلط للـ hooks (شرط/loop)
      'react-hooks/exhaustive-deps': 'warn',   // dependency array ناقصة/غلط

      'react-refresh/only-export-components': 'off',
    },
  },
);
