"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import styles from './page.module.css';
import "./globals.css";
import { FaRegLightbulb, FaRegStickyNote, FaRegQuestionCircle, FaArrowLeft } from 'react-icons/fa';
import * as THREE from 'three';
import RINGS from 'vanta/dist/vanta.rings.min';

export default function Home() {
  const router = useRouter();
  const vantaRef = useRef(null);
  const [previewedFeatureId, setPreviewedFeatureId] = useState('flashcardPreview');

  // useEffect(() => {
  //   const vantaEffect = RINGS({
  //     el: vantaRef.current,
  //     THREE: THREE,
  //     mouseControls: true,
  //     touchControls: true,
  //     gyroControls: false,
  //     minHeight: 200.00,
  //     minWidth: 200.00,
  //     scale: 1.00,
  //     scaleMobile: 1.00,
  //     color: 0x1e1e1e,
  //     backgroundColor: 0x1e1e1e
  //   });

  //   const resizeVanta = () => {
  //     vantaEffect.resize();
  //   };

  //   window.addEventListener('resize', resizeVanta);

  //   return () => {
  //     if (vantaEffect) vantaEffect.destroy();
  //     window.removeEventListener('resize', resizeVanta);
  //   };
  // }, []);

  return (
    <>
      <Head>
        <title>Veida AI - Revolutionizing Learning</title>
        <meta name="description" content="We are your all-in-one secret academic weapon, designed and developed by students, for students." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <div className={styles.main}> */}
      <div> 
        {/*landing section*/}
        {/* <div ref={vantaRef} className={styles.vantaContainer}></div> */}
        {/* <div className={styles.contentContainer}> */}
        <div>  
          <section className={styles.hookSection}>
            <div className={styles.hookText}>
              <h1 style={{textTransform: 'uppercase'}}>Professors Hate Us. Skip Classes. Ace Finals.</h1>
              <p style={{whiteSpace: "pre-line"}}>{"We\'re your all-in-one academic weapon. Summarize your lectures, generate study plans, and track your progress. No more stress. No more confusion.\n\nRevolutionize your learning experience!"}</p>
              <button  
                // className={styles.ctaButton}
                className="primary"
                onClick={() => router.push('/client')}
              >
                Get Started for Free
              </button>
            </div>
          </section>
        </div>

        {/*1st feature section*/}
        <div className="container double-column-container" id={styles.uploadFeatureSection}>
          <div className="feature-column-text">
            <h2>Upload Your Lecture Material</h2>
            <p>We accept:<br/>txt, pdf, jpg, png</p>
            <button className="secondary">Upload your file</button>
          </div>
          <div className="feature-column-media">
            <img id={styles.uploadImg} src="data-or-cloud-migration.svg" alt="data-or-cloud-migration" width={630} height={340}/>
          </div>
        </div>

        {/*2nd feature section*/}
        <div className="container double-column-container">
          <h2 className="center">AI Generates your study material</h2>
          <p className="subtitle">main ideas & key details are identified to be used to create your interactive study methods</p>
          <div className="feature-column-text">
            <h2>Text Column</h2>
            <ul id={styles.featureMenu}>

              <li id="flashcardPreview" 
                  // assign className only if this li is currently selected
                  className={'flashcardPreview'.localeCompare(previewedFeatureId) == 0 ? styles.selectedFeaturePreview : null}
                  onClick={()=>setPreviewedFeatureId('flashcardPreview')}
              >
                {/* <img className={styles.neuronIcon} src="/neuron.svg" alt="neuron icon" width={35} height={35}/> */}
                <FaRegLightbulb className={styles.featurePreviewIcon} />
                flashcards
              </li>

              <li id="mcqPreview"// assign className only if this li is currently selected
                  className={'mcqPreview'.localeCompare(previewedFeatureId) == 0 ? styles.selectedFeaturePreview : null}
                  onClick={()=>setPreviewedFeatureId('mcqPreview')}
              >
                {/* <img className={styles.neuronIcon} src="/neuron.svg" alt="neuron icon" width={35} height={35}/> */}
                <FaRegQuestionCircle className={styles.featurePreviewIcon} />
                multiple choice questions
              </li>

              <li id="notesPreview" // assign className only if this li is currently selected
                  className={'notesPreview'.localeCompare(previewedFeatureId) == 0 ? styles.selectedFeaturePreview : null}
                  onClick={()=>setPreviewedFeatureId('notesPreview')}
              >
                {/* <img className={styles.neuronIcon} src="/neuron.svg" alt="neuron icon" width={35} height={35}/> */}
                <FaRegStickyNote className={styles.featurePreviewIcon} />
                outlined notes
              </li>

            </ul>
          </div>
          
          <div className="feature-column-media">
            <h2>[insert media here]</h2>
          </div>
        </div>x

        {/*3rd feature section*/}
        <div className="container double-column-container">
          <div className="feature-column-media">
            <h2>[insert media here]</h2>
          </div>

          <div className="feature-column-text right-align">
            <h2>Stay on schedule</h2>
            <p>We send study reminders so you can memorize the content in time for your exam</p>
            <button className="secondary">Create your study schedule</button>
          </div>
        </div>

        {/*plan comparison section*/}
        {/* <div>

        </div> 

        </div>*/}
      </div>
    </>
  );
}