"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const FlashcardPage = ({ courseName }) => {
  const { userId } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [error, setError] = useState('');

  const fetchFlashcards = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/get_flashcards?clerk_id=${userId}&course_name=${courseName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFlashcards(data.flashcards);
      } else {
        setError('Failed to fetch flashcards');
      }
    } catch (err) {
      setError('An error occurred while fetching flashcards');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFlashcards();
    }
  }, [userId]);

  return (
    <div>
      <h1>Your Flashcards for {courseName}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {flashcards.length > 0 ? (
          flashcards.map((card) => (
            <div key={card.id} className="flashcard">
              <h3>{card.front}</h3>
              <p>{card.back}</p>
            </div>
          ))
        ) : (
          <p>No flashcards available.</p>
        )}
      </div>
    </div>
  );
};

export default FlashcardPage;