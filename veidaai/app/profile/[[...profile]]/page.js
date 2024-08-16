import React from "react";
import { UserProfile } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import "./page.css";

export default async function Profile() {
    const { userId } = auth();
    const isAuth = !!userId;
    
    if (!isAuth) {
        redirect('/sign-in');
    }

    return (
        <div>
           
            <div className="profile-container">
                <UserProfile />
            </div>
        </div>
    );
}