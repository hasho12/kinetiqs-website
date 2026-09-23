/* Matter.js powers a contained illustration; this never handles real user records. */
(() => {
  'use strict';
  const K=window.Kinetiqs, M=window.Matter;
  const chamber=document.getElementById('lab-chamber'), canvas=document.getElementById('lab-canvas');
  const lock=document.getElementById('lock-button'), nudge=document.getElementById('nudge-button');
  const status=document.getElementById('lab-state');
  if(!M||!K||!canvas){status.textContent='DEMO UNAVAILABLE';return}
  const ctx=canvas.getContext('2d'); if(!ctx)return;
  const {Engine,Bodies,Body,Composite,Query}=M;
  const engine=Engine.create({gravity:{x:0,y:0,scale:0},enableSleeping:false,positionIterations:5,velocityIterations:4});
  let width=0,height=0,dpr=1,blocks=[],walls=[],locked=false,progress=0,selected=null,lastPointer=null,throwVelocity={x:0,y:0};
  const specs=[{label:'Photos',code:'MEMORIES',color:'#b4c6ed',w:126},{label:'Habits',code:'EVERYDAY',color:'#ccff00',w:120},{label:'Workouts',code:'MOVEMENT',color:'#f1eece',w:145},{label:'Biometrics',code:'PERSONAL',color:'#8bdbda',w:155},{label:'Finances',code:'YOUR NUMBERS',color:'#c4b4dd',w:142}];
  const homes=[[.24,.24],[.73,.26],[.44,.51],[.24,.76],[.73,.76]];
  function reset(){
    selected=null;
    blocks.forEach((b,i)=>{
      const safeX=K.clamp(width*homes[i][0],b.w/2+12,width-b.w/2-12);
      const safeY=K.clamp(height*homes[i][1],b.h/2+8,height-b.h/2-8);
      Body.setStatic(b,false);Body.setPosition(b,{x:safeX,y:safeY});Body.setAngle(b,[-.16,.22,.1,-.12,.15][i]);
      Body.setVelocity(b,{x:Math.cos(i*2.4)*.8,y:Math.sin(i*2.4)*.65});Body.setAngularVelocity(b,i%2?.002:-.003);b.collisionFilter.mask=0xffffffff;
    });
  }
  function resize(){
    const newWidth=chamber.clientWidth,newHeight=chamber.clientHeight;
    if(width===newWidth&&height===newHeight)return;
    width=newWidth;height=newHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    Composite.clear(engine.world,false);
    walls=[Bodies.rectangle(width/2,-30,width+120,60,{isStatic:true}),Bodies.rectangle(width/2,height+30,width+120,60,{isStatic:true}),Bodies.rectangle(-30,height/2,60,height+120,{isStatic:true}),Bodies.rectangle(width+30,height/2,60,height+120,{isStatic:true})];
    const scale=width<400?.79:1;
    blocks=specs.map((s,i)=>{
      const w=s.w*scale,h=76*scale;
      const b=Bodies.rectangle(0,0,w,h,{chamfer:{radius:12},frictionAir:.001,friction:.01,restitution:.95,density:.0006});
      Object.assign(b,{w,h,spec:s,index:i,visualScale:scale});return b;
    });
    Composite.add(engine.world,[...walls,...blocks]);reset();
    if(locked){progress=1;blocks.forEach(b=>b.collisionFilter.mask=0)}
    draw();
  }
  function draw(){
    ctx.clearRect(0,0,width,height);
    blocks.forEach(b=>{
      const alpha=locked?Math.max(0,1-progress*1.4):1;
      if(alpha<.01)return;
      ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);ctx.globalAlpha=alpha;
      if(locked)ctx.scale(Math.max(.05,1-progress*.8),Math.max(.05,1-progress*.8));
      const g=ctx.createLinearGradient(-b.w/2,-b.h/2,b.w/2,b.h/2);
      g.addColorStop(0,'#29332e');g.addColorStop(.6,'#18211e');g.addColorStop(1,'#111919');
      ctx.shadowBlur=20;ctx.shadowColor='#0006';ctx.shadowOffsetY=8;
      ctx.beginPath();ctx.roundRect(-b.w/2,-b.h/2,b.w,b.h,12);ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
      ctx.strokeStyle=b.spec.color+'70';ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle=b.spec.color;ctx.fillRect(-b.w/2+13,-b.h/2+15,5,5);
      ctx.fillStyle='#edf3ed';ctx.font=`500 ${15*b.visualScale}px Arial`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(b.spec.label,-b.w/2+25,-b.h/2+19);
      ctx.fillStyle='#94a79a';ctx.font=`${8*b.visualScale}px JetBrains,monospace`;ctx.fillText(b.spec.code,-b.w/2+13,b.h/2-17);
      ctx.fillStyle=b.spec.color;ctx.fillText('↗',b.w/2-20,b.h/2-17);ctx.restore();
    });
  }
  resize();
  const frame=K.addFrame(chamber,(_,dt,moving)=>{
    if(moving){
      if(locked){
        progress=Math.min(1,progress+dt*1.25);
        blocks.forEach(b=>{Body.setVelocity(b,{x:(width/2-b.position.x)*.095,y:(height/2-b.position.y)*.095});Body.setAngularVelocity(b,.01)});
        if(progress===1){status.textContent='LOCAL LOCK ENGAGED';frame.enable(false)}
      }else{
        blocks.forEach((b,i)=>{
          if(b===selected)return;
          // Tiny impulses prevent the zero-gravity chamber from becoming still.
          if(b.speed<.35)Body.applyForce(b,b.position,{x:Math.cos(i*2.4)*.000006,y:Math.sin(i*2.4)*.000006});
          if(b.speed>12)Body.setVelocity(b,{x:b.velocity.x*.85,y:b.velocity.y*.85});
          const x=K.clamp(b.position.x,b.w/2+1,width-b.w/2-1),y=K.clamp(b.position.y,b.h/2+1,height-b.h/2-1);
          if(x!==b.position.x||y!==b.position.y)Body.setPosition(b,{x,y});
        });
      }
      Engine.update(engine,Math.min(dt*1000,1000/60));
    }
    draw();
  });
  new ResizeObserver(resize).observe(chamber);
  function setLocked(value){
    locked=value;selected=null;progress=K.motion?0:(locked?1:0);
    chamber.classList.toggle('locked',locked);lock.setAttribute('aria-checked',String(locked));
    document.getElementById('lock-label').textContent=locked?'Zero-cloud lock engaged':'Engage zero-cloud lock';
    status.textContent=locked?(K.motion?'BRINGING IT HOME':'LOCAL LOCK ENGAGED'):'FREE TO MOVE';
    blocks.forEach(b=>{Body.setStatic(b,false);b.collisionFilter.mask=locked?0:0xffffffff});
    if(!locked)reset();
    frame.enable(true);frame.render();K.pulse(locked);
  }
  lock.addEventListener('click',()=>setLocked(!locked));
  nudge.addEventListener('click',()=>{
    if(locked)setLocked(false);
    blocks.forEach((b,i)=>{Body.setVelocity(b,{x:Math.cos(i*2.3+Date.now()*.001)*4,y:Math.sin(i*1.7+Date.now()*.001)*3});Body.setAngularVelocity(b,(i%2?1:-1)*.03)});
    if(!K.motion){reset();blocks.forEach(b=>Body.setAngle(b,b.angle+.16));frame.render()}
  });
  function position(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
  canvas.addEventListener('pointerdown',e=>{
    if(locked||e.button!==0)return;
    const p=position(e);selected=Query.point(blocks,p).at(-1)||null;
    if(!selected)return;
    canvas.setPointerCapture(e.pointerId);selected.dragOffset={x:p.x-selected.position.x,y:p.y-selected.position.y};Body.setStatic(selected,true);lastPointer={...p,t:e.timeStamp};throwVelocity={x:0,y:0};
  });
  canvas.addEventListener('pointermove',e=>{
    if(!selected)return;const p=position(e),dt=Math.max(8,e.timeStamp-lastPointer.t);
    throwVelocity={x:K.clamp((p.x-lastPointer.x)/dt*16.67,-10,10),y:K.clamp((p.y-lastPointer.y)/dt*16.67,-10,10)};
    Body.setPosition(selected,{x:K.clamp(p.x-selected.dragOffset.x,selected.w/2,width-selected.w/2),y:K.clamp(p.y-selected.dragOffset.y,selected.h/2,height-selected.h/2)});
    lastPointer={...p,t:e.timeStamp};frame.render();
  });
  function release(){if(!selected)return;Body.setStatic(selected,false);if(K.motion)Body.setVelocity(selected,throwVelocity);selected=null}
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  document.addEventListener('kinetiqs:motion',()=>{if(locked&&!K.motion){progress=1;status.textContent='LOCAL LOCK ENGAGED'}frame.render()});
  status.textContent='FREE TO MOVE';lock.disabled=false;nudge.disabled=false;
})();
