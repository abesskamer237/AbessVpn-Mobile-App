import {router} from 'expo-router';
import {useEffect,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {logout,me} from '@/lib/api';
import type {ApiUser} from '@/types';
import {Badge,Card,Screen,SectionTitle,Title,ui} from '@/components/ui';
import {theme} from '@/theme';

const Item=({code,title,sub,onPress}:{code:string;title:string;sub:string;onPress:()=>void})=><Pressable onPress={onPress} style={({pressed})=>pressed&&{opacity:.75}}><Card><View style={s.item}><View style={s.icon}><Text style={s.iconText}>{code}</Text></View><View style={{flex:1}}><Text style={s.name}>{title}</Text><Text style={ui.muted}>{sub}</Text></View><Text style={s.chevron}>›</Text></View></Card></Pressable>;
export default function More(){
  const [user,setUser]=useState<ApiUser|null>(null);useEffect(()=>{me().then(setUser).catch(()=>{})},[]);
  async function signOut(){await logout();router.replace('/login');}
  return <Screen>
    <Title eyebrow="PARAMÈTRES" sub="Administration, sécurité et compte">Centre de contrôle</Title>
    <Card accent><View style={s.profile}><View style={s.avatar}><Text style={s.avatarText}>{(user?.name||'A').slice(0,1).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={s.profileName}>{user?.name||'Compte ABESS'}</Text><Text style={ui.muted}>{user?.email||'Synchronisation…'}</Text></View><Badge text={user?.role||'—'} tone="info"/></View>{user?.role==='RESELLER'&&<Text style={s.credit}>{Number(user.credits||0).toFixed(2)} Go disponibles</Text>}</Card>
    <SectionTitle>Administration</SectionTitle>
    {user?.role==='SUPER_ADMIN'&&<Item code="SV" title="Serveurs & VPS" sub="Agents SSH-WSS, télémétrie, clés et disponibilité." onPress={()=>router.push('/(tabs)/servers')}/>}
    <Item code="SC" title="Sécurité" sub="2FA, mot de passe et gestion des sessions actives." onPress={()=>router.push('/(tabs)/security')}/>
    {user?.role==='SUPER_ADMIN'&&<Item code="EQ" title="Équipe" sub="Administrateurs, permissions et statuts des comptes." onPress={()=>router.push('/(tabs)/team')}/>}
    <SectionTitle>Session</SectionTitle>
    <Pressable style={({pressed})=>[s.logout,pressed&&{opacity:.8}]} onPress={()=>void signOut()}><View><Text style={s.logoutTitle}>Se déconnecter</Text><Text style={s.logoutSub}>Fermer la session sur cet appareil</Text></View><Text style={s.logoutArrow}>↗</Text></Pressable>
    <Text style={s.version}>ABESS VPN Mobile · v0.3</Text><View style={{height:56}}/>
  </Screen>;
}
const s=StyleSheet.create({
  item:{flexDirection:'row',alignItems:'center',gap:12},icon:{width:28,height:28,borderRadius:9,backgroundColor:theme.primarySoft,borderWidth:1,borderColor:theme.primaryBorder,alignItems:'center',justifyContent:'center'},
  iconText:{color:theme.primary,fontSize:10,fontWeight:'900',letterSpacing:.5},name:{color:theme.text,fontSize:9,fontWeight:'900'},chevron:{color:theme.muted,fontSize:18,fontWeight:'300'},
  profile:{flexDirection:'row',alignItems:'center',gap:12},avatar:{width:34,height:34,borderRadius:11,backgroundColor:theme.primary,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontWeight:'900',fontSize:15},
  profileName:{color:theme.text,fontWeight:'900',fontSize:9},credit:{color:theme.primary,fontWeight:'900',fontSize:10,marginTop:4},
  logout:{borderWidth:1,borderColor:'rgba(255,95,104,.22)',backgroundColor:theme.dangerSoft,borderRadius:12,padding:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  logoutTitle:{color:theme.danger,fontSize:9,fontWeight:'900'},logoutSub:{color:theme.muted,fontSize:9,marginTop:3},logoutArrow:{color:theme.danger,fontSize:14,fontWeight:'900'},version:{color:theme.muted2,fontSize:10,textAlign:'center',marginTop:5}
});
