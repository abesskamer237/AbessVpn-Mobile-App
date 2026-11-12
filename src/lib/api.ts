import * as SecureStore from 'expo-secure-store';
import type {ApiUser} from '@/types';

const baseUrl=(process.env.EXPO_PUBLIC_API_BASE_URL||'').replace(/\/$/,'');
const SESSION_KEY='abess_session_token';

export async function setSession(token:string|null){if(token)await SecureStore.setItemAsync(SESSION_KEY,token);else await SecureStore.deleteItemAsync(SESSION_KEY);}
export async function getSession(){return SecureStore.getItemAsync(SESSION_KEY);}
export function apiBaseUrl(){return baseUrl;}

export async function api<T=any>(path:string,init:RequestInit={}):Promise<T>{
  if(!baseUrl)throw new Error('Configure EXPO_PUBLIC_API_BASE_URL dans .env');
  const token=await getSession();
  const res=await fetch(baseUrl+path,{...init,headers:{'Content-Type':'application/json',Accept:'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(init.headers||{})}});
  const text=await res.text();let data:any={};
  if(text){try{data=JSON.parse(text)}catch{data={raw:text}}}
  if(res.status===401&&path!=='/api/v1/auth/login')await setSession(null);
  if(!res.ok)throw new Error(data?.error||('Erreur HTTP '+res.status));
  return data as T;
}
export async function login(email:string,password:string,code?:string){
  const data=await api<{success:boolean;token:string;user:ApiUser}>('/api/v1/auth/login',{method:'POST',body:JSON.stringify({email,password,code:code||''})});
  await setSession(data.token);return data;
}
export async function me(){return api<ApiUser>('/api/v1/auth/me');}
export async function logout(){try{await api('/api/v1/auth/logout',{method:'POST'});}finally{await setSession(null);}}
export function randomKey(){return Array.from({length:4},()=>Math.random().toString(36).slice(2,10)).join('');}
