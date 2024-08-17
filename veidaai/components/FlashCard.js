import React, { useState, useEffect } from 'react';
import './flashcard-component.css';

export default function FlashCard({card}) {
    const [flipped, setFlipped] = useState(false);

    function handleClick() {
        setFlipped(!flipped);
    }

    // useEffect will set flipped to false if the card is changed
    useEffect(()=>{setFlipped(false)}, [card]);

    return (
        <div id="card-container" onClick={()=>handleClick()}>
            <div id="card-front" style={{display: flipped ? 'none' : 'inline'}}>
                <p>{card.front}</p>
            </div>

            <div id="card-back" style={{display: flipped ? 'inline' : 'none'}}>
                <p>{card.back}</p>
            </div>
        </div>
    )
}