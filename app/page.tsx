"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Rotation = { x: number; y: number; z: number };
const depthLayers = [-14,-10,-6,-2,2,6,10,14];
const constellations = [
  {left:"8%",top:"17%",scale:.82,points:[[3,35],[42,12],[68,44],[112,20],[145,58]],links:[[0,1],[1,2],[2,3],[3,4],[1,3]]},
  {left:"73%",top:"13%",scale:.68,points:[[0,42],[35,8],[72,30],[105,4],[137,48],[92,72]],links:[[0,1],[1,2],[2,3],[2,4],[4,5]]},
  {left:"12%",top:"73%",scale:.7,points:[[4,8],[28,42],[72,28],[104,68],[142,50]],links:[[0,1],[1,2],[2,3],[3,4],[2,4]]},
  {left:"77%",top:"70%",scale:.85,points:[[0,54],[36,22],[70,48],[102,8],[145,34]],links:[[0,1],[1,2],[2,3],[3,4]]},
];

export default function Home() {
  const [readout, setReadout] = useState<Rotation>({ x: -18, y: 34, z: 0 });
  const [dragging, setDragging] = useState(false);
  const rotation = useRef<Rotation>({ x: -18, y: 34, z: 0 });
  const starRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, y: 0, rotation: { x: 0, y: 0, z: 0 } });
  const animation = useRef<number | null>(null);
  const stars = useMemo(() => Array.from({ length: 44 }, (_, i) => ({
    left: `${(i * 37.17 + 7) % 100}%`, top: `${(i * 61.73 + 3) % 96}%`,
    size: i % 9 === 0 ? 2 : 1, delay: `${(i % 11) * -.7}s`,
  })), []);
  const stopAnimation = useCallback(() => {
    if (animation.current) cancelAnimationFrame(animation.current);
    animation.current = null;
  }, []);
  const applyRotation = useCallback((next: Rotation) => {
    rotation.current = next;
    if (starRef.current) starRef.current.style.transform = `rotateX(${next.x}deg) rotateY(${next.y}deg)`;
  }, []);
  useEffect(() => () => stopAnimation(), [stopAnimation]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    stopAnimation(); event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, rotation: { ...rotation.current } };
    setDragging(true);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y;
    applyRotation({ x: drag.current.rotation.x - dy * .55, y: drag.current.rotation.y + dx * .55, z: 0 });
  };
  const toss = useCallback(() => {
    stopAnimation(); const start = performance.now(); const from = { ...rotation.current };
    const to = { x: from.x + 360 + Math.random()*360, y: from.y + 360 + Math.random()*360, z: 0 };
    const tick = (now: number) => {
      const t = Math.min((now-start)/1350, 1), eased = 1-Math.pow(1-t,4);
      applyRotation({ x: from.x+(to.x-from.x)*eased, y: from.y+(to.y-from.y)*eased, z: 0 });
      if (t < 1) animation.current = requestAnimationFrame(tick); else setReadout({ ...rotation.current });
    };
    animation.current = requestAnimationFrame(tick);
  }, [applyRotation, stopAnimation]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space") { event.preventDefault(); toss(); }
      let next: Rotation | null = null;
      if (event.key === "ArrowUp") next={...rotation.current,x:rotation.current.x-10};
      if (event.key === "ArrowDown") next={...rotation.current,x:rotation.current.x+10};
      if (event.key === "ArrowLeft") next={...rotation.current,y:rotation.current.y-10};
      if (event.key === "ArrowRight") next={...rotation.current,y:rotation.current.y+10};
      if (event.key.toLowerCase() === "r") next={x:-18,y:34,z:0};
      if (next) { applyRotation(next); setReadout(next); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [applyRotation, toss]);

  return <main>
    <div className="nebula-field" aria-hidden="true"/>
    <div className="constellations" aria-hidden="true">{constellations.map((c,ci)=><div className="constellation" key={ci} style={{left:c.left,top:c.top,scale:c.scale}}>
      {c.links.map(([a,b],i)=>{const p=c.points[a],q=c.points[b],dx=q[0]-p[0],dy=q[1]-p[1];return <i key={i} style={{left:p[0],top:p[1],width:Math.hypot(dx,dy),transform:`rotate(${Math.atan2(dy,dx)*180/Math.PI}deg)`}}/>})}
      {c.points.map(([x,y],i)=><b key={i} style={{left:x,top:y}}/>)}
    </div>)}</div>
    <div className="stars" aria-hidden="true">{stars.map((s,i)=><i key={i} style={{left:s.left,top:s.top,width:s.size,height:s.size,animationDelay:s.delay}} />)}</div>
    <header><span>FORM / 02</span><span className="status"><i /> FREE ROTATION</span></header>
    <section className="stage-copy"><p>A CELESTIAL FORM</p><h1>Wish upon.<br/>Turn it.</h1></section>
    <div className={`stage ${dragging?"is-dragging":""}`} role="application" aria-label="Interactive compass star fixed in the center. Drag north, south, east, west, or diagonally to rotate."
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={()=>{setReadout({...rotation.current});setDragging(false)}} onPointerCancel={()=>setDragging(false)} onContextMenu={e=>e.preventDefault()}>
      <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
      <div ref={starRef} className="celestial-star" style={{transform:"rotateX(-18deg) rotateY(34deg)"}}>
        {depthLayers.map((depth,i)=><span key={depth} className={`compass-face ${i===depthLayers.length-1?"compass-front":""}`} style={{transform:`translate3d(-50%,-50%,${depth}px)`}}><i/></span>)}
        <span className="star-disc star-disc-front"/><span className="star-disc star-disc-back"/>
      </div>
    </div>
    <aside><button onClick={toss}>MIX BOTH AXES <span>✦</span></button><p>DRAG N / S / E / W<br/><b>DIAGONAL DRAG</b> MIXES AXES<br/>ARROW KEYS ALSO ROTATE</p></aside>
    <footer><span>N·S {Math.round(readout.x)}°</span><span>E·W {Math.round(readout.y)}°</span></footer>
  </main>;
}
