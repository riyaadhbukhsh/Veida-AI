'use client';

import { SignIn } from "@clerk/nextjs";

export default function SignInComponent() {
  return (
    <SignIn 
      routing="path" 
      path="/login" 
      afterSignInUrl="/"
      appearance={{
        elements: {
          formButtonPrimary: {
            backgroundColor: '#4a90e2',
            '&:hover': { backgroundColor: '#2e5d9e' },
          },
        },
      }}
    />
  );
}