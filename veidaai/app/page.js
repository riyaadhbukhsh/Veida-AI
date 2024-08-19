"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import * as THREE from 'three';
import RINGS from 'vanta/dist/vanta.rings.min';

export default function Home() {
  const router = useRouter();
  const vantaRef = useRef(null);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const vantaEffect = RINGS({
      el: vantaRef.current,
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x1e1e1e,
      backgroundColor: 0x1e1e1e
    });

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
          const sectionIndex = parseInt(entry.target.dataset.section);
          setCurrentSection(sectionIndex);
        }
      });
    }, { threshold: 0.5 });

    const elements = document.querySelectorAll(`.${styles.fullPageSection}`);
    elements.forEach((el, index) => {
      el.dataset.section = index;
      observer.observe(el);
    });

    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const sectionColors = [
    styles.section1BgColor,
    styles.section2BgColor,
    styles.section3BgColor,
  ];

  return (
    <div className={styles.main}>
      <div ref={vantaRef} className={styles.vantaContainer}></div>
      <div className={`${styles.contentContainer} ${sectionColors[currentSection]}`}>
        <section className={styles.hookSection}>
          <div className={styles.hookText}>
            <h1>Professors Hate Us. Skip Classes. Ace Finals.</h1>
            <p>Meet Veida AI — your all-in-one secret academic weapon. Summarize your lectures, generate study plans, and track your progress. No more stress. No more confusion. Sign-Up now and revolutionize your learning experience!</p>
            <button onClick={() => router.push('/client')} className={styles.ctaButton}>Get Started for Free</button>
          </div>
        </section>
      </div>
      <div className={styles.contentBelow}>
        <section className={styles.fullPageSection} data-section="0">
          <div className={styles.sectionInner}>
            <div className={styles.textContent}>
              <h2>Make flashcards fast</h2>
              <p>Description here...</p>
              <button className={styles.getStarted}>Get Started</button>
            </div>
            <div className={styles.graphicContent}>
              {/* Add your graphic/image here */}
            </div>
          </div>
        </section>
        
        <section className={`${styles.fullPageSection} ${styles.middleSection}`} data-section="1">
          <div className={styles.sectionInner}>
          <div className={styles.graphicContent}></div>
            <div className={styles.textContent}>
              <h2>Study using MCQs</h2>
              <p>Description here...</p>
              <button className={styles.getStarted}>Get Started</button>
            
            
              {/* Add your graphic/image here */}
            </div>
          </div>
        </section>
        
        <section className={styles.fullPageSection} data-section="2">
          <div className={styles.sectionInner}>
            <div className={styles.textContent}>
              <h2>Spaced retrieval</h2>
              <p>Description here...</p>
              <button className={styles.getStarted}>Get Started</button>
            </div>
            <div className={styles.graphicContent}>
              {/* Add your graphic/image here */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}