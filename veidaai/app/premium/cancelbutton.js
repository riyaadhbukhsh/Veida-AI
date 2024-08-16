"use client"; // This is a client component

import React from "react";

const CancelButton = ({ clerkId }) => {
  const handleCancelSubscription = async () => {
    const response = await fetch('http://localhost:8080/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clerk_id: clerkId }),
    });

    if (response.ok) {
      // Subscription canceled successfully, redirect to a confirmation page
      window.location.href = '/';
    } else {
      // Handle error case
      console.error('Failed to cancel subscription');
    }
  };

  return (
    <button onClick={handleCancelSubscription}>Cancel Subscription</button>
  );
};

export default CancelButton;