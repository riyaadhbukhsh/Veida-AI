"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { unformatURL } from '@/app/helpers';
import { FaArrowLeft } from 'react-icons/fa';
import FlashCard from '@/components/FlashCard';
import './flashcards-page.css';
import Loading from '../../components/loading';

//import styles from './details.css';



function ReviewAllFlashcardsPage() {

    
    const { userId } = useAuth();
    const [reviewing, setReviewing] = useState(false);
    const [pageExists, setPageExists] = useState(null);
    const [reviewFlashcards, setReviewFlashcards] = useState([]);
    const [currentCard, setCurrentCard] = useState({ card: null, index: null });
    const [error, setError] = useState('');
    const [frontSize, setFrontSize] = useState('1.3rem');
    const [backSize, setBackSize] = useState('1.3rem');
    const [frontIndex, setFront] = useState(null); 
    const [backIndex, setBack] = useState(null); 
    const [frontReviewSize, setFrontReviewSize] = useState('2.2rem');
    const [backReviewSize, setBackReviewSize] = useState('2.2rem');
    const [frontReviewIndex, setFrontReview] = useState(null); 
    const [backReviewIndex, setBackReview] = useState(null); 
    const params = useParams();
    const urlCourseName = params['course-name'];
    const courseName = unformatURL(urlCourseName);
    const flashcardRef = useRef();

    const handleNextCard = useCallback(() => {
        let newIndex = (currentCard.index + 1) % reviewFlashcards.length;
        setCurrentCard({ card: reviewFlashcards[newIndex], index: newIndex });
      }, [currentCard, reviewFlashcards]);
    
      const handlePrevCard = useCallback(() => {
        let newIndex = (currentCard.index - 1 + reviewFlashcards.length) % reviewFlashcards.length;
        setCurrentCard({ card: reviewFlashcards[newIndex], index: newIndex });
      }, [currentCard, reviewFlashcards]);

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

    const fetchDueFlashcards = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/get_due_flashcards?clerk_id=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data.due_flashcards)
                setReviewFlashcards(data.due_flashcards);
                setCurrentCard({ card: data.due_flashcards[0] || null, index: 0 });
            } else {
                setError('Failed to fetch flashcards');
            }
        } catch (err) {
            setError('An error occurred while fetching flashcards');
        }
    };

    useEffect(() => {
        if (userId) {
        fetchDueFlashcards();
    }
    }, [userId]);

    return (
        <div className="flashcard-page">
      {reviewing ? (
        
          <FaArrowLeft className="back-arrow-link" onClick={() => { 
            setReviewing(false); 
            fetchDueFlashcards(); 
          }}/>
        
      ) : (
        <Link href={`/client`} title={`back to client`} className="back-arrow-link">
          <FaArrowLeft onClick={() => { 
            setReviewing(false); 
          }}/>
        </Link>
      )}
      <h1 className="flashcard-title">
        {reviewing ? `Flashcard Review` : `Your Due Flashcards`}
      </h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
  
      {reviewing ? (
        <div id="review-container">
          <div className="review-flashcard">
            <FlashCard 
              ref={flashcardRef} 
              card={currentCard.card} 
              size="large" 
              frontStyle={currentCard.index === frontReviewIndex ? { fontSize: frontReviewSize } : {}} 
              backStyle={currentCard.index === backReviewIndex ? { fontSize: backReviewSize } : {}} 
            />
          </div>
          <div className="review-buttons">
            <button className="review-button" onClick={() => { setReviewing(false); fetchDueFlashcards(); }}>
              End Review
            </button>
            <button className="review-button" onClick={handlePrevCard}>
              Previous Card
            </button>
            <button className="review-button" onClick={handleNextCard}>
              Next Card
            </button>
          </div>
          <p className="card-counter">{`Card ${currentCard.index + 1}/${reviewFlashcards.length}`}</p>
        </div>
      ) : (
        <div id="cards-available">
          {reviewFlashcards && reviewFlashcards.length > 0 ? (
            <>
              <div className="button-container">
                <button className="start-review-button" onClick={() => { setReviewing(true); setCurrentCard({ card: reviewFlashcards[0], index: 0 }); }}>
                  Review all Flashcards
                </button>
                
              </div>
              <div id="cards-preview">
                {reviewFlashcards.map((card, index) => (
                  <FlashCard 
                    key={index} 
                    card={card} 
                    frontStyle={index === frontIndex ? { fontSize: frontSize } : {}} 
                    backStyle={index === backIndex ? { fontSize: backSize } : {}} 
                  />
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

export default ReviewAllFlashcardsPage;