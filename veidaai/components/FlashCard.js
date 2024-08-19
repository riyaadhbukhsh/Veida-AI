import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './flashcard-component.css';

const FlashCard = forwardRef(({ card, size = 'normal' }, ref) => {
    const [flipped, setFlipped] = useState(false);

    function handleClick() {
        setFlipped(!flipped);
    }

    useImperativeHandle(ref, () => ({
        flip: () => setFlipped(!flipped)
    }));

    useEffect(() => {
        setFlipped(false);
    }, [card]);

    const removeAsterisks = (text) => {
        return text.replace(/^\*\*(.*)\*\*$/, '$1').trim();
    };

    const sizeClass = size === 'large' ? 'card-large' : '';

    return (
        <div id="card-container" className={`${flipped ? 'flipped' : ''} ${sizeClass}`} onClick={handleClick}>
            <div id="card-front">
                <p>{removeAsterisks(card.front)}</p>
            </div>
            <div id="card-back">
                <p>{removeAsterisks(card.back)}</p>
            </div>
        </div>
    );
});

FlashCard.displayName = 'FlashCard';

export default FlashCard;