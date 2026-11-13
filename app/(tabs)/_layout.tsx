import {Tabs} from 'expo-router';
import {StyleSheet,Text,View} from 'react-native';
import {theme} from '@/theme';

function MiniIcon({label,focused}:{label:string;focused:boolean}){return <View style={[s.icon,focused&&s.iconActive]}><Text style={[s.iconText,focused&&s.iconTextActive]}>{label}</Text></View>}
export default function TabsLayout(){
  return <Tabs screenOptions={{
    headerShown:false,
    tabBarStyle:{position:'absolute',backgroundColor:'#0E1219',borderTopColor:theme.border,height:54,paddingTop:4,paddingBottom:5},
    tabBarActiveTintColor:theme.text,
    tabBarInactiveTintColor:theme.muted,
    tabBarLabelStyle:{fontWeight:'800',fontSize:8,marginTop:0},
    tabBarHideOnKeyboard:true
  }}>
    <Tabs.Screen name="index" options={{title:'Accueil',tabBarIcon:({focused})=><MiniIcon label="D" focused={focused}/>}}/>
    <Tabs.Screen name="clients" options={{title:'Clients',tabBarIcon:({focused})=><MiniIcon label="C" focused={focused}/>}}/>
    <Tabs.Screen name="resellers" options={{title:'Revendeurs',tabBarIcon:({focused})=><MiniIcon label="R" focused={focused}/>}}/>
    <Tabs.Screen name="transactions" options={{title:'Activité',tabBarIcon:({focused})=><MiniIcon label="T" focused={focused}/>}}/>
    <Tabs.Screen name="more" options={{title:'Plus',tabBarIcon:({focused})=><MiniIcon label="•••" focused={focused}/>}}/>
    <Tabs.Screen name="servers" options={{href:null}}/>
    <Tabs.Screen name="security" options={{href:null}}/>
    <Tabs.Screen name="team" options={{href:null}}/>
  </Tabs>;
}
const s=StyleSheet.create({icon:{width:21,height:21,borderRadius:7,alignItems:'center',justifyContent:'center',backgroundColor:theme.surface2,borderWidth:1,borderColor:theme.border},iconActive:{backgroundColor:theme.primarySoft,borderColor:theme.primaryBorder},iconText:{fontSize:8,color:theme.muted,fontWeight:'900'},iconTextActive:{color:theme.primary}});
