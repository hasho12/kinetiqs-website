/* Procedural sculpture: locally rendered, no downloaded model or textures. */
(() => {
  'use strict';
  const K = window.Kinetiqs, T = window.THREE;
  const host = document.getElementById('hero-art');
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('core-canvas');
  if (!K || !T || !canvas) return;
  let renderer;
  try { renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'}); }
  catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 1.75));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, .1, 50);
  camera.position.set(0, 0, 8.6);
  const root = new T.Group(); scene.add(root);
  root.position.set(.35, .15, 0);
  const studio = document.createElement('canvas'); studio.width = 1024; studio.height = 512;
  const ctx = studio.getContext('2d');
  const background = ctx.createLinearGradient(0,0,0,512);
  background.addColorStop(0,'#313c36'); background.addColorStop(.48,'#131a16'); background.addColorStop(.6,'#4c544c'); background.addColorStop(1,'#050807');
  ctx.fillStyle = background; ctx.fillRect(0,0,1024,512);
  [[90,20,140,360,'#f3fff3'],[480,80,50,310,'#acb9ad'],[800,0,170,240,'#e6efd6']].forEach(([x,y,w,h,c])=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)});
  const texture = new T.CanvasTexture(studio); texture.mapping = T.EquirectangularReflectionMapping; texture.colorSpace = T.SRGBColorSpace;
  const pmrem = new T.PMREMGenerator(renderer);
  const environment = pmrem.fromEquirectangular(texture); scene.environment = environment.texture;
  texture.dispose(); pmrem.dispose();
  scene.add(new T.AmbientLight(0xb6c6b9, .6));
  const light = new T.DirectionalLight(0xf7fff0, 4); light.position.set(-3,4,5); scene.add(light);
  const limeLight = new T.PointLight(0xccff00, 20, 12); limeLight.position.set(2,0,3); scene.add(limeLight);
  const coldLight = new T.PointLight(0x63d1ed, 9, 10); coldLight.position.set(-3,-1,1); scene.add(coldLight);
  const metal = new T.MeshStandardMaterial({color:0xa1ada6, metalness:1, roughness:.2, envMapIntensity:1.5});
  const darkMetal = new T.MeshStandardMaterial({color:0x3c453f, metalness:.95, roughness:.24, envMapIntensity:1.9});
  const bright = new T.MeshStandardMaterial({color:0xccff00, emissive:0x6a9200, emissiveIntensity:.65, metalness:.4, roughness:.3});
  const rings = new T.Group(); root.add(rings);
  const outer = new T.Mesh(new T.TorusGeometry(2.03,.23,24,160),metal); outer.rotation.set(.72,-.28,-.65); rings.add(outer);
  const middle = new T.Mesh(new T.TorusGeometry(1.58,.13,20,144),darkMetal); middle.rotation.set(-.45,1.05,.2); rings.add(middle);
  const inner = new T.Mesh(new T.TorusGeometry(1.12,.105,16,112),metal); inner.rotation.set(1.25,.48,-.2); rings.add(inner);
  const accent = new T.Mesh(new T.TorusGeometry(2.034,.241,16,64,1.12),bright); accent.rotation.copy(outer.rotation); rings.add(accent);
  const accent2 = new T.Mesh(new T.TorusGeometry(1.585,.14,14,44,.55),bright); accent2.rotation.copy(middle.rotation); accent2.rotateZ(2.4); rings.add(accent2);
  const fineRing = new T.Mesh(new T.TorusGeometry(2.55,.008,6,160),new T.MeshBasicMaterial({color:0x829177,transparent:true,opacity:.32})); fineRing.rotation.set(1.23,.3,-.3); root.add(fineRing);
  const crystalGeo = new T.IcosahedronGeometry(.69,1);
  const crystal = new T.Mesh(crystalGeo, new T.MeshPhysicalMaterial({color:0x738b2f,metalness:.65,roughness:.18,transparent:true,opacity:.7,clearcoat:1}));
  const edges = new T.LineSegments(new T.EdgesGeometry(crystalGeo),new T.LineBasicMaterial({color:0xccff00,transparent:true,opacity:.85}));
  const core = new T.Group(); core.add(crystal,edges); root.add(core);
  const halo = new T.Mesh(new T.IcosahedronGeometry(.78,1),new T.MeshBasicMaterial({color:0xb5e835,wireframe:true,transparent:true,opacity:.15}));core.add(halo);
  const shards = new T.Group();root.add(shards);
  const shardGeometry = new T.OctahedronGeometry(.11,0);
  for(let i=0;i<7;i++){
    const shard = new T.Mesh(shardGeometry,i%3===0?bright:metal);
    const a=i*2.399;const r=2.6+(i%2)*.28;
    shard.position.set(Math.cos(a)*r,Math.sin(a)*r*.8,Math.sin(a*1.3)*.8);
    shard.rotation.set(i,i*.7,i*.3);shard.scale.setScalar(i%2?.65:1.2);shards.add(shard);
  }
  const dots = new Float32Array(60*3);
  for(let i=0;i<60;i++){dots[i*3]=Math.sin(i*74.1)*4;dots[i*3+1]=Math.cos(i*43.3)*3;dots[i*3+2]=-1-Math.abs(Math.sin(i*19))*3;}
  const dotGeo=new T.BufferGeometry();dotGeo.setAttribute('position',new T.BufferAttribute(dots,3));
  scene.add(new T.Points(dotGeo,new T.PointsMaterial({size:.018,color:0x98a986,transparent:true,opacity:.5})));
  const pointer = new T.Vector2(0,0), eased = new T.Vector2(0,0), raycaster=new T.Raycaster();
  let intersecting=false,lost=false;
  hero.addEventListener('pointermove', e=>{
    if(!K.motion||e.pointerType==='touch')return;
    const rect=host.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));
    raycaster.setFromCamera(pointer,camera);intersecting=raycaster.intersectObject(root,true).length>0;
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{pointer.set(0,0);intersecting=false});
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=innerWidth<760?9:8.6;root.position.x=innerWidth<760?0:.35;camera.updateProjectionMatrix();if(!lost)renderer.render(scene,camera)}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const frame=K.addFrame(hero,(time,dt,moving)=>{
    if(lost)return;
    if(moving){
      eased.lerp(pointer,1-Math.exp(-dt*3));
      root.rotation.y=eased.x*.17;root.rotation.x=-eased.y*.12;
      root.position.y=.15+Math.sin(time*.48)*.12;
      rings.rotation.z=Math.sin(time*.14)*.2-.15;
      middle.rotation.z=.2+Math.sin(time*.25)*.3;
      accent2.rotation.copy(middle.rotation);accent2.rotateZ(2.4);
      inner.rotation.y=.48+Math.sin(time*.23)*.2;
      core.rotation.set(time*.09,time*.16,Math.sin(time*.2)*.2);
      crystal.scale.setScalar(1+Math.sin(time*.7)*.05);
      halo.scale.setScalar(1+Math.sin(time*.7+1)*.06);
      shards.rotation.z=time*.02;
      limeLight.intensity=T.MathUtils.lerp(limeLight.intensity,intersecting?30:20,.06);
    }
    renderer.render(scene,camera);
  });
  host.classList.add('webgl-ready');
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;frame.enable(false);host.classList.remove('webgl-ready')});
  canvas.addEventListener('webglcontextrestored',()=>{lost=false;host.classList.add('webgl-ready');resize();frame.enable(true)});
  const gyroButton=document.getElementById('gyro-button');
  if('DeviceOrientationEvent' in window && matchMedia('(pointer:coarse)').matches){
    gyroButton.hidden=false;let enabled=false;
    const onTilt=e=>{if(K.motion){pointer.x=K.clamp((e.gamma||0)/40,-1,1);pointer.y=K.clamp(((e.beta||0)-40)/50,-1,1)}};
    gyroButton.addEventListener('click',async()=>{
      if(enabled){window.removeEventListener('deviceorientation',onTilt);enabled=false;pointer.set(0,0);gyroButton.textContent='Enable motion tilt ↗';return}
      try {const permission=typeof DeviceOrientationEvent.requestPermission==='function'?await DeviceOrientationEvent.requestPermission():'granted';if(permission!=='granted'){gyroButton.textContent='Motion permission declined';return}window.addEventListener('deviceorientation',onTilt,{passive:true});enabled=true;gyroButton.textContent='Disable motion tilt ×'}
      catch{gyroButton.textContent='Motion tilt unavailable'}
    });
  }
})();
