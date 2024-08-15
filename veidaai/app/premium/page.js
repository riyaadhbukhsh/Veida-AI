import { auth } from "@clerk/nextjs/server"; // Import auth for server-side authentication
import { redirect } from 'next/navigation'; // Import redirect for navigation
import CheckoutButton from './checkoutbutton'; // Import the client component

const PremiumPage = async () => {
  const { userId } = auth(); // Get userId from the request

  if (!userId) {
    // Redirect to sign-in if not authenticated
    redirect('/sign-in');
  }

  return (
    <div>
      <h1>Premium Access</h1>
      <p>Subscribe for $10/month for premium features.</p>
      <CheckoutButton clerkId={userId} /> {/* Pass clerkId to the client component */}
    </div>
  );
};

export default PremiumPage;