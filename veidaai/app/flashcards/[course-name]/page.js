"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import { useParams } from 'next/navigation';
import FlashCard from '@/components/FlashCard';
import { unformatURL } from '@/app/helpers';
import { FaArrowLeft } from 'react-icons/fa';
import { useNotification } from '../../../context/NotificationContext';
import './flashcards-page.css';

function FlashcardPage() {
    const [flashcards, setFlashcards] = useState([]);
    const [reviewing, setReviewing] = useState(false);
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
    const { userId } = useAuth();
    const flashcardRef = useRef();

    const params = useParams();
    const urlCourseName = params['course-name'];
    const courseName = unformatURL(urlCourseName);

    const [studyingToday, setStudyingToday] = useState(false);
    const [flashcardsDueToday, setFlashcardsDueToday] = useState(false);

    const { setHasNotification, setFlashcardsDue } = useNotification();

    const fetchFlashcardsDueToday = async () => {
        console.log('fetchFlashcardsDueToday called'); // Debugging
        try {
            const response = await fetch(`http://localhost:8080/api/get_flashcards_today?clerk_id=${userId}&course_name=${courseName}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Flashcards due today:', data.flashcards);
                setFlashcards(data.flashcards);
                setCurrentCard({ card: data.flashcards[0] || null, index: 0 });
                setReviewing(true);
                setStudyingToday(true);
                const hasDueFlashcards = data.flashcards.length > 0;
                setFlashcardsDueToday(hasDueFlashcards);
                console.log('Flashcards due today status:', hasDueFlashcards);
            } else {
                setError('Failed to fetch flashcards due today');
                setFlashcardsDueToday(false);
            }
        } catch (err) {
            setError('An error occurred while fetching flashcards due today');
            setFlashcardsDueToday(false);
        }
    };

    const handleEndSession = async () => {
        if (studyingToday) {
            try {
                const response = await fetch(`http://localhost:8080/api/remove_today_review_dates`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        clerk_id: userId,
                        course_name: courseName,
                    }),
                });
                if (!response.ok) {
                    console.error('Failed to remove today\'s review dates');
                } else {
                    console.log('Successfully removed today\'s review dates');
                }
            } catch (error) {
                console.error('Error removing today\'s review dates:', error);
            }
        }
        setReviewing(false);
        setStudyingToday(false);
        fetchFlashcards();

        setHasNotification(false);
        setFlashcardsDue(0);
    };

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
                console.log('All flashcards:', data.flashcards);
                setFlashcards(data.flashcards);
                setCurrentCard({ card: data.flashcards[0] || null, index: 0 });
            } else {
                setError('Failed to fetch flashcards');
            }
        } catch (err) {
            setError('An error occurred while fetching flashcards');
        }
    };

    const calculateFontSize = (spanElement, textElement, containerElement) => {
        const computedStyle = window.getComputedStyle(containerElement);
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);
        const maxWidth = containerElement.getBoundingClientRect().width - paddingLeft - paddingRight;
        const maxHeight = containerElement.getBoundingClientRect().height - paddingTop - paddingBottom;
        let fontSize = reviewing ? 2.2 : 1.3;
        textElement.style.fontSize = `${fontSize}rem`;

        while ((spanElement.getBoundingClientRect().width > maxWidth || spanElement.getBoundingClientRect().height > maxHeight) && fontSize > 0) {
            fontSize -= 0.05;
            textElement.style.fontSize = `${fontSize}rem`;
        }

        return fontSize + 'rem';
    };

    const adjustFontSizes = () => {
        document.querySelectorAll(".flashcard-page #card-container").forEach((cardContainer, index) => {
            const frontContainer = cardContainer.querySelector('#card-front');
            const backContainer = cardContainer.querySelector('#card-back');
            const frontElement = cardContainer.querySelector('#card-front p');
            const backElement = cardContainer.querySelector('#card-back p');
            const frontSpanElement = cardContainer.querySelector('#card-front p span');
            const backSpanElement = cardContainer.querySelector('#card-back p span');

            if (frontSpanElement) {
                const newFrontSize = calculateFontSize(frontSpanElement, frontElement, frontContainer);
                if (reviewing) {
                    setFrontSize(newFrontSize);
                    setFront(index);
                } else {
                    setFrontReviewSize(newFrontSize);
                    setFrontReview(index);
                }
            }

            if (backSpanElement) {
                const newBackSize = calculateFontSize(backSpanElement, backElement, backContainer);
                if (reviewing) {
                    setBackSize(newBackSize);
                    setBack(index);
                } else {
                    setBackReviewSize(newBackSize);
                    setBackReview(index);
                }
            }
        });
    };

    useEffect(() => {
        adjustFontSizes();
        window.addEventListener('resize', adjustFontSizes);
        return () => {
            window.removeEventListener('resize', adjustFontSizes);
        };
    }, [flashcards, currentCard]);

    useEffect(() => {
      if (userId) {
          fetchFlashcards();
      }
  }, [userId]);

    return (
        <div className="flashcard-page">
            {reviewing ? (
                <Link href={`/flashcards/${urlCourseName}`} title={`back to ${courseName}`} className="back-arrow-link">
                    <FaArrowLeft onClick={handleEndSession} />
                </Link>
            ) : (
                <Link href={`/${urlCourseName}`} title={`back to ${courseName}`} className="back-arrow-link">
                    <FaArrowLeft onClick={() => setReviewing(false)} />
                </Link>
            )}
            <h1 className="flashcard-title">
                {reviewing ? `${courseName} Flashcard Review` : `Your Flashcards for ${courseName}`}
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
                        <button className="review-button" onClick={handleEndSession}>
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
                    {flashcards && flashcards.length > 0 ? (
                        <>
                            <div className="button-container">
                                <button className="start-review-button" onClick={() => { setReviewing(true); setCurrentCard({ card: flashcards[0], index: 0 }); }}>
                                    Review all Flashcards
                                </button>
                                <button
                                className="start-review-button"
                                onClick={() => {
                                    console.log('Button clicked'); // Debugging
                                    fetchFlashcardsDueToday();
                                }}
                            >
                                Study Today's Flashcards
                            </button>
                            </div>
                            <div id="cards-preview">
                                {flashcards.map((card, index) => (
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

export default FlashcardPage;