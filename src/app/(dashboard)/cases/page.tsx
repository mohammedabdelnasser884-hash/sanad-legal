
"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  ChevronRight,
  FileText,
  User,
  PlusCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function CasesPage() {
  const db = useFirestore();
  
  const casesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "cases"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: cases, loading } = useCollection(casesQuery);

  const mockCases = [
    { id: "CAS-1029", title: "مجموعة بن لادن ضد وزارة المالية", clientName: "مجموعة بن لادن", status: "نشطة", createdAt: "2024-02-12", caseNumber: "1029/ق" },
    { id: "CAS-1035", title: "قضية عمالية - أرامكس", clientName: "شركة أرامكس", status: "قيد المراجعة", createdAt: "2024-02-15", caseNumber: "1035/ع" },
  ];

  const displayCases = cases && cases.length > 0 ? cases : mockCases;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">إدارة القضايا</h2>
          <p className="text-muted-foreground">تتبع وإدارة كافة القضايا والإجراءات القانونية الخاصة بمكتبك.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full gap-2 border-white/10">
            <Filter className="h-4 w-4" /> تصفية
          </Button>
          <Button className="rounded-full gap-2 shadow-lg shadow-primary/20 font-bold">
            <PlusCircle className="h-4 w-4" /> إنشاء قضية جديدة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "القضايا النشطة", value: "42", color: "text-primary" },
          { label: "مواعيد نهائية عاجلة", value: "3", color: "text-destructive" },
          { label: "قضايا منتهية هذا الشهر", value: "12", color: "text-accent" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-card/50">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold font-headline ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="البحث برقم القضية، الموكل، أو العنوان..." 
            className="w-full bg-background border border-border rounded-xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
          />
        </div>
        <Button variant="ghost" className="hidden sm:flex rounded-xl gap-2 text-xs">
          الحالة: الكل <ChevronRight className="h-3 w-3 rotate-90" />
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-card/50 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">جاري تحميل البيانات...</div>
        ) : (
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[150px] text-right">رقم القضية</TableHead>
                <TableHead className="text-right text-foreground">عنوان القضية والموكل</TableHead>
                <TableHead className="text-right text-foreground">الحالة</TableHead>
                <TableHead className="text-right text-foreground">تاريخ القيد</TableHead>
                <TableHead className="text-left text-foreground">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayCases.map((item: any) => (
                <TableRow key={item.id} className="group hover:bg-white/5 border-border/50 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground text-right">{item.caseNumber || item.id}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        {item.clientName} <User className="h-3 w-3" />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={item.status === 'عاجل' ? 'destructive' : 'default'} 
                      className="rounded-full text-[10px] px-3 font-bold"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-right">
                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                      {item.createdAt} <Clock className="h-3 w-3" />
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-start gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
