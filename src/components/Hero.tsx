import { useEffect, useRef, useState } from 'react'
import { gsap, motion, scrollToTarget } from '../lib/motion'
import { profile, offCourt } from '../data'
import Magnetic from './Magnetic'
import PlayerCard from './PlayerCard'

const roles = ['Software Engineer', 'Full-Stack Developer', 'Teaching & Research Assistant', 'HYROX Athlete', 'Hooper']

function Split({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} className="char-mask" aria-hidden>
          <span className="char">{c === ' ' ? ' ' : c}</span>
        </span>
      ))}
    </span>
  )
}

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [role, setRole] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setRole((r) => (r + 1) % roles.length), 2400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero .char', { yPercent: 115, rotate: 12, duration: 1.4, stagger: 0.035 })
        .from('.hero-kicker > *', { y: 20, opacity: 0, stagger: 0.08, duration: 1 }, 0.3)
        .from('.hero-sub, .hero-ctas, .hero-meta', { y: 30, opacity: 0, stagger: 0.1, duration: 1.2 }, 0.6)
        .from('.hero-ticker', { yPercent: 100, duration: 1.2 }, 0.8)
        .from('.pcard-wrap', { y: 220, rotateY: -180, rotateZ: -12, opacity: 0, duration: 1.8 }, 0.5)

      // drives the 3D ball + parallax as the hero scrolls away
      gsap.to(motion, {
        hero: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero-title', {
        yPercent: -40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 20%', scrub: true },
      })
      // scroll-out lives on the inner card so it doesn't fight the intro tween on the wrapper
      gsap.to('.pcard', {
        yPercent: -60,
        rotateZ: 8,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 30%', scrub: true },
      })
      gsap.to('.hero-title-line:nth-child(2)', {
        xPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [ready])

  return (
    <section ref={root} className="hero" id="top">
      <div className="hero-kicker">
        <span className="pill pill-live">
          <i /> Open to opportunities
        </span>
        <span className="mono">{profile.location} · 4.71°N 74.07°W</span>
      </div>

      <PlayerCard />

      <h1 className="hero-title">
        <Split className="hero-title-line" text={profile.first} />
        <Split className="hero-title-line outline" text={profile.last} />
      </h1>

      <div className="hero-bottom">
        <p className="hero-sub">
          I build software the way I train: <span className="accent">discipline, dedication, teamwork.</span>
          <br />
          <span className="hero-role" key={role}>
            {roles[role]}
          </span>
        </p>
        <div className="hero-ctas">
          <Magnetic>
            <button className="btn btn-primary" onClick={() => scrollToTarget('#shot')} data-cursor="PLAY">
              <span>Watch the shot ↓</span>
            </button>
          </Magnetic>
          <Magnetic>
            <button className="btn btn-ghost" onClick={() => scrollToTarget('#court')} data-cursor="VR">
              <span>Enter the VR court</span>
            </button>
          </Magnetic>
        </div>
        <div className="hero-meta mono">
          <span>GYM</span>
          <span>/</span>
          <span>HYROX</span>
          <span>/</span>
          <span>BASKETBALL</span>
          <span>/</span>
          <span>CODE</span>
        </div>
      </div>

      <div className="hero-ticker" aria-hidden>
        <div className="marquee-track">
          {[...offCourt, ...offCourt, ...offCourt].map((t, i) => (
            <span key={i}>
              {t} <b>✦</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
