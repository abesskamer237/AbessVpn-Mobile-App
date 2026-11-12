import {useCallback,useEffect,useMemo,useState} from 'react';
import {Alert,FlatList,Pressable,RefreshControl,StyleSheet,Text,View} from 'react-native';
import {api,me} from '@/lib/api';
import type {ApiUser,Reseller} from '@/types';
import {Button,Card,ErrorText,Field,Label,Screen,Sheet,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

export default function Resellers(){
  const [items,setItems]=useState<Reseller[]>([]),[user,setUser]=useState<ApiUser|null>(null);
  const [busy,setBusy]=useState(false),[refreshing,setRefreshing]=useState(false),[error,setError]=useState(''),[search,setSearch]=useState('');
  const [createOpen,setCreateOpen]=useState(false),[selected,setSelected]=useState<Reseller|null>(null);
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[credits,setCredits]=useState('0'),[parentId,setParentId]=useState('');
  const [creditAmount,setCreditAmount]=useState(''),[priceGb,setPriceGb]=useState('0'),[costGb,setCostGb]=useState('0'),[priceLicence,setPriceLicence]=useState('0');

  const load=useCallback(async()=>{setError('');try{const [r,u]=await Promise.all([api<Reseller[]>('/api/v1/admin/resellers'),me()]);setItems(r);setUser(u);if(selected)setSelected(r.find(x=>x.id===selected.id)||null);}catch(e){setError(e instanceof Error?e.message:'Chargement impossible');}},[selected?.id]);
  useEffect(()=>{void load();},[]);
  const rows=useMemo(()=>items.filter(r=>!search.trim()||[r.name,r.email,r.parentName||''].join(' ').toLowerCase().includes(search.toLowerCase())),[items,search]);

  async function create(){
    setBusy(true);setError('');
    try{await api('/api/v1/admin/resellers',{method:'POST',body:JSON.stringify({name:name.trim(),email:email.trim().toLowerCase(),password,initialCredits:Number(credits),...(parentId?{parentId}:{})})});setCreateOpen(false);setName('');setEmail('');setPassword('');setCredits('0');setParentId('');await load();}
    catch(e){setError(e instanceof Error?e.message:'Création impossible');}finally{setBusy(false);}
  }
  async function credit(){
    if(!selected)return;setBusy(true);try{await api('/api/v1/admin/resellers/'+selected.id+'/credit',{method:'PUT',body:JSON.stringify({amount:Number(creditAmount)})});setCreditAmount('');await load();}catch(e){setError(e instanceof Error?e.message:'Transfert impossible');}finally{setBusy(false);}
  }
  async function toggle(){
    if(!selected)return;setBusy(true);try{await api('/api/v1/admin/resellers/'+selected.id+'/status',{method:'PUT',body:JSON.stringify({status:selected.status==='active'?'suspended':'active'})});await load();}catch(e){setError(e instanceof Error?e.message:'Modification impossible');}finally{setBusy(false);}
  }
  async function pricing(){
    if(!selected)return;setBusy(true);try{await api('/api/v1/admin/resellers/'+selected.id+'/pricing',{method:'PUT',body:JSON.stringify({pricePerGbCfa:Number(priceGb),costPerGbCfa:Number(costGb),pricePerLicenceCfa:Number(priceLicence)})});await load();}catch(e){setError(e instanceof Error?e.message:'Tarification impossible');}finally{setBusy(false);}
  }
  function remove(){
    if(!selected)return;
    Alert.alert('Supprimer la branche revendeur','Le revendeur et ses descendants seront supprimés selon les règles du panel.',[{text:'Annuler',style:'cancel'},{text:'Supprimer',style:'destructive',onPress:()=>void(async()=>{setBusy(true);try{await api('/api/v1/admin/resellers/'+selected.id,{method:'DELETE'});setSelected(null);await load();}catch(e){setError(e instanceof Error?e.message:'Suppression impossible');}finally{setBusy(false);}})()}]);
  }
  function open(r:Reseller){setSelected(r);setPriceGb(String(r.pricePerGbCfa||0));setCostGb(String(r.costPerGbCfa||0));setPriceLicence(String(r.pricePerLicenceCfa||0));}

  return <Screen scroll={false}>
    <View style={{padding:18,paddingBottom:8,gap:10}}><Title sub="Hiérarchie, crédits et tarification des revendeurs.">Revendeurs</Title><ErrorText value={error}/><Field placeholder="Rechercher…" value={search} onChangeText={setSearch}/><Button title="Créer un revendeur" onPress={()=>setCreateOpen(true)}/></View>
    <FlatList style={{flex:1}} data={rows} keyExtractor={x=>x.id} contentContainerStyle={{padding:18,paddingTop:4,gap:10,paddingBottom:40}}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.primary} onRefresh={()=>{setRefreshing(true);void load().finally(()=>setRefreshing(false))}}/>}
      ListEmptyComponent={<Card><Text style={ui.muted}>Aucun revendeur.</Text></Card>}
      renderItem={({item})=><Pressable onPress={()=>open(item)}><Card><View style={s.row}><View style={{flex:1}}><Text style={s.name}>{item.name}</Text><Text style={ui.muted}>{item.email}</Text></View><Text style={[s.state,item.status!=='active'&&{color:theme.danger}]}>{item.status}</Text></View><Text style={ui.muted}>{item.credits} Go · {item.subResellersCount||0} sous-revendeur(s)</Text>{!!item.hierarchyPath?.length&&<Text style={ui.muted}>{item.hierarchyPath.join(' › ')}</Text>}</Card></Pressable>}
    />

    <Sheet visible={createOpen} onClose={()=>setCreateOpen(false)} title="Créer un revendeur">
      <Label>Nom</Label><Field value={name} onChangeText={setName} placeholder="Revendeur Douala"/>
      <Label>Email</Label><Field autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
      <Label>Mot de passe</Label><Field secureTextEntry value={password} onChangeText={setPassword} placeholder="16 caractères recommandés"/>
      <Label>Crédit initial (Go)</Label><Field keyboardType="decimal-pad" value={credits} onChangeText={setCredits}/>
      {user?.role!=='RESELLER'&&items.filter(r=>r.status==='active').length>0&&<><Label>Parent (optionnel)</Label><Pressable onPress={()=>setParentId('')}><Card><Text style={s.name}>{!parentId?'● ':'○ '}Administration</Text></Card></Pressable>{items.filter(r=>r.status==='active').map(r=><Pressable key={r.id} onPress={()=>setParentId(r.id)}><Card><Text style={s.name}>{parentId===r.id?'● ':'○ '}{r.name}</Text><Text style={ui.muted}>{r.credits} Go</Text></Card></Pressable>)}</>}
      <Button title={busy?'Création…':'Créer'} disabled={busy||!name.trim()||!email.trim()||password.length<8} onPress={()=>void create()}/>
    </Sheet>

    <Sheet visible={!!selected} onClose={()=>setSelected(null)} title={selected?.name||'Revendeur'}>
      {selected&&<>
        <Card><Text style={s.name}>{selected.email}</Text><Text style={ui.muted}>Solde : {selected.credits} Go</Text><Text style={ui.muted}>Statut : {selected.status}</Text><Text style={ui.muted}>Descendants : {selected.descendantCount||0}</Text></Card>
        <Label>Transférer / récupérer des crédits</Label><Field keyboardType="decimal-pad" value={creditAmount} onChangeText={setCreditAmount} placeholder="Ex. 20 ou -10"/>
        <Button title="Appliquer le mouvement" disabled={busy||!Number(creditAmount)} onPress={()=>void credit()}/>
        <Button title={selected.status==='active'?'Suspendre':'Réactiver'} kind="secondary" disabled={busy} onPress={()=>void toggle()}/>
        <Label>Tarification CFA</Label><View style={s.three}><View style={{flex:1,gap:6}}><Label>Prix/Go</Label><Field keyboardType="number-pad" value={priceGb} onChangeText={setPriceGb}/></View><View style={{flex:1,gap:6}}><Label>Coût/Go</Label><Field keyboardType="number-pad" value={costGb} onChangeText={setCostGb}/></View></View><Label>Prix/licence</Label><Field keyboardType="number-pad" value={priceLicence} onChangeText={setPriceLicence}/>
        <Button title="Enregistrer la tarification" kind="secondary" disabled={busy} onPress={()=>void pricing()}/>
        <Button title="Supprimer la branche" kind="danger" disabled={busy} onPress={remove}/>
      </>}
    </Sheet>
  </Screen>;
}
const s=StyleSheet.create({row:{flexDirection:'row',alignItems:'center',gap:10},name:{color:theme.text,fontWeight:'900',fontSize:16},state:{color:theme.primary,fontWeight:'800'},three:{flexDirection:'row',gap:10}});
