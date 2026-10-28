import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { profile } from '../data'
import Magnetic from './Magnetic'

const words = ['BUILD', 'TRAIN', 'SHIP', 'WIN']

export default function Contact() {
  const root = useRef<HTMLElement>(null)
  const [w, setW] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setW((i) => (i + 1) % words.length), 1600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact-title > span', {
        yPercent: 100,
        stagger: 0.1,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.contact-title', start: 'top 85%' },
      })
      gsap.fromTo(
        '.contact-ball',
        { y: -400, scale: 0.6 },
        { y: 0, scale: 1, ease: 'bounce.out', duration: 1.8, scrollTrigger: { trigger: '.contact', start: 'top 60%' } },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section ref={root} className="section contact" id="contact">
      <div className="contact-ball" aria-hidden />
      <span className="eyebrow mono">POST-GAME</span>
      <h2 className="contact-title">
        <span>LET&apos;S</span>
        <span className="contact-word" key={w}>
          {words[w]}
        </span>
        <span className="outline">TOGETHER.</span>
      </h2>
      <p className="section-lead">
        Open to collaborations, internships and teams that like to ship. Always learning, always training.
      </p>
      <div className="contact-ctas">
        <Magnetic strength={0.5}>
          <button className="btn btn-primary btn-xl" onClick={copy} data-cursor={copied ? 'COPIED' : 'COPY'}>
            <span>{copied ? 'Email copied ✓' : profile.email}</span>
          </button>
        </Magnetic>
      </div>
      <div className="contact-links">
        {[
          ['GitHub', profile.github],
          ['LinkedIn', profile.linkedin],
          ['Portfolio', profile.portfolio],
          ['Download CV', profile.cv],
        ].map(([label, href]) => (
          <Magnetic key={label}>
            <a className="btn btn-ghost" href={href} target="_blank" rel="noreferrer">
              <span>{label} ↗</span>
            </a>
          </Magnetic>
        ))}
      </div>
      <footer className="footer mono">
        <span>© {new Date().getFullYear()} {profile.fullName}</span>
        <span>Built with React · Three.js · GSAP · WebXR · MediaPipe · Roboflow</span>
      </footer>
    </section>
  )
}
