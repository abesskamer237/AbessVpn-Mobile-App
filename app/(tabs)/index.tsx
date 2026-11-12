import {useCallback,useEffect,useState} from 'react';
import {RefreshControl,StyleSheet,Text,View} from 'react-native';
import {api,me} from '@/lib/api';
import {accountStatus,bytesToGb} from '@/lib/format';
import type {ApiUser,OpsHealth,Reseller,SshInventory,Transaction} from '@/types';
import {Card,ErrorText,Screen,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

export default function Dashboard(){
  const [user,setUser]=useState<ApiUser|null>(null),[ssh,setSsh]=useState<SshInventory|null>(null),[resellers,setResellers]=useState<Reseller[]>([]),[tx,setTx]=useState<Transaction[]>([]),[ops,setOps]=useState<OpsHealth|null>(null);
  const [loading,setLoading]=useState(false),[error,setError]=useState('');
  const load=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      const u=await me();setUser(u);
      const [s,r,t]=await Promise.all([api<SshInventory>('/api/v1/admin/ssh'),api<Reseller[]>('/api/v1/admin/resellers'),api<Transaction[]>('/api/v1/admin/transactions')]);
      setSsh(s);setResellers(r);setTx(t);
      if(u.role==='SUPER_ADMIN')setOps(await api<OpsHealth>('/api/v1/admin/operations'));else setOps(null);
    }catch(e){setError(e instanceof Error?e.message:'Chargement impossible');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[]);
  const accounts=(ssh?.accounts||[]).filter(a=>a.managed);
  const active=accounts.filter(a=>accountStatus(a).key==='active').length;
  const alerts=accounts.filter(a=>['quota','error','expired','expiring'].includes(accountStatus(a).key)).length;
  const used=accounts.reduce((n,a)=>n+bytesToGb(a.usedBytes),0),quota=accounts.reduce((n,a)=>n+bytesToGb(a.quotaBytes),0);
  const volume30=tx.filter(t=>Date.parse(t.timestamp)>Date.now()-30*86400000).reduce((n,t)=>n+Math.abs(Number(t.amountGb||0)),0);

  return <Screen>
    <RefreshControl refreshing={loading} onRefresh={()=>void load()}/>
    <Title sub={user?'Bonjour '+user.name+' · '+user.role:'Vue d’ensemble du panel'}>Dashboard</Title>
    <ErrorText value={error}/>
    <View style={s.grid}>
      <Card><Text style={s.kpi}>{accounts.length}</Text><Text style={ui.muted}>Clients SSH-WSS</Text><Text style={s.good}>{active} actifs</Text></Card>
      <Card><Text style={s.kpi}>{resellers.length}</Text><Text style={ui.muted}>Revendeurs</Text><Text style={s.good}>{resellers.filter(r=>r.status==='active').length} actifs</Text></Card>
      <Card><Text style={s.kpi}>{user?.role==='RESELLER'?(user.credits.toFixed(1)+' Go'):(quota.toFixed(1)+' Go')}</Text><Text style={ui.muted}>{user?.role==='RESELLER'?'Solde disponible':'Quota vendu'}</Text><Text style={ui.muted}>{used.toFixed(1)} Go consommés</Text></Card>
      <Card><Text style={s.kpi}>{volume30.toFixed(1)} Go</Text><Text style={ui.muted}>Mouvements 30 jours</Text><Text style={ui.muted}>{tx.length} transactions</Text></Card>
    </View>
    <Card><Text style={s.section}>À surveiller</Text><Text style={ui.muted}>{alerts?alerts+' client(s) nécessitent une attention.':'Aucune alerte client détectée.'}</Text>{(ops?.alerts||[]).map(x=><Text key={x} style={s.warn}>• {x}</Text>)}</Card>
    {ssh?.managedNodes?.length?<Card><Text style={s.section}>Infrastructure</Text>{ssh.managedNodes.map(n=><View key={n.id} style={s.line}><Text style={s.name}>{n.name}</Text><Text style={n.agentOnline?s.good:s.warn}>{n.agentOnline?'En ligne':'Hors ligne'}</Text></View>)}</Card>:null}
    <Card><Text style={s.section}>Activité récente</Text>{tx.slice(0,6).map(t=><View key={t.id} style={s.tx}><View style={{flex:1}}><Text style={s.name}>{t.type.replaceAll('_',' ')}</Text><Text style={ui.muted}>{t.resellerName} · {t.note}</Text></View><Text style={s.amount}>{Number(t.amountGb).toFixed(1)} Go</Text></View>)}</Card>
  </Screen>;
}
const s=StyleSheet.create({grid:{gap:10},kpi:{color:theme.text,fontSize:26,fontWeight:'900'},good:{color:'#4FD18B',fontWeight:'700'},warn:{color:'#FFB454',fontWeight:'700'},section:{color:theme.text,fontSize:17,fontWeight:'900'},line:{flexDirection:'row',justifyContent:'space-between',gap:10,paddingVertical:4},name:{color:theme.text,fontWeight:'800'},tx:{flexDirection:'row',gap:10,borderTopWidth:1,borderTopColor:theme.border,paddingTop:9,marginTop:4},amount:{color:theme.primary,fontWeight:'900'}});
