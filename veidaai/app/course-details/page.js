"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import styles from './course.css';

export default function Home() {
  const router = useRouter();
  return (
    <div className={styles.main}>
        <p>This will be a dynamic page for course content</p>
    </div>
  );
}