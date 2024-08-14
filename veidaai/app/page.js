"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import styles from './page.module.css'

export default function Home() {
  const router = useRouter();
  return (
    <div className={styles.main}>
      <div className="title">
        Welcome to VeidaAI
      </div>
      <div>
        <button id="home-cta" onClick={()=>router.push('./client')}>
          Get Started
        </button>
      </div>
    </div>
  );
}