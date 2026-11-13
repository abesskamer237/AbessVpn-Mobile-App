import {useCallback,useEffect,useMemo,useState} from 'react';
import {Alert,FlatList,Pressable,RefreshControl,StyleSheet,Text,View} from 'react-native';
import {api,randomKey} from '@/lib/api';
import {accountStatus,bytesToGb,fmtDate,percent} from '@/lib/format';
import type {ClientConfig,Reseller,SshAccount,SshInventory,SshDevice} from '@/types';
import {Badge,Button,Card,ErrorText,Field,Label,Screen,Sheet,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

export default function Clients(){
  const [inventory,setInventory]=useState<SshInventory|null>(null);
  const [resellers,setResellers]=useState<Reseller[]>([]);
  const [refreshing,setRefreshing]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState<SshAccount|null>(null),[createOpen,setCreateOpen]=useState(false);
  const [label,setLabel]=useState(''),[username,setUsername]=useState('abv_'),[password,setPassword]=useState('');
  const [days,setDays]=useState('30'),[quota,setQuota]=useState('10'),[connections,setConnections]=useState('1'),[nodeId,setNodeId]=useState(''),[resellerId,setResellerId]=useState('');
  const [renewDays,setRenewDays]=useState('30'),[renewGb,setRenewGb]=useState('5'),[config,setConfig]=useState<ClientConfig|null>(null);
  const [devices,setDevices]=useState<SshDevice[]>([]),[devicesBusy,setDevicesBusy]=useState(false);

  const load=useCallback(async()=>{
    setError('');
    try{
      const [ssh,r]=await Promise.all([api<SshInventory>('/api/v1/admin/ssh'),api<Reseller[]>('/api/v1/admin/resellers')]);
      setInventory(ssh);setResellers(r);
      if(!nodeId){
        const best=(ssh.managedNodes||[]).find(n=>n.agentOnline);
        if(best)setNodeId(best.id);
      }
      if(selected){
        const updated=ssh.accounts.find(a=>a.id===selected.id)||null;setSelected(updated);
      }
    }catch(e){setError(e instanceof Error?e.message:'Chargement impossible');}
  },[nodeId,selected?.id]);

  useEffect(()=>{void load();},[]);
  const accounts=useMemo(()=>(inventory?.accounts||[]).filter(a=>a.managed&&(!search.trim()||[a.label,a.username,a.resellerName||''].join(' ').toLowerCase().includes(search.toLowerCase()))),[inventory,search]);

  async function create(){
    setBusy(true);setError('');
    try{
      await api('/api/v1/admin/ssh/managed',{method:'POST',body:JSON.stringify({
        nodeId,label:label.trim(),username:username.trim().toLowerCase(),password,
        days:Number(days),quotaGb:Number(quota),maxConnections:Number(connections),
        ...(resellerId?{resellerId}:{})
      })});
      setCreateOpen(false);setLabel('');setUsername('abv_');setPassword('');setDays('30');setQuota('10');setConnections('1');setResellerId('');
      await load();
    }catch(e){setError(e instanceof Error?e.message:'Création impossible');}
    finally{setBusy(false);}
  }
  async function toggle(a:SshAccount){
    setBusy(true);try{await api('/api/v1/admin/ssh/accounts/'+a.id,{method:'PATCH',body:JSON.stringify({enabled:!a.enabled})});await load();}
    catch(e){setError(e instanceof Error?e.message:'Modification impossible');}finally{setBusy(false);}
  }
  async function renew(){
    if(!selected)return;setBusy(true);setError('');
    try{await api('/api/v1/admin/ssh/accounts/'+selected.id+'/renew',{method:'POST',headers:{'Idempotency-Key':randomKey()},body:JSON.stringify({additionalGb:Number(renewGb),days:Number(renewDays)})});await load();}
    catch(e){setError(e instanceof Error?e.message:'Renouvellement impossible');}finally{setBusy(false);}
  }
  async function loadDevices(accountId:string){
    setDevicesBusy(true);setError('');
    try{setDevices(await api<SshDevice[]>('/api/v1/admin/ssh/accounts/'+accountId+'/devices'));}
    catch(e){setError(e instanceof Error?e.message:'Appareils indisponibles');}
    finally{setDevicesBusy(false);}
  }
  async function toggleDevice(device:SshDevice){
    if(!selected)return;setDevicesBusy(true);setError('');
    try{await api('/api/v1/admin/ssh/accounts/'+selected.id+'/devices/'+device.deviceKey,{method:'PUT',body:JSON.stringify({blocked:!device.blocked})});await loadDevices(selected.id);}
    catch(e){setError(e instanceof Error?e.message:'Modification appareil impossible');setDevicesBusy(false);}
  }
  async function showConfig(){
    if(!selected)return;setBusy(true);setError('');
    try{setConfig(await api<ClientConfig>('/api/v1/admin/ssh/accounts/'+selected.id+'/config',{method:'POST',body:JSON.stringify({transport:'wss'})}));}
    catch(e){setError(e instanceof Error?e.message:'Configuration indisponible');}finally{setBusy(false);}
  }
  function remove(){
    if(!selected)return;
    Alert.alert('Supprimer le client','Cette licence SSH-WSS sera supprimée définitivement.',[{text:'Annuler',style:'cancel'},{text:'Supprimer',style:'destructive',onPress:()=>void(async()=>{
      setBusy(true);try{await api('/api/v1/admin/ssh/accounts/'+selected.id,{method:'DELETE'});setSelected(null);await load();}catch(e){setError(e instanceof Error?e.message:'Suppression impossible');}finally{setBusy(false);}
    })()}]);
  }

  return <Screen scroll={false}>
    <View style={{padding:18,paddingBottom:8,gap:10}}>
      <Title sub="Création, quotas, sessions, renouvellements et accès SSH-WSS.">Clients</Title>
      <ErrorText value={error}/>
      <Field placeholder="Rechercher un client…" value={search} onChangeText={setSearch}/>
      <Button title="Nouveau client" onPress={()=>{setError('');setCreateOpen(true)}}/>
    </View>
    <FlatList style={{flex:1}} contentContainerStyle={{padding:18,paddingTop:4,gap:10,paddingBottom:40}} data={accounts} keyExtractor={x=>x.id}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.primary} onRefresh={()=>{setRefreshing(true);void load().finally(()=>setRefreshing(false))}}/>}
      ListEmptyComponent={<Card><Text style={ui.muted}>Aucun client SSH-WSS.</Text></Card>}
      renderItem={({item})=>{const st=accountStatus(item),p=percent(item.usedBytes,item.quotaBytes);return <Pressable onPress={()=>{setSelected(item);setConfig(null);setDevices([]);void loadDevices(item.id)}}><Card>
        <View style={s.row}><View style={{flex:1}}><Text style={s.name}>{item.label}</Text><Text style={ui.muted}>{item.username}</Text></View><Badge text={st.label}/></View>
        <Text style={ui.muted}>{bytesToGb(item.usedBytes)} / {bytesToGb(item.quotaBytes)} Go · {p}%</Text>
        <View style={s.bar}><View style={[s.fill,{width:(p+'%') as any}]}/></View>
        <Text style={ui.muted}>{item.online??'—'} / {item.maxConnections} session(s) · Exp. {fmtDate(item.expiresAt)}</Text>
        <Text style={ui.muted}>Revendeur : {item.resellerName||'Administration'}</Text>
      </Card></Pressable>}}
    />

    <Sheet visible={createOpen} onClose={()=>setCreateOpen(false)} title="Nouveau client SSH-WSS">
      <Label>Nom du client</Label><Field value={label} onChangeText={setLabel} placeholder="Jean Dupont"/>
      <Label>Nom d’utilisateur SSH</Label><Field autoCapitalize="none" value={username} onChangeText={v=>setUsername(v.toLowerCase())} placeholder="abv_jean237"/>
      <Label>Mot de passe SSH</Label><Field secureTextEntry value={password} onChangeText={setPassword} placeholder="8 caractères minimum"/>
      <Label>Serveur</Label>
      {(inventory?.managedNodes||[]).map(n=><Pressable key={n.id} onPress={()=>setNodeId(n.id)}><Card><Text style={s.name}>{nodeId===n.id?'● ':'○ '}{n.name}</Text><Text style={ui.muted}>{n.agentOnline?'Agent en ligne':'Hors ligne'}</Text></Card></Pressable>)}
      <View style={s.two}><View style={{flex:1,gap:6}}><Label>Durée (jours)</Label><Field keyboardType="number-pad" value={days} onChangeText={setDays}/></View><View style={{flex:1,gap:6}}><Label>Quota (Go)</Label><Field keyboardType="decimal-pad" value={quota} onChangeText={setQuota}/></View></View>
      <Label>Sessions simultanées</Label><Field keyboardType="number-pad" value={connections} onChangeText={setConnections}/>
      {!!resellers.length&&<><Label>Revendeur propriétaire</Label><Pressable onPress={()=>setResellerId('')}><Card><Text style={s.name}>{!resellerId?'●':'○'} Administration</Text></Card></Pressable>{resellers.filter(r=>r.status==='active').map(r=><Pressable key={r.id} onPress={()=>setResellerId(r.id)}><Card><Text style={s.name}>{resellerId===r.id?'● ':'○ '}{r.name}</Text><Text style={ui.muted}>{r.credits} Go</Text></Card></Pressable>)}</>}
      <Button title={busy?'Création…':'Créer le client'} disabled={busy||!label.trim()||!/^abv_[a-z0-9][a-z0-9_-]{2,27}$/.test(username)||password.length<8||!nodeId} onPress={()=>void create()}/>
    </Sheet>

    <Sheet visible={!!selected} onClose={()=>setSelected(null)} title={selected?.label||'Client'}>
      {selected&&<>
        <Card><Text style={s.name}>{selected.username}</Text><Text style={ui.muted}>{accountStatus(selected).label} · {selected.resellerName||'Administration'}</Text><Text style={ui.muted}>Expiration : {fmtDate(selected.expiresAt)}</Text><Text style={ui.muted}>Quota : {bytesToGb(selected.usedBytes)} / {bytesToGb(selected.quotaBytes)} Go</Text></Card>
        <Button title={selected.enabled?'Suspendre':'Réactiver'} kind="secondary" disabled={busy} onPress={()=>void toggle(selected)}/>
        <Label>Renouvellement</Label><View style={s.two}><View style={{flex:1,gap:6}}><Label>Go +</Label><Field keyboardType="decimal-pad" value={renewGb} onChangeText={setRenewGb}/></View><View style={{flex:1,gap:6}}><Label>Jours +</Label><Field keyboardType="number-pad" value={renewDays} onChangeText={setRenewDays}/></View></View>
        <Button title="Renouveler" disabled={busy} onPress={()=>void renew()}/>
        <Button title="Afficher la configuration SSH-WSS" kind="secondary" disabled={busy||!selected.effectiveEnabled} onPress={()=>void showConfig()}/>
        <Label>Appareils connectés</Label>
        <Card><Text style={s.name}>{devices.filter(d=>(d.activeSessions||0)>0).length} appareil(s) actuellement actif(s)</Text><Text style={ui.muted}>{devices.length} appareil(s) détecté(s) pour cette licence</Text></Card>
        {devicesBusy&&<Text style={ui.muted}>Synchronisation des appareils…</Text>}
        {devices.map(device=><Card key={device.deviceKey}>
          <View style={s.row}><View style={{flex:1}}><Text style={s.name}>{device.name||device.brand||'Appareil inconnu'}</Text><Text style={ui.muted}>{device.brand&&device.name?device.brand+' · ':''}{device.ip||'IP indisponible'}</Text></View><Badge text={device.blocked?'Suspendu':(device.activeSessions||0)>0?'Connecté':'Hors ligne'}/></View>
          <Text style={ui.muted}>Consommation : {bytesToGb(device.usedBytes)} Go · ↑ {bytesToGb(device.upBytes)} Go · ↓ {bytesToGb(device.downBytes)} Go</Text>
          <Text style={ui.muted}>Sessions : {device.activeSessions||0} · Dernière activité : {device.lastSeenAt?new Date(device.lastSeenAt).toLocaleString('fr-FR'):'—'}</Text>
          {!!device.userAgent&&<Text numberOfLines={2} style={ui.muted}>Client : {device.userAgent}</Text>}
          <Button title={device.blocked?'Réautoriser cet appareil':'Suspendre cet appareil'} kind={device.blocked?'secondary':'danger'} disabled={devicesBusy} onPress={()=>void toggleDevice(device)}/>
        </Card>)}
        {config&&<Card><Text style={s.name}>Configuration client</Text><Text style={ui.muted}>Serveur : {config.host}:{config.port}</Text><Text style={ui.muted}>SNI : {config.sni}</Text><Text selectable style={ui.muted}>Utilisateur : {config.username}</Text><Text selectable style={ui.muted}>Mot de passe : {config.password}</Text><Text selectable style={ui.muted}>Chemin : {config.path}</Text>{!!config.payload&&<><Text style={s.name}>Payload WillyVPN / HTTP Custom</Text><Text selectable style={ui.muted}>{config.payload}</Text></>}<Text selectable style={ui.muted}>Empreinte : {config.fingerprint}</Text></Card>}
        <Button title="Supprimer définitivement" kind="danger" disabled={busy} onPress={remove}/>
      </>}
    </Sheet>
  </Screen>;
}
const s=StyleSheet.create({row:{flexDirection:'row',alignItems:'center',gap:10},name:{color:theme.text,fontWeight:'900',fontSize:16},bar:{height:6,borderRadius:99,backgroundColor:theme.surface2,overflow:'hidden'},fill:{height:'100%',backgroundColor:theme.primary},two:{flexDirection:'row',gap:10}});
