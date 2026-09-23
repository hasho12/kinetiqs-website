/* Page interaction modules. Update public content and destinations in index.html. */
(() => {
  'use strict';
  const K=window.Kinetiqs;if(!K)return;
  document.getElementById('year').textContent=new Date().getFullYear();
  const menu=document.querySelector('.menu-button'),mobile=document.getElementById('mobile-menu');
  function closeMenu(){mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';mobile.hidden=!open;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
  mobile.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const wasOpen=!mobile.hidden;closeMenu();if(wasOpen)menu.focus()}});
  document.addEventListener('pointerdown',e=>{if(!mobile.hidden&&!e.target.closest('.header'))closeMenu()});
  matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu()});

  document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>{
    const dialog=document.getElementById(button.dataset.dialog);if(!dialog)return;
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }));
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
  });
  document.getElementById('copy-email').addEventListener('click',async()=>{
    const result=document.getElementById('copy-status');
    try{await navigator.clipboard.writeText('care@kinetiqs.app');result.textContent='Email address copied.'}
    catch{result.textContent='Select and copy care@kinetiqs.app, or use the email link above.'}
  });
  const sample={_notice:'Illustrative concept only. Not a valid FitTrack90 import.',format:'kinetiqs-demo',version:1,app:'FitTrack90',data:{habits:[{name:'Evening walk',completed:true}],hydration:{unit:'ml',sample_total:1500},notes:'Fictional sample records. No personal information.'}};
  const json=JSON.stringify(sample,null,2);
  document.getElementById('backup-code').textContent=json;
  const blobURL=URL.createObjectURL(new Blob([json+'\n'],{type:'application/json'}));
  document.getElementById('download-backup').href=blobURL;
  window.addEventListener('pagehide',e=>{if(!e.persisted)URL.revokeObjectURL(blobURL)});

  const motionButton=document.getElementById('motion-button');
  function updateMotion(){motionButton.setAttribute('aria-pressed',String(!K.motion));document.getElementById('motion-label').textContent=K.motion?'Pause motion':'Motion paused';motionButton.querySelector('.dock-icon').textContent=K.motion?'Ⅱ':'▷'}
  motionButton.addEventListener('click',()=>K.setMotion(!K.motion));document.addEventListener('kinetiqs:motion',updateMotion);updateMotion();
  const soundButton=document.getElementById('sound-button');
  soundButton.addEventListener('click',async()=>{soundButton.disabled=true;const enabled=await K.setSound(!K.sound);soundButton.disabled=false;soundButton.setAttribute('aria-pressed',String(enabled));document.getElementById('sound-label').textContent=enabled?'Sound on':'Sound off';if(enabled)K.pulse(false)});
  const backupToggle=document.getElementById('backup-toggle');
  backupToggle.addEventListener('change',()=>{document.querySelector('.architecture').classList.toggle('backup-active',backupToggle.checked);document.getElementById('architecture-note').textContent=backupToggle.checked?'Optional backup adds a connection you choose. Core records remain local in this illustration.':'Core records stay on the device in this illustration.'});

  // Scroll remains native. Pinning is enabled only when the full card fits.
  const suite=document.querySelector('.ecosystem'),track=document.querySelector('.suite-track'),windowEl=document.querySelector('.suite-window');
  const cards=[...track.children],stage=document.querySelector('.suite-stage');
  let suiteContext=null,suiteTween=null,currentCard=0,resizeTimer;
  const count=document.getElementById('suite-count'),progress=document.querySelector('.suite-progress>span');
  function updateCount(p){currentCard=Math.min(2,Math.floor(p*2.999));count.textContent=`0${currentCard+1} — 03`;progress.style.width=`${33.333+p*66.667}%`;document.getElementById('suite-prev').disabled=p<=.001;document.getElementById('suite-next').disabled=p>=.999}
  function distance(){return Math.max(0,track.scrollWidth-(windowEl.clientWidth-2*parseFloat(getComputedStyle(windowEl).paddingLeft)))}
  function setupSuite(){
    suiteContext?.revert();suiteContext=null;suiteTween=null;suite.classList.remove('is-pinned');track.style.transform='';
    if(window.gsap&&window.ScrollTrigger&&innerWidth>1024&&innerHeight>=800&&K.motion){
      gsap.registerPlugin(ScrollTrigger);windowEl.scrollLeft=0;suite.classList.add('is-pinned');
      suiteContext=gsap.context(()=>{suiteTween=gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:stage,start:'top top',end:()=>`+=${distance()+250}`,pin:true,scrub:.75,invalidateOnRefresh:true,onUpdate:self=>updateCount(self.progress)}})},suite);
    }
    updateCount(0);
  }
  function goCard(index){index=K.clamp(index,0,2);if(suiteTween){const s=suiteTween.scrollTrigger;window.scrollTo({top:s.start+(s.end-s.start)*index/2,behavior:K.motion?'smooth':'instant'})}else{const left=cards[index].offsetLeft-cards[0].offsetLeft;windowEl.scrollTo({left,behavior:K.motion?'smooth':'instant'})}}
  document.getElementById('suite-prev').addEventListener('click',()=>goCard(currentCard-1));document.getElementById('suite-next').addEventListener('click',()=>goCard(currentCard+1));
  windowEl.addEventListener('scroll',()=>{if(suiteTween)return;const max=windowEl.scrollWidth-windowEl.clientWidth;updateCount(max>0?windowEl.scrollLeft/max:0)},{passive:true});
  track.addEventListener('focusin',e=>{if(suiteTween&&e.target.closest('.app-card')===cards[0]&&suiteTween.scrollTrigger.progress>.01)goCard(0)});
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(setupSuite,180)},{passive:true});
  document.addEventListener('kinetiqs:motion',setupSuite);
  document.fonts.ready.then(setupSuite);

  // Never hide content while waiting for JS or external dependencies.
  if(window.gsap){
    const seen=new WeakSet();
    const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting||seen.has(entry.target))return;seen.add(entry.target);if(K.motion)gsap.fromTo(entry.target,{y:28,opacity:.3},{y:0,opacity:1,duration:.9,ease:'power3.out',clearProps:'transform,opacity'});revealObserver.unobserve(entry.target)})},{threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
    if(K.motion)gsap.fromTo('.hero-content',{y:18,opacity:0},{y:0,opacity:1,duration:1.2,ease:'power3.out',clearProps:'transform,opacity'});
    document.addEventListener('kinetiqs:motion',()=>{if(!K.motion){gsap.killTweensOf('.reveal,.hero-content');gsap.set('.reveal,.hero-content',{clearProps:'transform,opacity'})}});
  }
  const reading=document.querySelector('.reading-progress');let scrollPending=false;
  function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;reading.style.transform=`scaleX(${max>0?scrollY/max:0})`;scrollPending=false}
  window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateProgress)}},{passive:true});updateProgress();
  const cursor=document.querySelector('.cursor-orbit');
  if(matchMedia('(pointer:fine)').matches){
    let px=-100,py=-100,cx=-100,cy=-100,lastMove=0;
    const cursorFrame=K.addFrame(null,(t,dt,moving)=>{if(!K.motion){cursor.style.opacity='0';return}cx+=(px-cx)*.18;cy+=(py-cy)*.18;cursor.style.transform=`translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;if(performance.now()-lastMove>1500)cursorFrame.enable(false)});
    cursorFrame.enable(false);
    window.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;lastMove=performance.now();if(!K.motion)return;cursor.style.opacity='1';cursor.classList.toggle('is-link',Boolean(e.target.closest('button,a,input,label')));cursor.classList.toggle('is-drag',e.target.id==='lab-canvas');cursorFrame.enable(true)},{passive:true});
    document.addEventListener('pointerleave',()=>{cursor.style.opacity='0';cursorFrame.enable(false)});
    document.addEventListener('kinetiqs:motion',()=>{if(!K.motion)cursor.style.opacity='0'});
    document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(!K.motion)return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.1}px,${(e.clientY-r.top-r.height/2)*.12}px)`});el.addEventListener('pointerleave',()=>{el.style.transform=''})});
    document.querySelectorAll('[data-tilt]').forEach(el=>{const area=el.closest('.app-visual');area.addEventListener('pointermove',e=>{if(!K.motion)return;const r=area.getBoundingClientRect();el.style.transform=`rotate(-9deg) rotateY(${-20+(e.clientX-r.left-r.width/2)*.035}deg) rotateX(${9-(e.clientY-r.top-r.height/2)*.025}deg)`});area.addEventListener('pointerleave',()=>{el.style.transform=''})});
  }
})();
