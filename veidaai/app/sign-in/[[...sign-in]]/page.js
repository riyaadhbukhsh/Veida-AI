import { SignIn,ClerkProvider,SignedIn,SignedOut,UserButton } from "@clerk/nextjs";
import "./page.css";

export default function SignInPage() {
  return (
    <ClerkProvider>
       <div className="sign-in-page">
        <SignIn afterSignOutUrl="/"/>
      </div>
    </ClerkProvider>
    
    
  );
}