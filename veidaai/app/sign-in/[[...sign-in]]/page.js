import { SignIn } from "@clerk/nextjs";
import "./page.css";

export default function SignInPage() {
  return (
    <div className="sign-in-page">
        <SignIn afterSignOutUrl="/"/>
    </div>
    
  );
}