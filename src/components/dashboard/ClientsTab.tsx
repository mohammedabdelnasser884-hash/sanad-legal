import React from 'react';
import { I } from '../../constants';

function ClientsTab({ cases, clients, clientSearch, setClientSearch, clientsPage, setClientsPage, clientsTotal, clientsLoading, fetchClients, setSelectedClient, setShowClientModal }: any) {
  const ClientsTab =
        // هيدر + زر إضافة
        React.createElement('div',{className:"flex items-center justify-between"},
            React.createElement('h3',{className:"text-sm font-black text-white"},"سجل الموكلين"),
            React.createElement('button',{onClick:()=>setShowClientModal(true),className:"flex items-center bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white px-3 py-2 rounded-xl text-xs font-black shadow-lg gap-1 active:scale-95 transition-transform"},
                React.createElement(I.Plus),"موكل جديد")
        ),
        // مربع البحث
        React.createElement('div',{className:"relative"},
            React.createElement('input',{
                type:"text",value:clientSearch,
                onChange:e=>{
                    const val=e.target.value;
                    setClientSearch(val);
                    clearTimeout((window as any)._clientSearchTimer);
                    (window as any)._clientSearchTimer=setTimeout(()=>fetchClients(0,val),500);
                },
                placeholder:"🔍 ابحث باسم الموكل...",
                className:"w-full p-3 pr-4 text-xs rounded-xl border border-white/10 bg-premium-card text-white placeholder-slate-500 transition-colors",
                style:{fontFamily:'Cairo,sans-serif'}
            }),
            clientSearch&&React.createElement('button',{
                onClick:()=>{setClientSearch('');fetchClients(0,'');},
                className:"absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            },"✕")
        ),
        // القائمة
        clientsLoading&&clients.length===0
            ?React.createElement('div',{className:"flex items-center justify-center py-16 gap-2 text-slate-500 text-xs"},React.createElement(I.Spin),"جاري الجلب...")
            :clients.length===0
            ?React.createElement('div',{className:"bg-premium-card border border-white/5 rounded-xl p-10 text-center space-y-3"},
                React.createElement('div',{className:"w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-2"},React.createElement(I.Person)),
                React.createElement('p',{className:"text-emerald-400 font-black"},clientSearch?("لا توجد نتائج لـ \""+clientSearch+"\""):"لا يوجد موكلون بعد"),
                React.createElement('p',{className:"text-slate-500 text-xs"},clientSearch?"جرب كلمة بحث مختلفة":"اضغط على موكل جديد لإضافة أول موكل.")
              )
            :React.createElement('div',{className:"space-y-2"},
                clients.map(c=>{
                    const caseCount = cases.filter(ca=>ca.client_id===c.id).length;
                    return React.createElement('div',{
                        key:c.id,
                        onClick:()=>setSelectedClient(c),
                        className:"bg-premium-card border border-white/5 rounded-xl px-3 py-2.5 active:scale-[0.98] transition-all cursor-pointer"
                    },
                        React.createElement('div',{className:"flex items-center gap-2.5"},
                            React.createElement('div',{className:"w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0"},
                                (c.full_name||'م').charAt(0)
                            ),
                            React.createElement('div',{className:"flex-1 min-w-0"},
                                React.createElement('p',{className:"text-[12px] font-black text-white truncate"},c.full_name),
                                React.createElement('div',{className:"flex items-center gap-2 mt-0.5 flex-wrap"},
                                    React.createElement('span',{className:"text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400"},c.type==='company'?'شركة':c.type==='government'?'جهة حكومية':'فرد'),
                                    c.phone&&React.createElement('span',{className:"text-[9px] text-slate-500"},c.phone),
                                    caseCount > 0 && React.createElement('span',{
                                        className:"text-[8px] font-black px-1.5 py-0.5 rounded-full",
                                        style:{background:'rgba(212,175,55,0.1)',color:'#D4AF37'}
                                    }, caseCount + ' قضية')
                                )
                            ),
                            React.createElement('svg',{className:"w-3.5 h-3.5 text-slate-600 shrink-0",fill:"none",viewBox:"0 0 24 24",strokeWidth:"2.5",stroke:"currentColor"},
                                React.createElement('path',{strokeLinecap:"round",strokeLinejoin:"round",d:"M15.75 19.5 8.25 12l7.5-7.5"})
                            )
                        )
                    );
                }),
                clientsTotal > PAGE_SIZE && React.createElement('div',{className:"flex items-center justify-between gap-2 pt-1"},
                    React.createElement('button',{
                        onClick:()=>{const p=clientsPage-1;setClientsPage(p);fetchClients(p,clientSearch);},
                        disabled:clientsPage===0||clientsLoading,
                        className:"flex-1 py-2.5 rounded-xl text-xs font-black active:scale-[0.98] transition-all disabled:opacity-30",
                        style:{background:'rgba(52,211,153,0.06)',border:'1px solid rgba(52,211,153,0.18)',color:'#34d399'}
                    },"→ السابق"),
                    React.createElement('span',{className:"text-[10px] text-slate-500 font-black whitespace-nowrap"},
                        `${clientsPage*PAGE_SIZE+1}–${Math.min((clientsPage+1)*PAGE_SIZE,clientsTotal)} / ${clientsTotal}`
                    ),
                    React.createElement('button',{
                        onClick:()=>{const p=clientsPage+1;setClientsPage(p);fetchClients(p,clientSearch);},
                        disabled:(clientsPage+1)*PAGE_SIZE>=clientsTotal||clientsLoading,
                        className:"flex-1 py-2.5 rounded-xl text-xs font-black active:scale-[0.98] transition-all disabled:opacity-30",
                        style:{background:'rgba(52,211,153,0.06)',border:'1px solid rgba(52,211,153,0.18)',color:'#34d399'}
                    },"التالي ←")
                )
            )
    );
  return ClientsTab;
}
export default ClientsTab;
