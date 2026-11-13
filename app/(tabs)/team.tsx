import {useCallback,useEffect,useState} from 'react';
import {FlatList,Pressable,StyleSheet,Text,View} from 'react-native';
import {api} from '@/lib/api';
import type {Operator} from '@/types';
import {Button,Card,ErrorText,Field,Label,Screen,Sheet,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

export default function Team(){
  const [items,setItems]=useState<Operator[]>([]),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const load=useCallback(async()=>{setError('');try{setItems(await api<Operator[]>('/api/v1/admin/operators'));}catch(e){setError(e instanceof Error?e.message:'Chargement impossible');}},[]);
  useEffect(()=>{void load();},[]);
  async function create(){setBusy(true);setError('');try{await api('/api/v1/admin/operators',{method:'POST',body:JSON.stringify({name,email,password})});setOpen(false);setName('');setEmail('');setPassword('');await load();}catch(e){setError(e instanceof Error?e.message:'Création impossible');}finally{setBusy(false);}}
  async function toggle(o:Operator){setBusy(true);try{await api('/api/v1/admin/operators/'+o.id+'/status',{method:'PUT',body:JSON.stringify({status:o.status==='active'?'suspended':'active'})});await load();}catch(e){setError(e instanceof Error?e.message:'Modification impossible');}finally{setBusy(false);}}
  return <Screen scroll={false}><View style={{padding:10,paddingBottom:5,gap:6}}><Title sub="Administrateurs ayant accès au panel.">Équipe</Title><ErrorText value={error}/><Button title="Ajouter un administrateur" onPress={()=>setOpen(true)}/></View>
    <FlatList data={items} keyExtractor={x=>x.id} contentContainerStyle={{padding:10,paddingTop:3,gap:6,paddingBottom:26}} renderItem={({item})=><Card><View style={s.row}><View style={{flex:1}}><Text style={s.name}>{item.name}</Text><Text style={ui.muted}>{item.email}</Text><Text style={ui.muted}>{item.status}</Text></View><Pressable onPress={()=>void toggle(item)}><Text style={s.action}>{item.status==='active'?'Suspendre':'Réactiver'}</Text></Pressable></View></Card>}/>
    <Sheet visible={open} onClose={()=>setOpen(false)} title="Nouvel administrateur"><Label>Nom</Label><Field value={name} onChangeText={setName}/><Label>Email</Label><Field autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/><Label>Mot de passe</Label><Field secureTextEntry value={password} onChangeText={setPassword} placeholder="16 caractères minimum"/><Button title="Créer l’administrateur" disabled={busy||!name||!email||password.length<16} onPress={()=>void create()}/></Sheet>
  </Screen>;
}
const s=StyleSheet.create({row:{flexDirection:'row',gap:6,alignItems:'center'},name:{color:theme.text,fontWeight:'900'},action:{color:theme.primary,fontWeight:'800'}});
