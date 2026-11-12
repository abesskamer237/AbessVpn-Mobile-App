import {Tabs} from 'expo-router';
import {theme} from '@/theme';

export default function TabsLayout(){
  return <Tabs screenOptions={{
    headerShown:false,
    tabBarStyle:{backgroundColor:theme.surface,borderTopColor:theme.border,height:64,paddingTop:6,paddingBottom:7},
    tabBarActiveTintColor:theme.primary,
    tabBarInactiveTintColor:theme.muted,
    tabBarLabelStyle:{fontWeight:'700',fontSize:11}
  }}>
    <Tabs.Screen name="index" options={{title:'Dashboard'}}/>
    <Tabs.Screen name="clients" options={{title:'Clients'}}/>
    <Tabs.Screen name="resellers" options={{title:'Revendeurs'}}/>
    <Tabs.Screen name="transactions" options={{title:'Transactions'}}/>
    <Tabs.Screen name="more" options={{title:'Plus'}}/>
    <Tabs.Screen name="servers" options={{href:null}}/>
    <Tabs.Screen name="security" options={{href:null}}/>
    <Tabs.Screen name="team" options={{href:null}}/>
  </Tabs>;
}
