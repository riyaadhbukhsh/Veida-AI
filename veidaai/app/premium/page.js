import { auth } from "@clerk/nextjs/server"; // Import auth for server-side authentication
import { redirect } from 'next/navigation'; // Import redirect for navigation
import CheckoutButton from './checkoutbutton'; // Import the client component
import CancelButton from './cancelbutton'; // Import the cancel button client component

const PremiumPage = async () => {
  const { userId } = auth(); // Get userId from the request

  if (!userId) {
    // Redirect to sign-in if not authenticated
    redirect('/sign-in');
  }

  // Fetch the user's premium status from the server
  const res = await fetch(`http://localhost:8080/api/check_premium_status?clerk_id=${userId}`);
  const data = await res.json();
  const isPremium = data.premium;

  if (isPremium) {
    // Render the cancel subscription page for premium users
    return (
      <div>
        <h1>Cancel Premium Subscription</h1>
        <p>You are currently subscribed to the premium plan. Warning, clicking the following button will cancel the subscription TODAY, and you will not have access to premium features.</p>
        <CancelButton clerkId={userId} /> {/* Use the client component */}
      </div>
    );
  } else {
    // Render the premium access page for non-premium users
    return (
      <div>
        <h1>Premium Access</h1>
        <p>Subscribe for $10/month for premium features.</p>
        <CheckoutButton clerkId={userId} />
      </div>
    );
  }
};

export default PremiumPage;