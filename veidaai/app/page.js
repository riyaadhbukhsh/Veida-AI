"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import styles from './page.module.css';
import "./globals.css";
import * as THREE from 'three';
import RINGS from 'vanta/dist/vanta.rings.min';

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

    const resizeVanta = () => {
      vantaEffect.resize();
    };

    window.addEventListener('resize', resizeVanta);

    return () => {
      if (vantaEffect) vantaEffect.destroy();
      window.removeEventListener('resize', resizeVanta);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Veida AI - Revolutionizing Learning</title>
        <meta name="description" content="Veida AI is your all-in-one secret academic weapon, designed and developed by students, for students." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div ref={vantaRef} className={styles.vantaContainer}></div>
        <div className={styles.contentContainer}>
          <section className={styles.hookSection}>
            <div className={styles.hookText}>
              <h1 style={{textTransform: 'uppercase'}}>Professors Hate Us. Skip Classes. Ace Finals.</h1>
              <p style={{whiteSpace: "pre-line"}}>{"We\'re your all-in-one academic weapon. Summarize your lectures, generate study plans, and track your progress. No more stress. No more confusion.\n\nRevolutionize your learning experience!"}</p>
              <button  
                className={styles.ctaButton}
                onClick={() => router.push('/client')}
              >
                Get Started for Free
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}