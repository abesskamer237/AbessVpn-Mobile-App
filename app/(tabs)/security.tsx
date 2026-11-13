import {useCallback,useEffect,useState} from 'react';
import {Alert,Pressable,StyleSheet,Text,View} from 'react-native';
import {router} from 'expo-router';
import {api,logout} from '@/lib/api';
import {fmtDateTime} from '@/lib/format';
import type {SecurityStatus} from '@/types';
import {Button,Card,ErrorText,Field,Label,Screen,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

export default function Security(){
  const [status,setStatus]=useState<SecurityStatus|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [password,setPassword]=useState(''),[code,setCode]=useState(''),[newPassword,setNewPassword]=useState('');
  const [setup,setSetup]=useState<{secret:string;uri:string}|null>(null),[recovery,setRecovery]=useState<string[]>([]);
  const load=useCallback(async()=>{setError('');try{setStatus(await api<SecurityStatus>('/api/v1/auth/security'));}catch(e){setError(e instanceof Error?e.message:'Chargement impossible');}},[]);
  useEffect(()=>{void load();},[]);
  async function run(work:()=>Promise<void>){setBusy(true);setError('');try{await work();}catch(e){setError(e instanceof Error?e.message:'Opération impossible');}finally{setBusy(false);}}
  async function relogin(){await logout().catch(()=>{});router.replace('/login');}
  return <Screen><Title sub="Double authentification, mot de passe et appareils connectés.">Sécurité</Title><ErrorText value={error}/>
    <Card><Text style={s.name}>Double authentification</Text><Text style={ui.muted}>{status?.mfaEnabled?'Activée':'Désactivée'}{status?.mfaRequired?' · obligatoire':''}</Text>
      {!status?.mfaEnabled&&!setup&&<><Label>Mot de passe actuel</Label><Field secureTextEntry value={password} onChangeText={setPassword}/><Button title="Configurer la 2FA" disabled={busy||!password} onPress={()=>void run(async()=>{setSetup(await api('/api/v1/auth/mfa/setup',{method:'POST',body:JSON.stringify({password})}));})}/></>}
      {setup&&<><Text style={ui.muted}>Ajoute ce secret dans ton application d’authentification :</Text><Text selectable style={s.secret}>{setup.secret}</Text><Text selectable style={ui.muted}>{setup.uri}</Text><Label>Code à 6 chiffres</Label><Field keyboardType="number-pad" value={code} onChangeText={setCode}/><Button title="Activer la 2FA" disabled={busy||code.length!==6} onPress={()=>void run(async()=>{const r=await api<{recoveryCodes:string[]}>('/api/v1/auth/mfa/enable',{method:'POST',body:JSON.stringify({code})});setRecovery(r.recoveryCodes);setSetup(null);setCode('');await load();})}/></>}
      {status?.mfaEnabled&&<><Label>Mot de passe actuel</Label><Field secureTextEntry value={password} onChangeText={setPassword}/><Label>Code 2FA</Label><Field keyboardType="number-pad" value={code} onChangeText={setCode}/><Button kind="danger" title="Désactiver la 2FA" disabled={busy||!password||!code} onPress={()=>void run(async()=>{await api('/api/v1/auth/mfa/disable',{method:'POST',body:JSON.stringify({password,code})});await relogin();})}/></>}
      {!!recovery.length&&<Card><Text style={s.name}>Codes de récupération — à enregistrer maintenant</Text>{recovery.map(x=><Text selectable key={x} style={s.secret}>{x}</Text>)}</Card>}
    </Card>
    <Card><Text style={s.name}>Changer le mot de passe</Text><Label>Mot de passe actuel</Label><Field secureTextEntry value={password} onChangeText={setPassword}/>{status?.mfaEnabled&&<><Label>Code 2FA</Label><Field keyboardType="number-pad" value={code} onChangeText={setCode}/></>}<Label>Nouveau mot de passe</Label><Field secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="16 caractères minimum"/><Button title="Modifier et reconnecter" disabled={busy||!password||newPassword.length<16} onPress={()=>void run(async()=>{await api('/api/v1/auth/password',{method:'POST',body:JSON.stringify({password,code,newPassword})});await relogin();})}/></Card>
    <Card><Text style={s.name}>Sessions actives</Text>{status?.sessions?.map(session=><View key={session.id} style={s.session}><View style={{flex:1}}><Text style={s.name}>{session.current?'Cette session':session.agent||'Appareil'}</Text><Text style={ui.muted}>{session.ip||'IP inconnue'} · {fmtDateTime(session.createdAt)}</Text></View><Pressable onPress={()=>Alert.alert('Révoquer la session','Confirmer ?', [{text:'Annuler'},{text:'Révoquer',style:'destructive',onPress:()=>void run(async()=>{await api('/api/v1/auth/sessions/'+session.id,{method:'DELETE'});if(session.current)await relogin();else await load();})}])}><Text style={s.revoke}>Révoquer</Text></Pressable></View>)}</Card>
  </Screen>;
}
const s=StyleSheet.create({name:{color:theme.text,fontWeight:'900',fontSize:9},secret:{color:theme.primary,fontFamily:'monospace'},session:{flexDirection:'row',gap:6,borderTopWidth:1,borderTopColor:theme.border,paddingTop:6},revoke:{color:theme.danger,fontWeight:'800'}});
