import {useEffect,useState} from 'react';
import {FlatList,SafeAreaView,StyleSheet,Text,View} from 'react-native';
import {api} from '@/lib/api';
import {theme} from '@/theme';
type SshAccount={id:string;label:string;username:string;enabled:boolean;resellerName?:string};
type Inventory={accounts:SshAccount[]};
export default function Clients(){
  const [items,setItems]=useState<SshAccount[]>([]);const [error,setError]=useState('');
  useEffect(()=>{api<Inventory>('/api/v1/admin/ssh').then(r=>setItems(r.accounts||[])).catch(e=>setError(e.message));},[]);
  return <SafeAreaView style={s.page}><Text style={s.title}>Clients</Text>{!!error&&<Text style={s.error}>{error}</Text>}<FlatList data={items} keyExtractor={x=>x.id} contentContainerStyle={{gap:10,paddingBottom:24}} renderItem={({item})=><View style={s.card}><Text style={s.name}>{item.label}</Text><Text style={s.meta}>{item.username}</Text><Text style={s.meta}>{item.enabled?'Actif':'Suspendu'} · {item.resellerName||'Administration'}</Text></View>}/></SafeAreaView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:20},title:{color:theme.text,fontSize:28,fontWeight:'800',marginBottom:14},card:{backgroundColor:theme.surface,borderRadius:16,padding:15,borderWidth:1,borderColor:theme.border,gap:5},name:{color:theme.text,fontWeight:'800'},meta:{color:theme.muted},error:{color:theme.danger,marginBottom:10}});
