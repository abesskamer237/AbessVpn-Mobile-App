import {useState} from 'react';
import {router} from 'expo-router';
import {ActivityIndicator,Pressable,SafeAreaView,StyleSheet,Text,TextInput,View} from 'react-native';
import {login} from '@/lib/api';
import {theme} from '@/theme';

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [code,setCode]=useState('');
  const [needCode,setNeedCode]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  async function submit(){
    setBusy(true);setError('');
    try{await login(email.trim(),password,needCode?code.trim():undefined);router.replace('/(tabs)');}
    catch(e){const m=e instanceof Error?e.message:'Connexion impossible';if(m.toLowerCase().includes('double authentification'))setNeedCode(true);setError(m);}
    finally{setBusy(false);}
  }
  return <SafeAreaView style={s.page}><View style={s.wrap}>
    <View style={s.brand}><Text style={s.logo}>ABESS</Text><Text style={s.sub}>PANEL MOBILE</Text></View>
    <Text style={s.title}>Connexion</Text><Text style={s.desc}>Utilise le même compte que sur ton panel web.</Text>
    <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={theme.muted} style={s.input} value={email} onChangeText={setEmail}/>
    <TextInput secureTextEntry placeholder="Mot de passe" placeholderTextColor={theme.muted} style={s.input} value={password} onChangeText={setPassword}/>
    {needCode&&<TextInput keyboardType="number-pad" placeholder="Code 2FA" placeholderTextColor={theme.muted} style={s.input} value={code} onChangeText={setCode}/>}
    {!!error&&<Text style={s.error}>{error}</Text>}
    <Pressable onPress={submit} disabled={busy} style={s.button}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.buttonText}>Se connecter</Text>}</Pressable>
  </View></SafeAreaView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,justifyContent:'center'},wrap:{padding:24,gap:14},brand:{marginBottom:20},logo:{color:theme.primary,fontSize:34,fontWeight:'900',letterSpacing:2},sub:{color:theme.muted,fontSize:12,letterSpacing:4},title:{color:theme.text,fontSize:28,fontWeight:'800'},desc:{color:theme.muted,lineHeight:20,marginBottom:10},input:{backgroundColor:theme.surface,borderColor:theme.border,borderWidth:1,borderRadius:14,paddingHorizontal:15,paddingVertical:14,color:theme.text},button:{backgroundColor:theme.primary,borderRadius:14,padding:15,alignItems:'center',marginTop:4},buttonText:{color:'#fff',fontWeight:'800'},error:{color:theme.danger}});
