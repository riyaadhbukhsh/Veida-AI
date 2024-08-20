"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from 'next/navigation';
import FlashCard from '@/components/FlashCard';
import { unformatURL } from '@/app/helpers';
import './flashcards-page.css';

function FlashcardPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [reviewing, setReviewing] = useState(false);
  const [currentCard, setCurrentCard] = useState({ card: null, index: null });
  const [error, setError] = useState('');
  const { userId } = useAuth();
  const flashcardRef = useRef();

  const params = useParams();
  const urlCourseName = params['course-name'];
  const courseName = unformatURL(urlCourseName);

  const handleNextCard = useCallback(() => {
    let newIndex = (currentCard.index + 1) % flashcards.length;
    setCurrentCard({ card: flashcards[newIndex], index: newIndex });
  }, [currentCard, flashcards]);

  const handlePrevCard = useCallback(() => {
    let newIndex = (currentCard.index - 1 + flashcards.length) % flashcards.length;
    setCurrentCard({ card: flashcards[newIndex], index: newIndex });
  }, [currentCard, flashcards]);

  const handleKeyDown = useCallback((event) => {
    if (reviewing) {
      switch (event.key) {
        case 'ArrowRight':
          handleNextCard();
          break;
        case 'ArrowLeft':
          handlePrevCard();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          flashcardRef.current.flip();
          break;
      }
    }
  }, [reviewing, handleNextCard, handlePrevCard]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
        console.log('Fetched flashcards:', data.flashcards); // Debugging log
        setFlashcards(data.flashcards);
        setCurrentCard({ card: data.flashcards[0] || null, index: 0 });
      } else {
        setError('Failed to fetch flashcards');
      }
    } catch (err) {
      setError('An error occurred while fetching flashcards');
    }
  };

  const fetchFlashcardsDueToday = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/get_flashcards_today?clerk_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched flashcards due today:', data.flashcards); // Debugging log
        setFlashcards(data.flashcards);
        setCurrentCard({ card: data.flashcards[0] || null, index: 0 });
        setReviewing(true);
      } else {
        setError('Failed to fetch flashcards due today');
      }
    } catch (err) {
      setError('An error occurred while fetching flashcards due today');
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchFlashcards();
    }
  }, [userId]);

  return (
    <div className="flashcard-page">
      <h1 className="flashcard-title">
        {reviewing ? `${courseName} Flashcard Review` : `Your Flashcards for ${courseName}`}
      </h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {reviewing ? (
        <div id="review-container">
          <div className="review-flashcard">
            <FlashCard ref={flashcardRef} card={currentCard.card} size="large" />
          </div>
          <div className="review-buttons">
            <button className="review-button" onClick={() => setReviewing(false)}>
              End Review
            </button>
            <button className="review-button" onClick={handlePrevCard}>
              Previous Card
            </button>
            <button className="review-button" onClick={handleNextCard}>
              Next Card
            </button>
          </div>
          <p className="card-counter">{`Card ${currentCard.index + 1}/${flashcards.length}`}</p>
        </div>
      ) : (
        <div id="cards-available">
          {flashcards.length > 0 ? (
            <>
              <div className="button-container">
                <button className="start-review-button" onClick={() => { setReviewing(true); setCurrentCard({ card: flashcards[0], index: 0 }); }}>
                  Review all Flashcards
                </button>
                <button className="start-review-button" onClick={fetchFlashcardsDueToday}>
                  Study Today's Flashcards
                </button>
              </div>
              <div id="cards-preview">
                {flashcards.map((card, index) => (
                  <FlashCard key={index} card={card} />
                ))}
              </div>
            </>
          ) : (
            <p>No flashcards available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default FlashcardPage;