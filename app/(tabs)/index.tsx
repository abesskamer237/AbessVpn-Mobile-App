import {useCallback,useEffect,useState} from 'react';
import {RefreshControl,StyleSheet,Text,View} from 'react-native';
import {api,me} from '@/lib/api';
import {accountStatus,bytesToGb,fmtDateTime} from '@/lib/format';
import type {ApiUser,OpsHealth,Reseller,SshInventory,Transaction} from '@/types';
import {Badge,Card,ErrorText,Screen,SectionTitle,StatusDot,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

export default function Dashboard(){
  const [user,setUser]=useState<ApiUser|null>(null),[ssh,setSsh]=useState<SshInventory|null>(null),[resellers,setResellers]=useState<Reseller[]>([]),[tx,setTx]=useState<Transaction[]>([]),[ops,setOps]=useState<OpsHealth|null>(null);
  const [loading,setLoading]=useState(false),[error,setError]=useState('');
  const load=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      const u=await me();setUser(u);
      const [ss,r,t]=await Promise.all([api<SshInventory>('/api/v1/admin/ssh'),api<Reseller[]>('/api/v1/admin/resellers'),api<Transaction[]>('/api/v1/admin/transactions')]);
      setSsh(ss);setResellers(r);setTx(t);
      if(u.role==='SUPER_ADMIN')setOps(await api<OpsHealth>('/api/v1/admin/operations'));else setOps(null);
    }catch(e){setError(e instanceof Error?e.message:'Chargement impossible');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();const timer=setInterval(()=>{void load();},10000);return()=>clearInterval(timer);},[load]);
  const accounts=(ssh?.accounts||[]).filter(a=>a.managed);
  const active=accounts.filter(a=>accountStatus(a).key==='active').length;
  const alerts=accounts.filter(a=>['quota','error','expired','expiring'].includes(accountStatus(a).key)).length;
  const used=accounts.reduce((n,a)=>n+bytesToGb(a.usedBytes),0),quota=accounts.reduce((n,a)=>n+bytesToGb(a.quotaBytes),0);
  const volume30=tx.filter(t=>Date.parse(t.timestamp)>Date.now()-30*86400000).reduce((n,t)=>n+Math.abs(Number(t.amountGb||0)),0);

  return <Screen>
    <RefreshControl refreshing={loading} onRefresh={()=>void load()}/>
    <Title eyebrow="ABESS CONTROL" sub={user?user.name+' · '+user.role:'Synchronisation avec le panel'}>Vue d’ensemble</Title>
    <ErrorText value={error}/>
    <View style={s.heroCard}>
      <View style={s.heroTop}><View><Text style={s.heroLabel}>INFRASTRUCTURE</Text><Text style={s.heroValue}>{active}/{accounts.length}</Text><Text style={s.heroSub}>clients actifs</Text></View><View style={s.health}><StatusDot online={!ops||ops.ok!==false}/><Text style={s.healthText}>{!ops||ops.ok!==false?'Système opérationnel':'Attention requise'}</Text></View></View>
      <View style={s.heroDivider}/><View style={s.heroStats}><View><Text style={s.miniValue}>{quota.toFixed(1)} Go</Text><Text style={s.miniLabel}>Quota attribué</Text></View><View><Text style={s.miniValue}>{used.toFixed(1)} Go</Text><Text style={s.miniLabel}>Consommés</Text></View><View><Text style={s.miniValue}>{alerts}</Text><Text style={s.miniLabel}>Alertes</Text></View></View>
    </View>

    <SectionTitle sub="Indicateurs commerciaux et opérationnels">Performance</SectionTitle>
    <View style={s.grid}>
      <Card><Text style={s.kpi}>{accounts.length}</Text><Text style={s.kpiLabel}>Clients SSH-WSS</Text><Badge text={active+' actifs'} tone="success"/></Card>
      <Card><Text style={s.kpi}>{resellers.length}</Text><Text style={s.kpiLabel}>Revendeurs</Text><Badge text={resellers.filter(r=>r.status==='active').length+' actifs'} tone="info"/></Card>
      <Card><Text style={s.kpi}>{user?.role==='RESELLER'?(user.credits.toFixed(1)+' Go'):(quota.toFixed(1)+' Go')}</Text><Text style={s.kpiLabel}>{user?.role==='RESELLER'?'Solde disponible':'Quota vendu'}</Text><Text style={ui.muted}>{used.toFixed(1)} Go utilisés</Text></Card>
      <Card><Text style={s.kpi}>{volume30.toFixed(1)} Go</Text><Text style={s.kpiLabel}>Mouvements 30 j</Text><Text style={ui.muted}>{tx.length} transaction(s)</Text></Card>
    </View>

    {!!ssh?.managedNodes?.length&&<><SectionTitle sub="État des nœuds SSH-WSS">Infrastructure</SectionTitle><Card>{ssh.managedNodes.map((n,i)=><View key={n.id} style={[s.line,i>0&&s.lineBorder]}><View style={s.lineLeft}><StatusDot online={!!n.agentOnline}/><View><Text style={s.name}>{n.name}</Text><Text style={s.subtle}>{n.sshWsSni||n.host}</Text></View></View><Badge text={n.agentOnline?'En ligne':'Hors ligne'} tone={n.agentOnline?'success':'danger'}/></View>)}</Card></>}

    <SectionTitle sub="Dernières opérations enregistrées">Activité récente</SectionTitle>
    <Card>{tx.length?tx.slice(0,6).map((t,i)=><View key={t.id} style={[s.tx,i>0&&s.lineBorder]}><View style={{flex:1}}><Text style={s.name}>{t.type.replaceAll('_',' ')}</Text><Text style={s.subtle}>{t.resellerName} · {fmtDateTime(t.timestamp)}</Text><Text numberOfLines={1} style={ui.muted}>{t.note}</Text></View><Text style={s.amount}>{Number(t.amountGb).toFixed(1)} Go</Text></View>):<Text style={ui.muted}>Aucune activité récente.</Text>}</Card>
    <View style={{height:76}}/>
  </Screen>;
}
const s=StyleSheet.create({
  heroCard:{backgroundColor:'#10151C',borderWidth:1,borderColor:theme.primaryBorder,borderRadius:15,padding:10,gap:8},
  heroTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:7},heroLabel:{color:theme.primary,fontSize:8,fontWeight:'900',letterSpacing:1},
  heroValue:{color:theme.text,fontSize:26,fontWeight:'900',letterSpacing:-1,marginTop:2},heroSub:{color:theme.muted,fontSize:9,fontWeight:'700'},
  health:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:theme.surface2,borderWidth:1,borderColor:theme.border,borderRadius:99,paddingHorizontal:7,paddingVertical:4},healthText:{color:theme.textSoft,fontSize:8,fontWeight:'800'},
  heroDivider:{height:1,backgroundColor:theme.borderSoft},heroStats:{flexDirection:'row',justifyContent:'space-between',gap:7},miniValue:{color:theme.text,fontSize:12,fontWeight:'900'},miniLabel:{color:theme.muted,fontSize:8,marginTop:1},
  grid:{gap:6},kpi:{color:theme.text,fontSize:18,fontWeight:'900',letterSpacing:-.5},kpiLabel:{color:theme.textSoft,fontSize:9,fontWeight:'800'},
  line:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:6,paddingVertical:3},lineBorder:{borderTopWidth:1,borderTopColor:theme.borderSoft,paddingTop:7,marginTop:2},
  lineLeft:{flexDirection:'row',alignItems:'center',gap:6},name:{color:theme.text,fontWeight:'900',fontSize:11},subtle:{color:theme.muted,fontSize:9,marginTop:1},
  tx:{flexDirection:'row',gap:12,paddingVertical:4},amount:{color:theme.primary,fontWeight:'900',fontSize:12}
});
