'use client'

import { useEffect, useRef } from 'react'
import { prefersReduced } from '@/lib/motion/tokens'

/**
 * "Mare liquido" — superficie marina WebGL (fbm domain-warp), palette
 * notte→mare con glint di sole, reattiva al cursore. Vedi docs/brand-system.md
 * §7.4. Resta scura per non compromettere la leggibilità del testo sopra.
 * Reduced-motion → 1 frame statico. Pausa fuori dal viewport. DPR ≤ 1.5.
 */
const FRAG = `precision mediump float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
 return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/u_res.xy;
 vec2 m=u_mouse/u_res.xy;
 float asp=u_res.x/u_res.y; uv.x*=asp; m.x*=asp;
 float t=u_time*0.05;
 vec2 q=uv*2.2;
 vec2 w=vec2(fbm(q+t), fbm(q+vec2(5.2,1.3)-t));
 float md=distance(uv,m);
 w+=0.30*exp(-md*4.0)*normalize(uv-m+0.0001);
 float n=fbm(q+1.8*w+t*0.6);
 vec3 notte=vec3(0.055,0.188,0.251);
 vec3 mare=vec3(0.082,0.376,0.486);
 vec3 sole=vec3(0.957,0.714,0.173);
 vec3 col=mix(notte,mare,smoothstep(0.25,0.7,n));
 col+=sole*0.16*smoothstep(0.74,0.93,n);
 col+=sole*0.20*exp(-md*5.0);
 gl_FragColor=vec4(col,1.0);
}`

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

export default function SeaCanvas({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let mx = 0
    let my = 0

    const resize = () => {
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr))
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      mx = canvas.width / 2
      my = canvas.height / 2
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mx = (e.clientX - r.left) * dpr
      my = (r.height - (e.clientY - r.top)) * dpr
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const draw = (timeMs: number) => {
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, timeMs / 1000)
      gl.uniform2f(uMouse, mx, my)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // Reduced-motion → un frame statico e basta.
    if (prefersReduced()) {
      draw(2000)
      return () => {
        ro.disconnect()
        window.removeEventListener('pointermove', onMove)
      }
    }

    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      if (visible && !raf) loop(performance.now())
    })
    io.observe(canvas)

    const loop = (t: number) => {
      draw(t)
      raf = visible ? requestAnimationFrame(loop) : 0
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
