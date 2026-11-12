import {Tabs} from 'expo-router';
import {theme} from '@/theme';
export default function TabsLayout(){
  return <Tabs screenOptions={{headerStyle:{backgroundColor:theme.bg},headerTintColor:theme.text,tabBarStyle:{backgroundColor:theme.surface,borderTopColor:theme.border},tabBarActiveTintColor:theme.primary,tabBarInactiveTintColor:theme.muted}}>
    <Tabs.Screen name="index" options={{title:'Dashboard'}}/><Tabs.Screen name="clients" options={{title:'Clients'}}/><Tabs.Screen name="resellers" options={{title:'Revendeurs'}}/><Tabs.Screen name="servers" options={{title:'Serveurs'}}/>
  </Tabs>;
}
