const cookieBox=document.getElementById('cookieBox');
if(localStorage.getItem('radiohitCookies')==='ok') cookieBox?.classList.add('hidden');
document.getElementById('acceptCookies')?.addEventListener('click',()=>{localStorage.setItem('radiohitCookies','ok');cookieBox?.classList.add('hidden')});

const toggle=document.querySelector('.mobile-toggle');
const menu=document.querySelector('.menu');
toggle?.addEventListener('click',()=>{
  menu?.classList.toggle('open');
  const open=menu?.classList.contains('open');
  toggle.setAttribute('aria-expanded',open?'true':'false');
  toggle.innerHTML=open?'<i class="fa-solid fa-xmark"></i>':'<i class="fa-solid fa-bars"></i>';
});
document.querySelectorAll('#main-menu a').forEach(a=>a.addEventListener('click',()=>menu?.classList.remove('open')));

const words=[...document.querySelectorAll('.cd-words-wrapper b')];let wi=0;
if(words.length){setInterval(()=>{words[wi].classList.remove('is-visible');wi=(wi+1)%words.length;words[wi].classList.add('is-visible')},2200)}
const playButton=document.querySelector('.js-modal-video'); const audio=document.querySelector('.custom-audio');
playButton?.addEventListener('click',e=>{e.preventDefault();if(!audio)return;audio.paused?audio.play().catch(()=>{}):audio.pause()});

const header=document.getElementById('sticky-wrap');
const setSticky=()=>header?.classList.toggle('stickyhead',window.scrollY>120);
window.addEventListener('scroll',setSticky,{passive:true});setSticky();
const navLinks=[...document.querySelectorAll('#main-menu a')];
const sections=navLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
const markActive=()=>{let current=sections[0]?.id;for(const section of sections){if(window.scrollY>=section.offsetTop-180)current=section.id}navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current))};
window.addEventListener('scroll',markActive,{passive:true});markActive();



// Noticias editables desde noticias.json
const newsState={index:0,timer:null,cards:[]};
const newsTrack=document.getElementById('newsTrack');
const dotsWrap=document.querySelector('.news-dots');
const visibleNews=()=>innerWidth<=640?1:innerWidth<=980?2:3;
const maxNewsIndex=()=>Math.max(0,newsState.cards.length-visibleNews());

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  })[char]);
}
function newsCard(item){
  const target=item.nueva_pestana?' target="_blank" rel="noopener"':'';
  const rawLink=item.enlace||((item.slug)?`noticia.html?slug=${encodeURIComponent(item.slug)}`:'#');
  const link=escapeHtml(rawLink);
  const image=escapeHtml(item.imagen||'');
  const title=escapeHtml(item.titulo||'Sin título');
  return `<article class="news-card">
    <a class="news-image" href="${link}"${target}><img src="${image}" alt="${title}" loading="lazy"></a>
    <div class="news-content"><span class="news-tag">${escapeHtml(item.categoria||'Noticias')}</span><h2><a href="${link}"${target}>${title}</a></h2><p>${escapeHtml(item.descripcion||'')}</p></div>
  </article>`;
}
function buildNewsDots(){
  if(!dotsWrap)return;
  dotsWrap.innerHTML='';
  for(let i=0;i<=maxNewsIndex();i++){
    const button=document.createElement('button');
    button.className='news-dot';button.type='button';
    button.setAttribute('aria-label',`Ir a noticia ${i+1}`);
    button.addEventListener('click',()=>goNews(i,true));
    dotsWrap.appendChild(button);
  }
}
function renderNews(){
  if(!newsTrack||!newsState.cards[0])return;
  const gap=parseFloat(getComputedStyle(newsTrack).gap)||24;
  const width=newsState.cards[0].getBoundingClientRect().width+gap;
  newsTrack.style.transform=`translate3d(${-newsState.index*width}px,0,0)`;
  [...(dotsWrap?.children||[])].forEach((dot,i)=>dot.classList.toggle('active',i===newsState.index));
}
function goNews(next,user=false){
  const max=maxNewsIndex();
  newsState.index=next<0?max:next>max?0:next;
  renderNews();if(user)restartNews();
}
function restartNews(){
  clearInterval(newsState.timer);
  if(newsState.cards.length>visibleNews())newsState.timer=setInterval(()=>goNews(newsState.index+1),4300);
}
async function loadNews(){
  if(!newsTrack)return;
  try{
    const response=await fetch(`noticias.json?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    const items=Array.isArray(data)?data:(data.items||[]);
    if(!Array.isArray(items)||!items.length)throw new Error('No hay noticias');
    newsTrack.innerHTML=items.map(newsCard).join('');
    newsState.cards=[...newsTrack.querySelectorAll('.news-card')];
    newsState.index=0;buildNewsDots();requestAnimationFrame(renderNews);restartNews();
  }catch(error){
    newsTrack.innerHTML='<div class="news-error">No fue posible cargar las noticias. Revisa el archivo <strong>noticias.json</strong>.</div>';
    console.error('Error al cargar noticias:',error);
  }
}
document.querySelector('.news-prev')?.addEventListener('click',()=>goNews(newsState.index-1,true));
document.querySelector('.news-next')?.addEventListener('click',()=>goNews(newsState.index+1,true));
const carousel=document.querySelector('.news-carousel');
carousel?.addEventListener('mouseenter',()=>clearInterval(newsState.timer));
carousel?.addEventListener('mouseleave',restartNews);
window.addEventListener('resize',()=>{newsState.index=Math.min(newsState.index,maxNewsIndex());buildNewsDots();renderNews()});
loadNews();
