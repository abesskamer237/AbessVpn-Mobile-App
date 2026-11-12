import * as SecureStore from 'expo-secure-store';

const baseUrl=(process.env.EXPO_PUBLIC_API_BASE_URL||'').replace(/\/$/,'');
const SESSION_KEY='abess_session_token';

export type ApiUser={id:string;name:string;email:string;role:'SUPER_ADMIN'|'ADMIN'|'RESELLER';credits:number};

export async function setSession(token:string|null){
  if(token) await SecureStore.setItemAsync(SESSION_KEY,token);
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}
export async function getSession(){return SecureStore.getItemAsync(SESSION_KEY);}
export async function api<T>(path:string,init:RequestInit={}):Promise<T>{
  if(!baseUrl) throw new Error('EXPO_PUBLIC_API_BASE_URL manquant');
  const token=await getSession();
  const res=await fetch(baseUrl+path,{...init,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(init.headers||{})}});
  const body=await res.text();
  const data=body?JSON.parse(body):null;
  if(!res.ok) throw new Error(data?.error||('Erreur HTTP '+res.status));
  return data as T;
}
export async function login(email:string,password:string,code?:string){
  const data=await api<{token:string;user:ApiUser}>('/api/v1/auth/login',{method:'POST',body:JSON.stringify({email,password,...(code?{code}:{})})});
  await setSession(data.token);return data;
}
export async function me(){return api<ApiUser>('/api/v1/auth/me');}
export async function logout(){try{await api('/api/v1/auth/logout',{method:'POST'});}finally{await setSession(null);}}
