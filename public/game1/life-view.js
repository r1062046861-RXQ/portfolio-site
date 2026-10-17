import {icon,escape,glyph} from './ui-templates.js?v=1.0.3-life39';
import {JOBS,JOB_DETAILS,DAYS} from './engine.js?v=1.0.3-life39';
import {HOME_ITEMS,scaleAt} from './home-system.js?v=1.0.3-life39';
import * as L from './life-progress.js?v=1.0.3-life39';

export const art=id=>`assets/life39/${id}.webp`;
let metaPromise;
export function loadLifeMeta(){
  return metaPromise??=fetch('assets/home/meta.json').then(r=>{if(!r.ok)throw Error('小家预览暂时无法读取。');return r.json();}).catch(e=>{metaPromise=null;throw e;});
}
export function workBookHTML(s,{person=0,job='shop',view='results',page=0}){
  const w=s.life.work[person],count=w.counts[job],detail=JOB_DETAILS[job],role=JOBS.find(j=>j.id===job),entries=w.entries.filter(e=>e.job===job).toReversed(),latest=entries[0];
  const pages=Math.max(1,Math.ceil(entries.length/3));page=Math.max(0,Math.min(page,pages-1));
  return `<section class="work-book name-${person?'mang':'xian'}">
    <nav class="work-people" aria-label="工作手帐的室友">${s.chars.map((c,i)=>`<button data-work-person="${i}" aria-pressed="${person===i}" class="name-${i?'mang':'xian'}" style="font-size:${[...c.name].length>4?13:18}px"><img src="assets/ui-v10/portrait-${i?'fox':'cat'}.webp" alt=""><span>${escape(c.name)}</span></button>`).join('')}</nav>
    <nav class="work-jobs" aria-label="岗位">${JOBS.map(j=>`<button data-work-job="${j.id}" aria-pressed="${j.id===job}" title="${j.name}" aria-label="${j.name}">${glyph(j.icon,true)}</button>`).join('')}</nav>
    <h3 class="work-role">${role.name}<span>${count} 班</span></h3>
    ${view==='results'?`<figure class="work-output ${count?'':'unearned'}"><img src="${art('work-'+job)}" alt="${detail.place}的${['小票与价签','登记卡','活动签到页','档案目录','社区简报','手绘菜单'][L.JOB_IDS.indexOf(job)]}"><figcaption>${count?'留下一点认真生活的痕迹':'第一份成果，等你来完成'}</figcaption></figure><p class="work-result">${latest?L.WORK_RESULTS[job][latest.day]:'完成这里的真实班次，就会留下经历与成果。'}</p><p class="work-date">${latest?`第${latest.week}周 · ${DAYS[latest.day]} · ${detail.place}`:'尚无已完成班次'}</p>`:
      `<ol class="work-entries">${entries.slice(page*3,page*3+3).map(e=>`<li><img src="${art('work-'+job)}" alt=""><div><small>第${e.week}周 · ${DAYS[e.day]}</small><b>${detail.tasks[e.day]}</b><p>${L.WORK_RESULTS[job][e.day]}</p></div></li>`).join('')||'<li class="work-no-record">这本手帐，先留一页给明天。</li>'}</ol><nav class="work-history-pages" aria-label="经历分页"><button data-work-page="${page-1}" ${page===0?'disabled':''} title="较新的经历" aria-label="较新的经历">${icon('chevron-left')}</button><span>${page+1} / ${pages}</span><button data-work-page="${page+1}" ${page===pages-1?'disabled':''} title="更早的经历" aria-label="更早的经历">${icon('chevron-right')}</button></nav>`}
    <ol class="work-stages" aria-label="岗位成果阶段">${L.STAGES.map((n,i)=>`<li class="${count>=n?'earned':''}"><b>${n}</b><span>${['初次帮忙','熟练帮手','可靠搭档'][i]}</span><small>${Math.min(count,n)} / ${n}</small></li>`).join('')}</ol>
    <small class="work-scope">${s.life.legacy?`旧记录从第${s.life.fromWeek}周可确认班次开始；` :''}最近96次经历留档，岗位累计一直保留。</small>
    <nav class="work-tabs" aria-label="手帐内容"><button data-work-view="history" aria-pressed="${view==='history'}">${icon('notebook-pen')}看经历</button><button data-work-view="results" aria-pressed="${view==='results'}">${icon('award')}看成果</button></nav>
  </section>`;
}
export function workRewardHTML(s,person,job,day){
  const count=s.life.work[person].counts[job];
  return `<section class="life-work-reward"><img src="${art('work-'+job)}" alt="今日工作成果"><div><b>${escape(s.chars[person].name)}的第${count}班</b><p>${L.WORK_RESULTS[job][day]}</p>${L.STAGES.includes(count)?`<small class="work-milestone">${count}班成果章 · ${['初次帮忙','熟练帮手','可靠搭档'][L.STAGES.indexOf(count)]}</small>`:''}</div></section><button class="text-button" data-work-open="${person}" data-work-at="${job}">${icon('notebook-pen')}收进工作手帐</button>`;
}
export function previewStageHTML(s,id,after,meta){
  const n=structuredClone(s),owned=Boolean(n.life.keepsakes[id]),placed=L.keepsakePosition(n,id);
  if(after&&!placed){
    n.life.keepsakes[id]??={week:s.week,place:null};
    n.life.keepsakes[id].place=L.defaultKeepsakePlace(n,id);
  }
  const room=s.home.room,style=b=>`left:${b.x*100}%;top:${b.y*100}%;width:${b.width*100}%;z-index:${b.z}`;
  const furniture=HOME_ITEMS.filter(i=>n.home.positions[i.id]?.room===room).map(i=>{const p=n.home.positions[i.id];return `<img class="life-preview-object" src="assets/home/${i.asset}.webp" alt="" style="${style({...p,width:i.w*scaleAt(p.y),z:Math.round(p.y*500)})}">`;}).join('');
  const decor=L.KEEPSAKES.map(k=>{const b=L.keepsakeBox(n,k.id,meta);return b?.room===room?`<img class="life-preview-object" src="${art('keepsake-'+k.id)}" alt="${k.name}" style="${style(b)}">`:'';}).join('');
  return `<figure class="life-preview"><figcaption>${after?(placed?'已摆放':'完成后'):'现在'}</figcaption><div class="life-preview-scene"><div class="life-preview-stage"><img class="life-preview-background" src="assets/home/room-${room}-full.webp" alt="">${furniture}${decor}</div></div></figure>`;
}
export function weeklyHomeHTML(s,id,meta){
  const k=L.keepsakeOf(id),owned=s.life.keepsakes[id],future=s.week<s.life.rewardFromWeek,table=k.kind==='table'&&!Object.keys(L.TABLE_HOSTS).some(id=>s.home.positions[id]?.room===s.home.room);
  return `<section class="weekly-home"><div class="weekly-home-previews">${previewStageHTML(s,id,false,meta)}${previewStageHTML(s,id,true,meta)}</div><div class="weekly-keepsake"><img src="${art('keepsake-'+id)}" alt="${k.name}"><div><b>${k.name}</b><small>${owned?'已收藏 · 不再重复发放':future?`第${s.life.rewardFromWeek}周起可获得`:'周日达成后 · 先入收纳'}</small></div></div><p>${table?'当前房间还没有兼容桌面，桌旗可以先收藏。':k.line}</p></section>`;
}
export function keepsakeRewardHTML(id){
  const k=L.keepsakeOf(id);
  return `<section class="weekly-gift"><img src="${art('keepsake-'+id)}" alt="${k.name}"><div><small>家里多了这一点</small><b>${k.name}</b><p>${k.line}</p></div></section><button class="text-button" data-open-keepsakes>${icon('package-open')}去小家收纳看看</button>`;
}
