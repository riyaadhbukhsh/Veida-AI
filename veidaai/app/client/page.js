import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import "./client.css";

const ClientPage = async () => {
   const { userId } = auth();
    const isAuth = !!userId;
    const user = await currentUser();
    
    if (!isAuth) {
      return (
        <div className="client-page">
          <h1>Please sign in to access this page</h1>
        </div>
      );
  }
  return (
    <div className="client-page">
      Hello {user.username}, welcome to VeidaAI - This is the page you can only access because you are signed in.
    </div>
  );
};

export default ClientPage;