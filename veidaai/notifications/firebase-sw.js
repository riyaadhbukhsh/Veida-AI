import {messaging, getToken, onMessage} from "../components/config/firebase";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from 'next/navigation';
import { unformatURL } from '@/app/helpers';


const sendTokenToServer = async (token) => {

    const { userId } = useAuth();
    const params = useParams();
    const urlCourseName = params.get('course-name');
    const courseName = unformatURL(urlCourseName);

    console.log("Token: ", token);
    try {
        const response = await fetch(`http://localhost:8080/api/store_fcm_token?clerk_id=${userId}&course_name=${courseName}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({fcm_token: token}),
        });
        if(!response.ok) {
            throw new Error("Failed to store token");
        }
      }catch(error) {
        console.log("Error: ", error);
      }
        
    
};

const requestPermission = async () => {

    
    try {
        const token = await getToken(messaging, {vapidKey: "BIOtk6FPLlCCQjTlKzmYL6j8M-WtNBc8GHieh5mlnjK-kvBIw3V7DPi__sEX0f1Ok8b1LN3sgGiZSdkF9T5rdmE"});

        if (token) {
            console.log('FCM Token:', token);
            sendTokenToServer(token);
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
    } catch (error) {
        console.log("Error: ", error);
    }
};
requestPermission();

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Customize notification here
});
