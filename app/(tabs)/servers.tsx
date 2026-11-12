import {SafeAreaView,StyleSheet,Text,View} from 'react-native';
import {theme} from '@/theme';
export default function Servers(){return <SafeAreaView style={s.page}><Text style={s.title}>Serveurs</Text><View style={s.card}><Text style={s.name}>Infrastructure SSH-WSS</Text><Text style={s.meta}>Supervision et gestion des nœuds du panel.</Text></View></SafeAreaView>;}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:20},title:{color:theme.text,fontSize:28,fontWeight:'800',marginBottom:14},card:{backgroundColor:theme.surface,borderRadius:16,padding:15,borderWidth:1,borderColor:theme.border},name:{color:theme.text,fontWeight:'800'},meta:{color:theme.muted,marginTop:6}});
