import {useCallback,useEffect,useState} from 'react';
import {Alert,FlatList,Pressable,StyleSheet,Text,View} from 'react-native';
import {api} from '@/lib/api';
import {fmtDateTime} from '@/lib/format';
import type {ManagedNode,OpsHealth} from '@/types';
import {Button,Card,ErrorText,Field,Label,Screen,Sheet,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

export default function Servers(){
  const [nodes,setNodes]=useState<ManagedNode[]>([]),[ops,setOps]=useState<OpsHealth|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [add,setAdd]=useState(false),[configure,setConfigure]=useState<ManagedNode|null>(null),[created,setCreated]=useState<{id:string;key:string}|null>(null);
  const [name,setName]=useState(''),[host,setHost]=useState(''),[fingerprint,setFingerprint]=useState(''),[sni,setSni]=useState(''),[port,setPort]=useState('443'),[wsPath,setWsPath]=useState('/ssh-ws');
  const [lastKey,setLastKey]=useState('');

  const load=useCallback(async()=>{setError('');try{const [n,o]=await Promise.all([api<ManagedNode[]>('/api/v1/admin/nodes'),api<OpsHealth>('/api/v1/admin/operations')]);setNodes(n);setOps(o);}catch(e){setError(e instanceof Error?e.message:'Chargement impossible');}},[]);
  useEffect(()=>{void load();},[]);
  async function create(){setBusy(true);setError('');try{const x=await api<{id:string;key:string}>('/api/v1/admin/nodes',{method:'POST',body:JSON.stringify({name,host})});setCreated(x);setName('');setHost('');await load();}catch(e){setError(e instanceof Error?e.message:'Création impossible');}finally{setBusy(false);}}
  async function activate(){if(!configure)return;setBusy(true);setError('');try{await api('/api/v1/admin/nodes/'+configure.id+'/ssh-ws',{method:'PUT',body:JSON.stringify({enabled:true,fingerprint,sni:sni||configure.host,port:Number(port),path:wsPath})});setConfigure(null);setFingerprint('');setSni('');setPort('443');setWsPath('/ssh-ws');await load();}catch(e){setError(e instanceof Error?e.message:'Activation impossible');}finally{setBusy(false);}}
  async function rotate(n:ManagedNode){setBusy(true);try{const x=await api<{id:string;key:string}>('/api/v1/admin/nodes/'+n.id+'/key',{method:'POST'});setLastKey(x.key);}catch(e){setError(e instanceof Error?e.message:'Rotation impossible');}finally{setBusy(false);}}
  function disable(n:ManagedNode){Alert.alert('Désactiver le nœud',n.name,[{text:'Annuler'},{text:'Désactiver',style:'destructive',onPress:()=>void(async()=>{setBusy(true);try{await api('/api/v1/admin/nodes/'+n.id,{method:'DELETE'});await load();}catch(e){setError(e instanceof Error?e.message:'Désactivation impossible');}finally{setBusy(false);}})()}]);}

  return <Screen scroll={false}>
    <View style={{padding:18,paddingBottom:8,gap:10}}><Title sub="VPS, agents SSH-WSS et télémétrie système.">Serveurs</Title><ErrorText value={error}/><View style={s.summary}><Card><Text style={s.kpi}>{nodes.length}</Text><Text style={ui.muted}>VPS</Text></Card><Card><Text style={s.kpi}>{nodes.filter(n=>n.sshWsAgentSeenAt&&Date.now()-Date.parse(n.sshWsAgentSeenAt)<60000).length}</Text><Text style={ui.muted}>Agents en ligne</Text></Card></View><Button title="Ajouter un VPS" onPress={()=>{setCreated(null);setAdd(true)}}/></View>
    <FlatList data={nodes} keyExtractor={x=>x.id} contentContainerStyle={{padding:18,paddingTop:4,gap:10,paddingBottom:40}} ListHeaderComponent={ops?<Card><Text style={s.name}>Contrôle : {ops.ok?'Sain':'Attention'}</Text><Text style={ui.muted}>{ops.storage||'—'} · Uptime {ops.uptimeSeconds||0}s</Text>{(ops.alerts||[]).map(a=><Text key={a} style={s.warn}>• {a}</Text>)}</Card>:null}
      renderItem={({item})=>{const t=item.sshWsHost;const online=Boolean(item.sshWsAgentSeenAt&&Date.now()-Date.parse(item.sshWsAgentSeenAt)<60000);return <Card><View style={s.row}><View style={{flex:1}}><Text style={s.name}>{item.name}</Text><Text style={ui.muted}>{item.sshWsSni||item.host}:{item.sshWsPort||443}{item.sshWsPath||'/ssh-ws'}</Text></View><Text style={online?s.good:s.warn}>{item.sshWsManaged?(online?'En ligne':'Hors ligne'):'À configurer'}</Text></View>{t&&<><Text style={ui.muted}>CPU {t.cpuPercent.toFixed(1)}% · RAM {Math.round((t.totalMemoryBytes-t.freeMemoryBytes)/t.totalMemoryBytes*100)}% · Disque {Math.round((t.diskTotalBytes-t.diskFreeBytes)/t.diskTotalBytes*100)}%</Text><Text style={ui.muted}>SSHD {t.services.sshd?'✓':'✕'} · Gateway {t.services.gateway?'✓':'✕'} · Agent {t.services.reconciler?'✓':'✕'}</Text><Text style={ui.muted}>Vu : {fmtDateTime(t.observedAt)}</Text></>}<View style={s.actions}>{!item.sshWsManaged&&<Pressable onPress={()=>{setConfigure(item);setSni(item.host)}}><Text style={s.link}>Activer SSH-WSS</Text></Pressable>}<Pressable onPress={()=>void rotate(item)}><Text style={s.link}>Nouvelle clé agent</Text></Pressable><Pressable onPress={()=>disable(item)}><Text style={s.danger}>Désactiver</Text></Pressable></View></Card>}}
    />
    {!!lastKey&&<Sheet visible={!!lastKey} onClose={()=>setLastKey('')} title="Nouvelle clé agent"><Text style={ui.muted}>Copie cette clé maintenant : elle ne sera plus affichée.</Text><Text selectable style={s.secret}>{lastKey}</Text><Button title="J’ai enregistré la clé" onPress={()=>setLastKey('')}/></Sheet>}
    <Sheet visible={add} onClose={()=>setAdd(false)} title="Ajouter un VPS">
      {!created?<><Label>Nom du serveur</Label><Field value={name} onChangeText={setName} placeholder="VPS France 02"/><Label>IP ou DNS</Label><Field autoCapitalize="none" value={host} onChangeText={setHost} placeholder="203.0.113.10"/><Button title="Enregistrer le VPS" disabled={busy||!name||!host} onPress={()=>void create()}/></>:<><Text style={ui.muted}>Le nœud est créé. Enregistre sa clé agent maintenant.</Text><Text selectable style={s.secret}>{created.key}</Text><Button title="Terminer" onPress={()=>setAdd(false)}/></>}
    </Sheet>
    <Sheet visible={!!configure} onClose={()=>setConfigure(null)} title={'Activer SSH-WSS · '+(configure?.name||'')}>
      <Label>Empreinte Ed25519 SHA-256</Label><Field autoCapitalize="none" value={fingerprint} onChangeText={setFingerprint} placeholder="SHA256:…"/>
      <Label>SNI / domaine HTTPS</Label><Field autoCapitalize="none" value={sni} onChangeText={setSni}/>
      <View style={s.two}><View style={{flex:1,gap:6}}><Label>Port WSS</Label><Field keyboardType="number-pad" value={port} onChangeText={setPort}/></View><View style={{flex:1,gap:6}}><Label>Chemin</Label><Field value={wsPath} onChangeText={setWsPath}/></View></View>
      <Button title="Activer le nœud" disabled={busy||!fingerprint||!sni} onPress={()=>void activate()}/>
    </Sheet>
  </Screen>;
}
const s=StyleSheet.create({summary:{gap:10},kpi:{color:theme.text,fontSize:24,fontWeight:'900'},row:{flexDirection:'row',gap:10},name:{color:theme.text,fontWeight:'900'},good:{color:'#4FD18B',fontWeight:'800'},warn:{color:'#FFB454',fontWeight:'800'},actions:{flexDirection:'row',flexWrap:'wrap',gap:16,marginTop:6},link:{color:theme.primary,fontWeight:'800'},danger:{color:theme.danger,fontWeight:'800'},secret:{color:theme.primary,fontFamily:'monospace',fontSize:14},two:{flexDirection:'row',gap:10}});
