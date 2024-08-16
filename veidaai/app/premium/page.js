import { auth } from "@clerk/nextjs/server";
import { redirect } from 'next/navigation';
import CheckoutButton from './checkoutbutton';
import CancelButton from './cancelbutton';
import './premium.css';

const PremiumPage = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const res = await fetch(`https://veida-ai-backend-production.up.railway.app/api/check_premium_status?clerk_id=${userId}`);
  const data = await res.json();
  const isPremium = data.premium;

  if (isPremium) {
    return (
      <div className="premium-page">
        <h1 className="premium-title">Cancel Premium Subscription</h1>
        <p className="premium-description">
          You are currently subscribed to the premium plan. Warning, clicking the following button will cancel the subscription TODAY, and you will not have access to premium features.
        </p>
        <CancelButton clerkId={userId} className="cancel-button" />
      </div>
    );
  } else {
    return (
      <div className="premium-page">
        <h1 className="premium-title">Premium Access</h1>
        <p className="premium-description">Subscribe for $10/month for premium features.</p>
        <CheckoutButton clerkId={userId} />
      </div>
    );
  }
};

export default PremiumPage;