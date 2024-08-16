"use client"; // This is a client component

import React, { useState } from "react";
import "./premium.css";

const CancelButton = ({ clerkId }) => {
  const [confirmation, setConfirmation] = useState("");

  const handleCancel = async () => {
    if (confirmation !== "cancel my subscription") {
      alert("Please type the confirmation text correctly.");
      return;
    }

    const response = await fetch('https://veida-ai-backend-production.up.railway.app/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clerk_id: clerkId }),
    });

    if (response.ok) {
      window.location.href = '/';
    } else {
      alert("Failed to cancel subscription.");
    }
  };

  return (
    <div className="cancel-container">
      <p>Type &quot;cancel my subscription&quot; to confirm:</p>
      <input
        type="text"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        className="confirmation-input"
      />
      <button onClick={handleCancel} className="cancel-button">Cancel Subscription</button>
    </div>
  );
};

export default CancelButton;