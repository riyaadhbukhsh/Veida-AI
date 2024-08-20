"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import { useParams } from 'next/navigation';
import FlashCard from '@/components/FlashCard';
import { unformatURL } from '@/app/helpers';
import { FaArrowLeft } from 'react-icons/fa';
import './flashcards-page.css';

function FlashcardPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [reviewing, setReviewing] = useState(false);
  const [currentCard, setCurrentCard] = useState({card: null, index: null});
  const [error, setError] = useState('');
  const { userId } = useAuth();
  const flashcardRef = useRef(); // Add this line

  const params = useParams();
  const urlCourseName = params['course-name'];
  const courseName = unformatURL(urlCourseName); 

  const handleNextCard = useCallback(() => {
    let newIndex = (currentCard.index + 1) % flashcards.length;
    setCurrentCard({card: flashcards[newIndex], index: newIndex});
  }, [currentCard, flashcards]);

  const handlePrevCard = useCallback(() => {
    let newIndex = (currentCard.index - 1 + flashcards.length) % flashcards.length;
    setCurrentCard({card: flashcards[newIndex], index: newIndex});
  }, [currentCard, flashcards]);

  const handleKeyDown = useCallback((event) => {
    if (reviewing) {
      switch(event.key) {
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
      const response = await fetch(`https://veida-ai-backend-production.up.railway.app/api/get_flashcards?clerk_id=${userId}&course_name=${courseName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFlashcards(data.flashcards);
        setCurrentCard({card: data.flashcards[0], index: 0});
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
    <div className="main-inline">
      <div className="center-flex-container">
        <Link href={`/${courseName}`} title={`back to ${courseName}`} className="back-arrow-link"><FaArrowLeft/></Link>
        <h1 className="title">
          {reviewing ? `${courseName} Flashcard Review` : `Your Flashcards Generated for ${courseName}`}
        </h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {reviewing ? (
          <>
            <div id="review-container" className="center-flex-container">
              <span>
                <button id="review-button" className="basic-button" onClick={() => setReviewing(false)}>
                  End review
                </button>
                <button id="review-button" className="basic-button" onClick={handleNextCard}>
                  Next Card
                </button>
              </span>
              <FlashCard card={currentCard.card} />
              <p>{`Card ${currentCard.index + 1}/${flashcards.length}`}</p>
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
          </>
        ) : (
          <div id="cards-available">
            {flashcards.length > 0 ? (
              <>
                <button className="start-review-button" onClick={() => setReviewing(true)}>
                  Start Reviewing
                </button>
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
    </div>
  );
}

export default FlashcardPage;