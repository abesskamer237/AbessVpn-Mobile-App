import type {SshAccount} from '@/types';

export const bytesToGb=(n:number|null|undefined)=>Number((Number(n||0)/1024**3).toFixed(2));
export const fmtDate=(v?:string)=>v?new Date(v).toLocaleDateString('fr-FR'):'—';
export const fmtDateTime=(v?:string|number)=>v?new Date(v).toLocaleString('fr-FR'):'—';
export const percent=(used:number|null|undefined,total:number|null|undefined)=>!total?0:Math.max(0,Math.min(100,Math.round(Number(used||0)/total*100)));

export function accountStatus(a:SshAccount){
  const left=Date.parse(a.expiresAt)-Date.now();
  if(a.provisionState==='error')return {key:'error',label:'Erreur VPS'};
  if(a.provisionState==='pending')return {key:'pending',label:'Provisionnement'};
  if(!a.enabled)return {key:'suspended',label:'Suspendu'};
  if(Date.parse(a.expiresAt)<=Date.now())return {key:'expired',label:'Expiré'};
  if(a.usedBytes!==null&&a.usedBytes>=a.quotaBytes)return {key:'quota',label:'Quota épuisé'};
  if(left<=3*86400000)return {key:'expiring',label:'Expire bientôt'};
  if(a.effectiveEnabled)return {key:'active',label:'Actif'};
  return {key:'inactive',label:'Inactif'};
}
