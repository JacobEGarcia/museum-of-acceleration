import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas=document.querySelector('#world');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8)); renderer.setSize(innerWidth,innerHeight); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene(); scene.fog=new THREE.FogExp2(0x080a09,.042);
const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,100); camera.position.set(9,4.7,12.5);
const controls=new OrbitControls(camera,canvas); controls.enableDamping=true; controls.dampingFactor=.06; controls.autoRotate=true; controls.autoRotateSpeed=.36; controls.target.set(1,.35,0); controls.minDistance=7; controls.maxDistance=22; controls.maxPolarAngle=Math.PI*.76;
scene.add(new THREE.HemisphereLight(0xb6d1c7,0x080908,1.25));
const key=new THREE.DirectionalLight(0xe8ffe3,5); key.position.set(3,7,6); scene.add(key);
const rim=new THREE.PointLight(0xd9ff43,28,18); rim.position.set(-4,2,-4); scene.add(rim);
const warm=new THREE.PointLight(0xff8a45,12,12); warm.position.set(5,-2,4); scene.add(warm);

const machine=new THREE.Group(); machine.rotation.z=-.04; scene.add(machine);
const parts=[]; const labels=[];
const MAT={dark:new THREE.MeshStandardMaterial({color:0x151a17,metalness:.84,roughness:.29}), metal:new THREE.MeshStandardMaterial({color:0x7c817b,metalness:.95,roughness:.18}), pale:new THREE.MeshStandardMaterial({color:0xc7cbc1,metalness:.7,roughness:.22}), acid:new THREE.MeshStandardMaterial({color:0xd9ff43,emissive:0x566800,emissiveIntensity:1.2,metalness:.3,roughness:.3}), copper:new THREE.MeshStandardMaterial({color:0xa4512c,metalness:.88,roughness:.28}), glass:new THREE.MeshPhysicalMaterial({color:0xaad4cc,transmission:.68,opacity:.52,transparent:true,roughness:.1,metalness:.05,thickness:.8}), black:new THREE.MeshStandardMaterial({color:0x050706,metalness:.65,roughness:.3})};
function mesh(geo,mat,pos=[0,0,0],rot=[0,0,0],parent=machine){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function edges(m,color=0x434943,opacity=.45){const l=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,18),new THREE.LineBasicMaterial({color,transparent:true,opacity}));l.position.copy(m.position);l.rotation.copy(m.rotation);l.scale.copy(m.scale);m.parent.add(l);return l}
function group(id,name,desc,axis,home){const g=new THREE.Group();g.userData={id,name,desc,axis:new THREE.Vector3(...axis),home:new THREE.Vector3(...home)};g.position.copy(g.userData.home);machine.add(g);parts[id]=g;return g}
function addLabel(id,text,obj){const el=document.createElement('div');el.className='label';el.innerHTML=`<b>${String(id).padStart(2,'0')}</b>${text}`;document.querySelector('#labels').append(el);labels.push({el,obj,id});}
function torus(r,t,pos,rot,parent,mat=MAT.metal){return mesh(new THREE.TorusGeometry(r,t,10,48),mat,pos,rot,parent)}

// 01 plasma light source
const g1=group(1,'PLASMA LIGHT SOURCE','Tin droplets meet a pulsed laser. A brief plasma releases light at 13.5 nanometers.','-1,0,0'.split(',').map(Number),[-3.1,.1,0]);
const src=mesh(new THREE.CylinderGeometry(.63,.63,1.75,32),MAT.dark,[0,0,0],[0,0,Math.PI/2],g1);edges(src); torus(.66,.07,[-.86,0,0],[0,Math.PI/2,0],g1,MAT.acid);torus(.66,.07,[.86,0,0],[0,Math.PI/2,0],g1,MAT.metal);
for(let i=0;i<16;i++){const a=i/16*Math.PI*2;mesh(new THREE.CylinderGeometry(.025,.025,1.55,6),i%4===0?MAT.copper:MAT.metal,[0,Math.cos(a)*.5,Math.sin(a)*.5],[0,0,Math.PI/2],g1)}
const orb=mesh(new THREE.SphereGeometry(.19,24,16),MAT.acid,[-.08,0,0],[],g1);addLabel(1,'PLASMA SOURCE',orb);

