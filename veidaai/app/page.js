"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import * as THREE from 'three';
import RINGS from 'vanta/dist/vanta.rings.min';
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const vantaRef = useRef(null);

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

  return (
    <div ref={vantaRef} className={styles.vantaContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.main}>
          <section className={styles.hookSection}>
            <div className={styles.hookText}>
              <h1>Professors Hate Us. Skip Classes. Ace Finals.</h1>
              <p>Meet Veida AI — your all-in-one secret academic weapon. Summarize your lectures, generate study plans, and track your progress. No more stress. No more confusion. Sign-Up now and revolutionize your learning experience!</p>
              <button onClick={() => router.push('/client')}>Get Started for Free</button>
            </div>
            <div className={styles.hookImage}>
              {/* Add your image or animation here */}
            </div>
          </section>
          <section className={styles.featuresSection}>
            <div className={styles.featuresText}>
              <h2>Features</h2>
            </div>
            <div className={styles.featuresImage}>
              {/* Add your image or animation here */}
            </div>
          </section>
          <section className={styles.howItWorksSection}>
            <div className={styles.howItWorksImage}>
              {/* Add your image or animation here */}
            </div>
            <div className={styles.howItWorksText}>
              <h2>How it Works</h2>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}