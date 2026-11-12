import {useEffect,useState} from 'react';
import {SafeAreaView,StyleSheet,Text,View} from 'react-native';
import {me,type ApiUser} from '@/lib/api';
import {theme} from '@/theme';
export default function Dashboard(){
  const [user,setUser]=useState<ApiUser|null>(null); const [error,setError]=useState('');
  useEffect(()=>{me().then(setUser).catch(e=>setError(e.message));},[]);
  return <SafeAreaView style={s.page}><Text style={s.title}>Dashboard</Text><Text style={s.subtitle}>{user?'Bonjour '+user.name:'Chargement du compte…'}</Text>{!!error&&<Text style={s.error}>{error}</Text>}<View style={s.grid}><View style={s.card}><Text style={s.kpi}>{user?.credits??'—'}</Text><Text style={s.label}>Crédits Go</Text></View><View style={s.card}><Text style={s.kpi}>{user?.role??'—'}</Text><Text style={s.label}>Rôle</Text></View></View></SafeAreaView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:20,gap:12},title:{color:theme.text,fontSize:28,fontWeight:'800'},subtitle:{color:theme.muted},grid:{flexDirection:'row',gap:12,marginTop:12},card:{flex:1,backgroundColor:theme.surface,borderRadius:16,padding:16,borderWidth:1,borderColor:theme.border},kpi:{color:theme.text,fontSize:20,fontWeight:'800'},label:{color:theme.muted,marginTop:6},error:{color:theme.danger}});
