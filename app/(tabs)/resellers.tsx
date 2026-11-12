import {useEffect,useState} from 'react';
import {FlatList,SafeAreaView,StyleSheet,Text,View} from 'react-native';
import {api} from '@/lib/api';
import {theme} from '@/theme';
type Reseller={id:string;name:string;email:string;credits:number;status:string};
export default function Resellers(){
  const [items,setItems]=useState<Reseller[]>([]);const [error,setError]=useState('');
  useEffect(()=>{api<Reseller[]>('/api/v1/admin/resellers').then(setItems).catch(e=>setError(e.message));},[]);
  return <SafeAreaView style={s.page}><Text style={s.title}>Revendeurs</Text>{!!error&&<Text style={s.error}>{error}</Text>}<FlatList data={items} keyExtractor={x=>x.id} contentContainerStyle={{gap:10,paddingBottom:24}} renderItem={({item})=><View style={s.card}><Text style={s.name}>{item.name}</Text><Text style={s.meta}>{item.email}</Text><Text style={s.meta}>{item.credits} Go · {item.status}</Text></View>}/></SafeAreaView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:20},title:{color:theme.text,fontSize:28,fontWeight:'800',marginBottom:14},card:{backgroundColor:theme.surface,borderRadius:16,padding:15,borderWidth:1,borderColor:theme.border,gap:5},name:{color:theme.text,fontWeight:'800'},meta:{color:theme.muted},error:{color:theme.danger,marginBottom:10}});
