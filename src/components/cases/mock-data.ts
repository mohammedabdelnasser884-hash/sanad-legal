export type CaseStatus = "نشطة" | "منتهية" | "مؤجلة";

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  court: string;
  status: CaseStatus;
  nextSession: string;
  type: string;
  createdAt: string;
  description: string;
  judge: string;
  opponent: string;
  sessions: { date: string; result: string; notes: string }[];
  documents: { name: string; date: string; type: string }[];
}

export const mockCases: Case[] = [
  {
    id: "CAS-1029",
    caseNumber: "1029/ق/2024",
    title: "مجموعة بن لادن ضد وزارة المالية",
    clientName: "مجموعة بن لادن",
    court: "المحكمة التجارية بالرياض",
    status: "نشطة",
    nextSession: "الأحد 2 يونيو 2024 - 9:00 ص",
    type: "تجارية",
    createdAt: "12 فبراير 2024",
    description: "نزاع تجاري يتعلق بعقد مقاولات حكومي بقيمة 850 مليون ريال، تقدمت فيه المجموعة بمطالبة بالتعويض جراء التأخر في صرف المستحقات المالية.",
    judge: "القاضي فهد العتيبي",
    opponent: "هيئة الشؤون القانونية لوزارة المالية",
    sessions: [
      { date: "15 مارس 2024", result: "تم تقديم المستندات", notes: "طلب المحكمة تقديم تقرير خبير مالي" },
      { date: "20 أبريل 2024", result: "استماع الخبير", notes: "تقرير الخبير يدعم موقف الموكل" },
    ],
    documents: [
      { name: "عقد المقاولات الأصلي", date: "12 فبراير 2024", type: "عقد" },
      { name: "تقرير الخبير المالي", date: "18 أبريل 2024", type: "تقرير" },
      { name: "صحيفة الدعوى", date: "12 فبراير 2024", type: "لائحة" },
    ],
  },
  {
    id: "CAS-1035",
    caseNumber: "1035/ع/2024",
    title: "قضية عمالية - شركة أرامكو",
    clientName: "شركة أرامكو السعودية",
    court: "المحكمة العمالية بالدمام",
    status: "نشطة",
    nextSession: "الثلاثاء 4 يونيو 2024 - 10:30 ص",
    type: "عمالية",
    createdAt: "15 فبراير 2024",
    description: "دعوى مقدمة من موظف سابق يطالب بمكافأة نهاية خدمة وتعويضات إضافية بعد إنهاء عقده.",
    judge: "القاضية منى الزهراني",
    opponent: "محمد سعيد الحربي",
    sessions: [
      { date: "10 مارس 2024", result: "جلسة أولى", notes: "حضر الطرفان وتبادلا اللوائح" },
    ],
    documents: [
      { name: "عقد العمل", date: "15 فبراير 2024", type: "عقد" },
      { name: "لائحة الرد", date: "1 مارس 2024", type: "لائحة" },
    ],
  },
  {
    id: "CAS-1041",
    caseNumber: "1041/م/2024",
    title: "نزاع عقاري - حي الملقا",
    clientName: "عبدالله فهد الراجحي",
    court: "المحكمة العامة بالرياض",
    status: "مؤجلة",
    nextSession: "بانتظار التحديد",
    type: "مدنية",
    createdAt: "20 يناير 2024",
    description: "دعوى تتعلق بملكية قطعة أرض تجارية في حي الملقا، تشمل طلب إثبات الملكية وإزالة التعدي.",
    judge: "القاضي سعد الشمري",
    opponent: "ورثة محمد الشمري",
    sessions: [
      { date: "5 فبراير 2024", result: "أُجِّلت", notes: "تغيب الخصم دون إخطار" },
      { date: "18 مارس 2024", result: "أُجِّلت مرة ثانية", notes: "طلب الخصم مهلة إضافية" },
    ],
    documents: [
      { name: "صك الملكية", date: "20 يناير 2024", type: "وثيقة رسمية" },
      { name: "تقرير المساحة", date: "10 فبراير 2024", type: "تقرير" },
    ],
  },
  {
    id: "CAS-1048",
    caseNumber: "1048/ت/2024",
    title: "استشارة امتثال - شركة نيوم",
    clientName: "شركة نيوم",
    court: "هيئة الاستثمار",
    status: "منتهية",
    nextSession: "—",
    type: "استشارية",
    createdAt: "5 يناير 2024",
    description: "تقييم الامتثال القانوني لعقود التوريد الدولية وفق أنظمة المملكة والاتفاقيات التجارية الدولية.",
    judge: "—",
    opponent: "—",
    sessions: [],
    documents: [
      { name: "تقرير الامتثال النهائي", date: "28 يناير 2024", type: "تقرير" },
      { name: "توصيات قانونية", date: "28 يناير 2024", type: "مذكرة" },
    ],
  },
  {
    id: "CAS-1052",
    caseNumber: "1052/أ/2024",
    title: "تركة آل الراجحي - تصفية",
    clientName: "محمد عبدالعزيز الراجحي",
    court: "المحكمة الشرعية بالرياض",
    status: "نشطة",
    nextSession: "الأربعاء 5 يونيو 2024 - 11:00 ص",
    type: "أحوال شخصية",
    createdAt: "1 مارس 2024",
    description: "قضية تصفية تركة تشمل أصولاً عقارية وحصصاً تجارية بقيمة إجمالية تتجاوز 120 مليون ريال.",
    judge: "القاضي إبراهيم آل الشيخ",
    opponent: "الورثة المشتركون",
    sessions: [
      { date: "15 مارس 2024", result: "استماع أولي", notes: "حصر الأصول والإرث" },
    ],
    documents: [
      { name: "شهادة الوفاة", date: "1 مارس 2024", type: "وثيقة رسمية" },
      { name: "حصر الإرث", date: "10 مارس 2024", type: "وثيقة رسمية" },
    ],
  },
  {
    id: "CAS-1055",
    caseNumber: "1055/ج/2023",
    title: "قضية جنائية اقتصادية - البنك الأهلي",
    clientName: "البنك الأهلي التجاري",
    court: "النيابة العامة / المحكمة الجزائية",
    status: "منتهية",
    nextSession: "—",
    type: "جنائية اقتصادية",
    createdAt: "10 أكتوبر 2023",
    description: "دعوى تتعلق بعمليات احتيال مالي وغسيل أموال، انتهت بإدانة المتهم وصدور حكم بالسجن والغرامة المالية.",
    judge: "القاضي عبدالرحمن المانع",
    opponent: "المدعى عليه: خالد المطيري",
    sessions: [
      { date: "20 نوفمبر 2023", result: "قرار الاتهام", notes: "تقديم أدلة الاحتيال" },
      { date: "15 يناير 2024", result: "الحكم الابتدائي", notes: "صدر الحكم لصالح الموكل" },
    ],
    documents: [
      { name: "التقرير الجنائي المالي", date: "25 أكتوبر 2023", type: "تقرير" },
      { name: "نسخة الحكم النهائي", date: "20 يناير 2024", type: "حكم" },
    ],
  },
];
