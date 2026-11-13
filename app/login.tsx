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

  if(checking)return <SafeAreaView style={s.page}><View style={s.checkCard}><View style={s.mark}><Text style={s.markText}>A</Text></View><ActivityIndicator color={theme.primary}/><Text style={s.loading}>Sécurisation de la session…</Text></View></SafeAreaView>;

  return <SafeAreaView style={s.page}>
    <View style={s.glowOne}/><View style={s.glowTwo}/>
    <View style={s.wrap}>
      <View style={s.brandRow}><View style={s.mark}><Text style={s.markText}>A</Text></View><View><Text style={s.brand}>ABESS VPN</Text><Text style={s.brandSub}>CONTROL CENTER</Text></View></View>
      <View style={s.hero}><Text style={s.kicker}>ADMINISTRATION MOBILE</Text><Text style={s.title}>Pilote ton infrastructure depuis n’importe où.</Text><Text style={s.desc}>Clients SSH-WSS, revendeurs, serveurs et sécurité dans une interface mobile dédiée.</Text></View>
      <View style={s.panel}>
        <Text style={s.panelTitle}>Connexion sécurisée</Text>
        <Text style={s.panelSub}>Utilise les mêmes identifiants que sur le panel web.</Text>
        <View style={s.fieldWrap}><Text style={s.fieldLabel}>EMAIL</Text><TextInput autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="admin@exemple.com" placeholderTextColor={theme.muted2} selectionColor={theme.primary} style={s.input} value={email} onChangeText={setEmail}/></View>
        <View style={s.fieldWrap}><Text style={s.fieldLabel}>MOT DE PASSE</Text><TextInput secureTextEntry autoComplete="current-password" placeholder="••••••••••••••••" placeholderTextColor={theme.muted2} selectionColor={theme.primary} style={s.input} value={password} onChangeText={setPassword}/></View>
        {needCode&&<View style={s.fieldWrap}><Text style={s.fieldLabel}>CODE 2FA</Text><TextInput keyboardType="number-pad" autoComplete="one-time-code" placeholder="000000" maxLength={6} placeholderTextColor={theme.muted2} selectionColor={theme.primary} style={s.input} value={code} onChangeText={setCode}/></View>}
        {!!error&&<View style={s.errorBox}><Text style={s.error}>{error}</Text></View>}
        <Pressable onPress={()=>void submit()} disabled={busy||!email.trim()||!password} style={({pressed})=>[s.button,pressed&&{transform:[{scale:.985}]},(busy||!email.trim()||!password)&&{opacity:.45}]}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.buttonText}>Accéder au panel</Text>}</Pressable>
        <View style={s.secureRow}><View style={s.secureDot}/><Text style={s.secureText}>Session chiffrée · authentification par token sécurisé</Text></View>
      </View>
    </View>
  </SafeAreaView>;
}
const s=StyleSheet.create({
  page:{flex:1,backgroundColor:theme.bg,justifyContent:'center',overflow:'hidden'},wrap:{paddingHorizontal:14,paddingVertical:16,gap:14},
  glowOne:{position:'absolute',width:260,height:260,borderRadius:260,backgroundColor:'rgba(255,122,0,.075)',top:-100,right:-90},
  glowTwo:{position:'absolute',width:220,height:220,borderRadius:220,backgroundColor:'rgba(110,168,254,.04)',bottom:-100,left:-80},
  brandRow:{flexDirection:'row',alignItems:'center',gap:12},mark:{width:32,height:32,borderRadius:10,backgroundColor:theme.primary,alignItems:'center',justifyContent:'center'},
  markText:{color:'#fff',fontWeight:'900',fontSize:17},brand:{color:theme.text,fontWeight:'900',fontSize:12,letterSpacing:.25},brandSub:{color:theme.muted,fontSize:7,fontWeight:'800',letterSpacing:1.5,marginTop:2},
  hero:{gap:4},kicker:{color:theme.primary,fontWeight:'900',letterSpacing:1.8,fontSize:8},title:{color:theme.text,fontWeight:'900',fontSize:22,lineHeight:25,letterSpacing:-1},
  desc:{color:theme.muted,fontSize:11,lineHeight:15,maxWidth:520},panel:{backgroundColor:theme.surface,borderWidth:1,borderColor:theme.border,borderRadius:16,padding:11,gap:8},
  panelTitle:{color:theme.text,fontSize:14,fontWeight:'900'},panelSub:{color:theme.muted,fontSize:10,lineHeight:14,marginTop:-8,marginBottom:2},
  fieldWrap:{gap:4},fieldLabel:{color:theme.textSoft,fontSize:8,fontWeight:'900',letterSpacing:.8},input:{backgroundColor:theme.bgSoft,borderColor:theme.border,borderWidth:1,borderRadius:13,paddingHorizontal:10,paddingVertical:9,color:theme.text,fontSize:12},
  button:{marginTop:3,minHeight:36,borderRadius:10,backgroundColor:theme.primary,alignItems:'center',justifyContent:'center'},buttonText:{color:'#fff',fontWeight:'900',fontSize:11},
  secureRow:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,marginTop:1},secureDot:{width:5,height:5,borderRadius:99,backgroundColor:theme.success},secureText:{color:theme.muted,fontSize:8,fontWeight:'700'},
  errorBox:{backgroundColor:theme.dangerSoft,borderWidth:1,borderColor:'rgba(255,95,104,.24)',borderRadius:9,padding:7},error:{color:'#FF8A92',fontSize:10,fontWeight:'700'},
  checkCard:{alignSelf:'center',alignItems:'center',gap:8},loading:{color:theme.muted,fontSize:10}
});
