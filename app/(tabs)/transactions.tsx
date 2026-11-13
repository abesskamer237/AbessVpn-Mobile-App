import {useCallback,useEffect,useMemo,useState} from 'react';
import {FlatList,RefreshControl,StyleSheet,Text,View} from 'react-native';
import {api} from '@/lib/api';
import {fmtDateTime} from '@/lib/format';
import type {Transaction} from '@/types';
import {Card,ErrorText,Field,Screen,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

export default function Transactions(){
  const [items,setItems]=useState<Transaction[]>([]),[search,setSearch]=useState(''),[refreshing,setRefreshing]=useState(false),[error,setError]=useState('');
  const load=useCallback(async()=>{setError('');try{setItems(await api<Transaction[]>('/api/v1/admin/transactions'));}catch(e){setError(e instanceof Error?e.message:'Chargement impossible');}},[]);
  useEffect(()=>{void load();},[]);
  const rows=useMemo(()=>items.filter(t=>!search.trim()||[t.resellerName,t.type,t.note,String(t.amountGb)].join(' ').toLowerCase().includes(search.toLowerCase())),[items,search]);
  const volume=rows.reduce((n,t)=>n+Math.abs(Number(t.amountGb||0)),0);
  return <Screen scroll={false}>
    <View style={{padding:10,paddingBottom:5,gap:6}}><Title sub={rows.length+' mouvement(s) · '+volume.toFixed(1)+' Go'}>Transactions</Title><ErrorText value={error}/><Field placeholder="Rechercher revendeur, type, note…" value={search} onChangeText={setSearch}/></View>
    <FlatList data={rows} keyExtractor={x=>x.id} contentContainerStyle={{padding:10,paddingTop:3,gap:6,paddingBottom:26}}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.primary} onRefresh={()=>{setRefreshing(true);void load().finally(()=>setRefreshing(false))}}/>}
      ListEmptyComponent={<Card><Text style={ui.muted}>Aucune transaction.</Text></Card>}
      renderItem={({item})=><Card><View style={s.row}><View style={{flex:1}}><Text style={s.name}>{item.type.replaceAll('_',' ')}</Text><Text style={ui.muted}>{item.resellerName}</Text></View><Text style={s.amount}>{Number(item.amountGb).toFixed(2)} Go</Text></View><Text style={ui.muted}>{item.note}</Text><Text style={ui.muted}>{fmtDateTime(item.timestamp)} · {Number(item.balanceBefore).toFixed(2)} → {Number(item.balanceAfter).toFixed(2)} Go</Text></Card>}
    />
  </Screen>;
}
const s=StyleSheet.create({row:{flexDirection:'row',gap:6},name:{color:theme.text,fontWeight:'900'},amount:{color:theme.primary,fontWeight:'900'}});
