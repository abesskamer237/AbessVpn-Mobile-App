import {router} from 'expo-router';
import {useEffect,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {logout,me} from '@/lib/api';
import type {ApiUser} from '@/types';
import {Card,Screen,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

const Item=({title,sub,onPress}:{title:string;sub:string;onPress:()=>void})=><Pressable onPress={onPress}><Card><Text style={s.name}>{title}</Text><Text style={ui.muted}>{sub}</Text></Card></Pressable>;
export default function More(){
  const [user,setUser]=useState<ApiUser|null>(null);useEffect(()=>{me().then(setUser).catch(()=>{})},[]);
  async function signOut(){await logout();router.replace('/login');}
  return <Screen><Title sub={user?user.name+' · '+user.email:'Administration mobile'}>Plus</Title>
    {user?.role==='SUPER_ADMIN'&&<Item title="Serveurs" sub="VPS, agents SSH-WSS, télémétrie et clés." onPress={()=>router.push('/(tabs)/servers')}/>}
    <Item title="Sécurité" sub="MFA, mot de passe et sessions actives." onPress={()=>router.push('/(tabs)/security')}/>
    {user?.role==='SUPER_ADMIN'&&<Item title="Équipe" sub="Administrateurs et statuts." onPress={()=>router.push('/(tabs)/team')}/>}
    <Card><Text style={s.name}>Compte</Text><Text style={ui.muted}>{user?.role||'—'}{user?.role==='RESELLER'?' · '+Number(user.credits||0).toFixed(2)+' Go':''}</Text><Pressable style={s.logout} onPress={()=>void signOut()}><Text style={s.logoutText}>Se déconnecter</Text></Pressable></Card>
  </Screen>;
}
const s=StyleSheet.create({name:{color:theme.text,fontSize:16,fontWeight:'900'},logout:{marginTop:8,padding:12,borderRadius:12,backgroundColor:theme.danger,alignItems:'center'},logoutText:{color:'#fff',fontWeight:'900'}});