// 02 mirror train
const g2=group(2,'MULTILAYER MIRROR TRAIN','Light crosses a sequence of precisely shaped reflective surfaces. Each handoff trades energy for control.','0,1,0'.split(',').map(Number),[-.7,.35,0]);
for(let i=0;i<5;i++){const x=(i-2)*.62,y=Math.sin(i*1.7)*.5,z=Math.cos(i*1.5)*.26;const r=.43-i*.025;const d=mesh(new THREE.CylinderGeometry(r,r,.095,40),i===2?MAT.acid:MAT.pale,[x,y,z],[Math.PI/2,(i-2)*.13,0],g2);torus(r+.045,.022,[x,y,z],[Math.PI/2,(i-2)*.13,0],g2,MAT.dark);if(i<4)mesh(new THREE.CylinderGeometry(.018,.018,.72,6),MAT.acid,[x+.31,y+.07,z],[0,0,Math.PI/2],g2)}
addLabel(2,'ZEISS-TYPE OPTICS',g2.children[4]);

// 03 mask stage
const g3=group(3,'RETICLE + MASK STAGE','A pattern becomes instruction. The reticle carries one layer of a chip, projected and reduced onto silicon.','0,1,0'.split(',').map(Number),[1.8,.6,0]);
const frame=mesh(new THREE.BoxGeometry(1.65,.16,1.25),MAT.dark,[0,0,0],[],g3);edges(frame,0xaab2a8,.5);const plate=mesh(new THREE.BoxGeometry(1.18,.08,.82),MAT.glass,[0,.13,0],[],g3);
for(let i=-4;i<=4;i++) for(let j=-3;j<=3;j++) if((i+j)%2===0) mesh(new THREE.BoxGeometry(.055,.018,.055),MAT.acid,[i*.11,.18,j*.11],[],g3);
for(const x of [-.94,.94]){mesh(new THREE.CylinderGeometry(.14,.14,.5,16),MAT.metal,[x,0,0],[Math.PI/2,0,0],g3);torus(.15,.025,[x,0,.25],[0,0,0],g3,MAT.copper)} addLabel(3,'RETICLE STAGE',plate);

// 04 wafer stage
const g4=group(4,'WAFER STAGE','A silicon wafer moves in nanometer-scale steps beneath the projection field. Layer follows layer.','1,-1,0'.split(',').map(Number),[3.8,-.2,0]);
const base=mesh(new THREE.CylinderGeometry(1.12,1.3,.38,48),MAT.dark,[0,0,0],[],g4);edges(base);const wafer=mesh(new THREE.CylinderGeometry(.88,.88,.04,64),MAT.glass,[0,.3,0],[],g4);torus(.89,.018,[0,.31,0],[Math.PI/2,0,0],g4,MAT.acid);
for(let i=-5;i<=5;i++)for(let j=-5;j<=5;j++)if(i*i+j*j<28)mesh(new THREE.BoxGeometry(.105,.012,.105),i%3===0?MAT.copper:MAT.metal,[i*.13,.34,j*.13],[],g4);addLabel(4,'300 MM WAFER',wafer);

// 05 vacuum vessel shell ribs
const g5=group(5,'VACUUM VESSEL','EUV light is absorbed by air. The optical path lives inside a controlled vacuum, wrapped in sensing and thermal systems.','0,0,-1'.split(',').map(Number),[.35,-.35,0]);
for(const x of [-2.4,-1.2,0,1.2,2.4]) torus(1.12,.045,[x,0,0],[0,Math.PI/2,0],g5,MAT.metal);
for(let i=0;i<8;i++){const a=i/8*Math.PI*2;mesh(new THREE.CylinderGeometry(.018,.018,4.8,6),MAT.metal,[0,Math.cos(a)*1.12,Math.sin(a)*1.12],[0,0,Math.PI/2],g5)}
const shield=mesh(new THREE.CylinderGeometry(1.16,1.16,4.9,48,1,true,0,Math.PI*.72),MAT.glass,[0,0,0],[0,0,Math.PI/2],g5);shield.material=MAT.glass;addLabel(5,'VACUUM ENVELOPE',g5.children[1]);

// 06 compute racks
const g6=group(6,'METROLOGY + COMPUTE','Sensors close the loop. Position, temperature, vibration and exposure are measured, predicted and corrected continuously.','0,-1,0'.split(',').map(Number),[.4,-1.8,-1.3]);
for(let i=0;i<3;i++){const rack=mesh(new THREE.BoxGeometry(.72,1.5,.62),MAT.black,[(i-1)*.85,0,0],[],g6);edges(rack);for(let r=0;r<7;r++){mesh(new THREE.BoxGeometry(.56,.08,.03),r===2&&i===1?MAT.acid:MAT.metal,[(i-1)*.85,.55-r*.18,.33],[],g6)}} addLabel(6,'CONTROL ARRAY',g6.children[1]);

