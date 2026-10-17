import {migrateSave,validateSave} from './engine.js?v=1.0.3-life39';

export function saveSnapshot(storage,key,state,{backup=true}={}){
  const previous=storage.getItem(key),raw=JSON.stringify(state);
  let previousVersion;try{previousVersion=JSON.parse(previous)?.version;}catch{}
  if(backup&&previousVersion===1&&!storage.getItem(key+'-pre-v2'))storage.setItem(key+'-pre-v2',previous);
  if(backup&&previous&&state.life){
    let old;try{old=JSON.parse(previous);}catch{}
    if(old&&old.life===undefined&&!storage.getItem(key+'-pre-life39'))storage.setItem(key+'-pre-life39',previous);
  }
  if(backup&&previous&&previous!==raw){try{if(validateSave(JSON.parse(previous)))storage.setItem(key+'-backup',previous);}catch{}}
  storage.setItem(key,raw);
  return raw;
}

export function readModeSave(raw,key,test,storage=localStorage){
  const candidate=migrateSave(JSON.parse(raw));
  if(test&&!candidate.home.storageDefault){
    for(const p of Object.values(candidate.home.positions))p.room=null;
    candidate.home.storageDefault=1;
    if(!validateSave(candidate))throw Error('管理员存档无法升级。');
    const backup=key+'-before-storage-v10';
    if(!storage.getItem(backup))storage.setItem(backup,raw);
    saveSnapshot(storage,key,candidate);
  }
  return candidate;
}

export function readPreferences(key,storage){
  try{storage??=localStorage;return JSON.parse(storage.getItem(key)||'{}')||{};}catch{return {};}
}
export function writePreferences(key,preferences,storage){
  try{storage??=localStorage;storage.setItem(key,JSON.stringify(preferences));return true;}catch{return false;}
}
