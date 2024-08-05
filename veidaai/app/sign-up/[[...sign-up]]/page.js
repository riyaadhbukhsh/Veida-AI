import { SignUp } from "@clerk/nextjs";
import "./page.css";

export default function SignUpPage() {
  return (
    <div className="sign-up-page">
      <SignUp afterSignOutUrl="/"/>
    </div>
  );
}