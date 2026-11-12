import type {ReactNode} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,TextInput,View,type TextInputProps} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '@/theme';

export function Screen({children,scroll=true}:{children:ReactNode;scroll?:boolean}){
  const body=<View style={s.body}>{children}</View>;
  return <SafeAreaView style={s.safe} edges={['top','left','right']}>{scroll?<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.scroll}>{body}</ScrollView>:body}</SafeAreaView>;
}
export function Title({children,sub}:{children:ReactNode;sub?:string}){return <View style={{gap:4,marginBottom:8}}><Text style={s.title}>{children}</Text>{sub&&<Text style={s.muted}>{sub}</Text>}</View>}
export function Card({children}:{children:ReactNode}){return <View style={s.card}>{children}</View>}
export function Field(props:TextInputProps){return <TextInput placeholderTextColor={theme.muted} {...props} style={[s.field,props.style]}/>}
export function Label({children}:{children:ReactNode}){return <Text style={s.label}>{children}</Text>}
export function Button({title,onPress,disabled=false,kind='primary'}:{title:string;onPress:()=>void;disabled?:boolean;kind?:'primary'|'secondary'|'danger'}){
  return <Pressable disabled={disabled} onPress={onPress} style={[s.button,kind==='secondary'&&s.secondary,kind==='danger'&&s.danger,disabled&&{opacity:.5}]}><Text style={s.buttonText}>{title}</Text></Pressable>;
}
export function ErrorText({value}:{value:string}){return value?<Text style={s.error}>{value}</Text>:null}
export function Badge({text}:{text:string}){return <View style={s.badge}><Text style={s.badgeText}>{text}</Text></View>}
export function Sheet({visible,onClose,title,children}:{visible:boolean;onClose:()=>void;title:string;children:ReactNode}){
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={s.backdrop}><View style={s.sheet}><View style={s.sheetHead}><Text style={s.sheetTitle}>{title}</Text><Pressable onPress={onClose}><Text style={s.close}>Fermer</Text></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{gap:12,paddingBottom:32}}>{children}</ScrollView></View></View></Modal>
}
export const ui=s;
const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:theme.bg},scroll:{paddingBottom:28},body:{padding:18,gap:12},
  title:{fontSize:28,fontWeight:'900',color:theme.text},muted:{color:theme.muted,lineHeight:20},
  card:{backgroundColor:theme.surface,borderWidth:1,borderColor:theme.border,borderRadius:18,padding:15,gap:8},
  field:{backgroundColor:theme.surface2,borderWidth:1,borderColor:theme.border,borderRadius:13,paddingHorizontal:13,paddingVertical:12,color:theme.text},
  label:{color:theme.text,fontWeight:'700',fontSize:13},
  button:{backgroundColor:theme.primary,borderRadius:13,paddingVertical:13,paddingHorizontal:15,alignItems:'center'},
  secondary:{backgroundColor:theme.surface2,borderWidth:1,borderColor:theme.border},
  danger:{backgroundColor:theme.danger},buttonText:{color:'#fff',fontWeight:'800'},
  error:{color:theme.danger,lineHeight:19},badge:{alignSelf:'flex-start',backgroundColor:theme.surface2,borderRadius:99,paddingHorizontal:9,paddingVertical:5},
  badgeText:{color:theme.text,fontSize:12,fontWeight:'700'},backdrop:{flex:1,backgroundColor:'rgba(0,0,0,.62)',justifyContent:'flex-end'},
  sheet:{maxHeight:'90%',backgroundColor:theme.bg,borderTopLeftRadius:24,borderTopRightRadius:24,padding:18,borderWidth:1,borderColor:theme.border},
  sheetHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},sheetTitle:{color:theme.text,fontSize:20,fontWeight:'900'},close:{color:theme.primary,fontWeight:'800'}
});