// 07 power and cooling
const g7=group(7,'POWER + THERMAL','The invisible machine around the machine: power conditioning, coolant, pumps and heat exchange. Precision begins with stability.','0,0,1'.split(',').map(Number),[.2,-.4,1.55]);
for(let i=0;i<4;i++){const x=(i-1.5)*.65;mesh(new THREE.CylinderGeometry(.22,.22,1.15,20),i===1?MAT.copper:MAT.dark,[x,0,0],[Math.PI/2,0,0],g7);torus(.23,.018,[x,0,.57],[],g7,MAT.metal)}
const pipeCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-1.1,0,.4),new THREE.Vector3(-1.4,.6,.7),new THREE.Vector3(-.8,.9,1),new THREE.Vector3(.8,.9,1),new THREE.Vector3(1.2,.3,.5)]);mesh(new THREE.TubeGeometry(pipeCurve,48,.055,8,false),MAT.acid,[0,0,0],[],g7);addLabel(7,'THERMAL LOOP',g7.children.at(-1));

// particle field + floor
const pts=[];for(let i=0;i<900;i++)pts.push((Math.random()-.5)*34,(Math.random()-.5)*18,(Math.random()-.5)*24);const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0x9ba99e,size:.012,transparent:true,opacity:.34})));
const grid=new THREE.GridHelper(30,60,0x252b27,0x151916);grid.position.y=-3;grid.material.transparent=true;grid.material.opacity=.28;scene.add(grid);

const data=[['SYSTEM VIEW','A fictional extreme-ultraviolet lithography system, separated into its essential organs.'],...parts.slice(1).map(p=>[p.userData.name,p.userData.desc])];
let explode=.38,selected=0,targetExplode=.38;const slider=document.querySelector('#explode');
function setPart(id){selected=id;document.querySelectorAll('.chapters button').forEach((b,i)=>b.classList.toggle('active',i===id));document.querySelector('#partNo').textContent=String(id).padStart(2,'0');document.querySelector('#partTitle').textContent=data[id][0];document.querySelector('#partDesc').textContent=data[id][1];document.querySelector('#resetView').classList.toggle('visible',id!==0);parts.slice(1).forEach((p,i)=>{p.userData.selected=(i+1===id)});if(id){targetExplode=Math.max(explode,.52);slider.value=Math.round(targetExplode*100);camera.position.lerp(new THREE.Vector3(8,4,10),.3)}else targetExplode=slider.value/100;}
document.querySelectorAll('.chapters button').forEach(b=>b.onclick=()=>setPart(+b.dataset.part));document.querySelector('#resetView').onclick=()=>setPart(0);
slider.oninput=e=>{targetExplode=e.target.value/100;document.querySelector('#percent').textContent=e.target.value+'%';slider.style.setProperty('--fill',e.target.value+'%')};
document.querySelector('#autoRotate').onclick=e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.innerHTML=`<i></i> ORBIT: ${controls.autoRotate?'ON':'OFF'}`};
const panel=document.querySelector('#indexPanel');function togglePanel(on){panel.classList.toggle('open',on);panel.setAttribute('aria-hidden',!on)}document.querySelector('#aboutBtn').onclick=()=>togglePanel(true);document.querySelector('#closePanel').onclick=()=>togglePanel(false);

const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();canvas.addEventListener('pointerup',e=>{if(Math.abs(e.movementX)>4)return;mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);const hits=ray.intersectObjects(parts.slice(1),true);if(hits.length){let o=hits[0].object;while(o.parent!==machine)o=o.parent;setPart(o.userData.id)}});
let last=performance.now(),frames=0,fpsTime=last;
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;explode+=(targetExplode-explode)*Math.min(1,dt*4.5);parts.slice(1).forEach((p,i)=>{const amt=explode*(1.35+i*.12);const goal=p.userData.home.clone().addScaledVector(p.userData.axis,amt);p.position.lerp(goal,.09);const s=p.userData.selected?1.1:(selected?0.94:1);p.scale.lerp(new THREE.Vector3(s,s,s),.1);p.traverse(o=>{if(o.material&&o.material.opacity!==undefined&&o.material!==MAT.glass)o.material.opacity=selected&&!p.userData.selected?.42:1})});
controls.update();machine.rotation.y+=Math.sin(now*.00023)*.00006;
labels.forEach(l=>{const v=new THREE.Vector3();l.obj.getWorldPosition(v);v.project(camera);l.el.style.left=((v.x*.5+.5)*innerWidth)+'px';l.el.style.top=((-v.y*.5+.5)*innerHeight)+'px';l.el.style.opacity=(selected===0||selected===l.id)&&v.z<1?'1':'0'});
renderer.render(scene,camera);frames++;if(now-fpsTime>900){document.querySelector('#fps').textContent=Math.round(frames*1000/(now-fpsTime))+' FPS';frames=0;fpsTime=now}}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
setTimeout(()=>document.querySelector('#boot').classList.add('hide'),1500);
