import { mockCases } from "@/components/cases/mock-data";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationalId: string;
  type: "فرد" | "شركة";
  registeredAt: string;
  address: string;
  notes: string;
  caseIds: string[];
}

export const mockClients: Client[] = [
  {
    id: "CLT-001",
    name: "مجموعة بن لادن السعودية",
    phone: "+966 11 234 5678",
    email: "legal@binladin.com.sa",
    nationalId: "7001234567",
    type: "شركة",
    registeredAt: "10 يناير 2024",
    address: "الرياض، حي العليا، برج المملكة",
    notes: "عميل مؤسسي كبير، يتطلب تواصلاً مع مستشارهم القانوني الداخلي.",
    caseIds: ["CAS-1029"],
  },
  {
    id: "CLT-002",
    name: "شركة أرامكو السعودية",
    phone: "+966 13 872 0000",
    email: "legal@aramco.com",
    nationalId: "7009876543",
    type: "شركة",
    registeredAt: "12 فبراير 2024",
    address: "الظهران، مجمع أرامكو",
    notes: "التواصل عبر البريد الرسمي فقط. لديهم فريق قانوني داخلي متكامل.",
    caseIds: ["CAS-1035"],
  },
  {
    id: "CLT-003",
    name: "عبدالله فهد الراجحي",
    phone: "+966 50 123 4567",
    email: "a.alrajhi@gmail.com",
    nationalId: "1023456789",
    type: "فرد",
    registeredAt: "18 يناير 2024",
    address: "الرياض، حي الملقا",
    notes: "يفضل التواصل هاتفياً. يحتاج شرحاً تفصيلياً لكل إجراء.",
    caseIds: ["CAS-1041"],
  },
  {
    id: "CLT-004",
    name: "شركة نيوم",
    phone: "+966 11 999 8877",
    email: "contracts@neom.com",
    nationalId: "7001357924",
    type: "شركة",
    registeredAt: "3 يناير 2024",
    address: "تبوك، منطقة نيوم",
    notes: "مشاريع عملاقة متعددة. يتطلب متابعة أسبوعية.",
    caseIds: ["CAS-1048"],
  },
  {
    id: "CLT-005",
    name: "محمد عبدالعزيز الراجحي",
    phone: "+966 55 765 4321",
    email: "m.alrajhi@hotmail.com",
    nationalId: "1045678901",
    type: "فرد",
    registeredAt: "28 فبراير 2024",
    address: "الرياض، حي السفارات",
    notes: "قضية تركة حساسة. التعامل بسرية تامة.",
    caseIds: ["CAS-1052"],
  },
  {
    id: "CLT-006",
    name: "البنك الأهلي التجاري",
    phone: "+966 11 800 0000",
    email: "legalaffairs@alahli.com",
    nationalId: "7003698521",
    type: "شركة",
    registeredAt: "5 أكتوبر 2023",
    address: "الرياض، طريق الملك فهد",
    notes: "عميل ذو أولوية قصوى. التقارير تُرسل أسبوعياً.",
    caseIds: ["CAS-1055"],
  },
  {
    id: "CLT-007",
    name: "سارة خالد العمري",
    phone: "+966 54 321 9876",
    email: "s.alomari@outlook.com",
    nationalId: "1067891234",
    type: "فرد",
    registeredAt: "20 مارس 2024",
    address: "جدة، حي الروضة",
    notes: "قضية طلاق وحضانة. تحتاج دعماً نفسياً أثناء الجلسات.",
    caseIds: [],
  },
  {
    id: "CLT-008",
    name: "مجموعة MBC للإعلام",
    phone: "+966 11 441 1111",
    email: "legal@mbc.net",
    nationalId: "7007412580",
    type: "شركة",
    registeredAt: "15 مارس 2024",
    address: "دبي / الرياض، مدينة MBC",
    notes: "عقود ترخيص ومحتوى. تستدعي خبرة في قانون الملكية الفكرية.",
    caseIds: [],
  },
];

export function getClientCases(clientId: string) {
  const client = mockClients.find((c) => c.id === clientId);
  if (!client) return [];
  return mockCases.filter((c) => client.caseIds.includes(c.id));
}
