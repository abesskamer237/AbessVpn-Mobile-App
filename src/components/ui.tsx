import type {ReactNode} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,TextInput,View,type TextInputProps} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '@/theme';

export function Screen({children,scroll=true}:{children:ReactNode;scroll?:boolean}){
  const body=<View style={s.body}>{children}</View>;
  return <SafeAreaView style={s.safe} edges={['top','left','right']}>{scroll?<ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>{body}</ScrollView>:body}</SafeAreaView>;
}
export function Title({children,sub,eyebrow}:{children:ReactNode;sub?:string;eyebrow?:string}){
  return <View style={s.titleWrap}>{eyebrow&&<Text style={s.eyebrow}>{eyebrow}</Text>}<Text style={s.title}>{children}</Text>{sub&&<Text style={s.muted}>{sub}</Text>}</View>
}
export function SectionTitle({children,sub}:{children:ReactNode;sub?:string}){
  return <View style={s.sectionHead}><View><Text style={s.sectionTitle}>{children}</Text>{sub&&<Text style={s.sectionSub}>{sub}</Text>}</View></View>
}
export function Card({children,accent=false}:{children:ReactNode;accent?:boolean}){return <View style={[s.card,accent&&s.cardAccent]}>{children}</View>}
export function Field(props:TextInputProps){return <TextInput placeholderTextColor={theme.muted2} selectionColor={theme.primary} {...props} style={[s.field,props.style]}/>}
export function Label({children}:{children:ReactNode}){return <Text style={s.label}>{children}</Text>}
export function Button({title,onPress,disabled=false,kind='primary'}:{title:string;onPress:()=>void;disabled?:boolean;kind?:'primary'|'secondary'|'danger'}){
  return <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,kind==='secondary'&&s.secondary,kind==='danger'&&s.danger,pressed&&!disabled&&s.pressed,disabled&&s.disabled]}><Text style={[s.buttonText,kind==='secondary'&&s.secondaryText]}>{title}</Text></Pressable>;
}
export function ErrorText({value}:{value:string}){return value?<View style={s.errorBox}><Text style={s.error}>{value}</Text></View>:null}
export function Badge({text,tone='neutral'}:{text:string;tone?:'neutral'|'success'|'warning'|'danger'|'info'}){
  return <View style={[s.badge,tone==='success'&&s.badgeSuccess,tone==='warning'&&s.badgeWarning,tone==='danger'&&s.badgeDanger,tone==='info'&&s.badgeInfo]}><Text style={[s.badgeText,tone==='success'&&s.badgeSuccessText,tone==='warning'&&s.badgeWarningText,tone==='danger'&&s.badgeDangerText,tone==='info'&&s.badgeInfoText]}>{text}</Text></View>
}
export function StatusDot({online=true}:{online?:boolean}){return <View style={[s.dot,{backgroundColor:online?theme.success:theme.danger}]}/>}
export function Divider(){return <View style={s.divider}/>}
export function Sheet({visible,onClose,title,children}:{visible:boolean;onClose:()=>void;title:string;children:ReactNode}){
  return <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}><View style={s.backdrop}><Pressable style={StyleSheet.absoluteFill} onPress={onClose}/><View style={s.sheet}><View style={s.handle}/><View style={s.sheetHead}><Text style={s.sheetTitle}>{title}</Text><Pressable hitSlop={12} onPress={onClose}><Text style={s.close}>Fermer</Text></Pressable></View><ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.sheetContent}>{children}</ScrollView></View></View></Modal>
}
const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:theme.bg},scroll:{paddingBottom:18},body:{paddingHorizontal:10,paddingTop:8,gap:8},
  titleWrap:{gap:2,marginBottom:1},eyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.1,textTransform:'uppercase',color:theme.primary},
  title:{fontSize:21,lineHeight:24,fontWeight:'900',letterSpacing:-0.4,color:theme.text},muted:{color:theme.muted,lineHeight:15,fontSize:11},
  sectionHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:2},sectionTitle:{color:theme.text,fontSize:13,fontWeight:'900',letterSpacing:-0.1},sectionSub:{color:theme.muted,fontSize:9,marginTop:1},
  card:{backgroundColor:theme.surface,borderWidth:1,borderColor:theme.borderSoft,borderRadius:theme.radius.lg,padding:9,gap:5},
  cardAccent:{borderColor:theme.primaryBorder,backgroundColor:'#11151C'},
  field:{backgroundColor:theme.bgSoft,borderWidth:1,borderColor:theme.border,borderRadius:theme.radius.md,paddingHorizontal:9,paddingVertical:8,color:theme.text,fontSize:12},
  label:{color:theme.textSoft,fontWeight:'800',fontSize:9,letterSpacing:.1},
  button:{minHeight:34,backgroundColor:theme.primary,borderRadius:theme.radius.md,paddingVertical:8,paddingHorizontal:10,alignItems:'center',justifyContent:'center'},
  secondary:{backgroundColor:theme.surface2,borderWidth:1,borderColor:theme.border},danger:{backgroundColor:theme.danger},
  buttonText:{color:'#fff',fontWeight:'900',fontSize:11},secondaryText:{color:theme.text},pressed:{transform:[{scale:.985}],opacity:.9},disabled:{opacity:.45},
  errorBox:{borderWidth:1,borderColor:'rgba(255,95,104,.28)',backgroundColor:theme.dangerSoft,borderRadius:9,padding:7},error:{color:'#FF8790',lineHeight:14,fontSize:10,fontWeight:'600'},
  badge:{alignSelf:'flex-start',backgroundColor:theme.surface3,borderRadius:99,paddingHorizontal:6,paddingVertical:3,borderWidth:1,borderColor:theme.border},
  badgeText:{color:theme.textSoft,fontSize:8,fontWeight:'800'},badgeSuccess:{backgroundColor:theme.successSoft,borderColor:'rgba(60,203,127,.24)'},badgeSuccessText:{color:theme.success},
  badgeWarning:{backgroundColor:theme.warningSoft,borderColor:'rgba(247,185,85,.24)'},badgeWarningText:{color:theme.warning},
  badgeDanger:{backgroundColor:theme.dangerSoft,borderColor:'rgba(255,95,104,.24)'},badgeDangerText:{color:theme.danger},
  badgeInfo:{backgroundColor:'rgba(110,168,254,.12)',borderColor:'rgba(110,168,254,.24)'},badgeInfoText:{color:theme.info},
  dot:{width:6,height:6,borderRadius:99},divider:{height:1,backgroundColor:theme.borderSoft},
  backdrop:{flex:1,backgroundColor:'rgba(0,0,0,.72)',justifyContent:'flex-end'},sheet:{maxHeight:'94%',backgroundColor:theme.bgSoft,borderTopLeftRadius:18,borderTopRightRadius:18,paddingHorizontal:10,paddingTop:6,borderWidth:1,borderColor:theme.border},
  handle:{width:30,height:3,borderRadius:99,backgroundColor:theme.border,alignSelf:'center',marginBottom:7},sheetHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},
  sheetTitle:{color:theme.text,fontSize:15,fontWeight:'900',letterSpacing:-.2},close:{color:theme.primary,fontWeight:'900',fontSize:10},sheetContent:{gap:7,paddingBottom:20}
});
export const ui=s;
