import {useEffect,useState} from 'react';
import {router} from 'expo-router';
import {ActivityIndicator,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getSession,login,me,setSession} from '@/lib/api';
import {theme} from '@/theme';

export default function Login(){
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState('');
  const [needCode,setNeedCode]=useState(false),[busy,setBusy]=useState(false),[checking,setChecking]=useState(true),[error,setError]=useState('');

  useEffect(()=>{void(async()=>{
    try{if(await getSession()){await me();router.replace('/(tabs)');return;}}
    catch{await setSession(null);}
    finally{setChecking(false);}
  })();},[]);

  async function submit(){
    setBusy(true);setError('');
    try{await login(email.trim(),password,needCode?code.trim():undefined);router.replace('/(tabs)');}
    catch(e){const m=e instanceof Error?e.message:'Connexion impossible';if(/double authentification|code/i.test(m))setNeedCode(true);setError(m);}
    finally{setBusy(false);}
  }
  if(checking)return <SafeAreaView style={s.page}><ActivityIndicator color={theme.primary} size="large"/><Text style={s.loading}>Vérification de la session…</Text></SafeAreaView>;
  return <SafeAreaView style={s.page}><View style={s.wrap}>
    <View style={s.brand}><Text style={s.logo}>ABESS</Text><Text style={s.sub}>SSH-WSS CONTROL</Text></View>
    <Text style={s.title}>Bienvenue</Text><Text style={s.desc}>Connecte-toi avec le même compte que sur le panel web.</Text>
    <TextInput autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="Email" placeholderTextColor={theme.muted} style={s.input} value={email} onChangeText={setEmail}/>
    <TextInput secureTextEntry autoComplete="current-password" placeholder="Mot de passe" placeholderTextColor={theme.muted} style={s.input} value={password} onChangeText={setPassword}/>
    {needCode&&<TextInput keyboardType="number-pad" autoComplete="one-time-code" placeholder="Code 2FA" placeholderTextColor={theme.muted} style={s.input} value={code} onChangeText={setCode}/>}
    {!!error&&<Text style={s.error}>{error}</Text>}
    <Pressable onPress={()=>void submit()} disabled={busy||!email.trim()||!password} style={[s.button,busy&&{opacity:.6}]}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.buttonText}>Se connecter</Text>}</Pressable>
  </View></SafeAreaView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,justifyContent:'center',alignItems:'stretch'},wrap:{padding:24,gap:14},brand:{marginBottom:20},logo:{color:theme.primary,fontSize:36,fontWeight:'900',letterSpacing:2},sub:{color:theme.muted,fontSize:12,letterSpacing:3},title:{color:theme.text,fontSize:30,fontWeight:'900'},desc:{color:theme.muted,lineHeight:20,marginBottom:8},input:{backgroundColor:theme.surface,borderColor:theme.border,borderWidth:1,borderRadius:14,paddingHorizontal:15,paddingVertical:14,color:theme.text},button:{backgroundColor:theme.primary,borderRadius:14,padding:15,alignItems:'center',marginTop:4},buttonText:{color:'#fff',fontWeight:'900'},error:{color:theme.danger},loading:{color:theme.muted,textAlign:'center',marginTop:12}});
