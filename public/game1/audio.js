const tracks=Array.from({length:4},(_,i)=>`assets/music/music-${String(i+1).padStart(2,'0')}.mp3`);
let track=0,options={sound:true,volume:.35,active:false};
export const music=new Audio();
music.preload='none';music.src=tracks[0];music.hidden=true;music.id='background-music';
document.body.append(music);
export function updateMusic(next=options){
  options=next;music.volume=options.volume;
  if(options.sound&&options.volume>0&&options.active&&!document.hidden)music.play().catch(()=>{});
  else music.pause();
}
music.addEventListener('ended',()=>{track=(track+1)%tracks.length;music.src=tracks[track];updateMusic();});
export function playDaySound(volume){
  const ding=new Audio('assets/day.wav');ding.volume=volume;ding.play().catch(()=>{});
}
