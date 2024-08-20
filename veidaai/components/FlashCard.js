import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
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

    const cleanText = (text) => {
        return text
            .replace(/[*_~`#>!-]/g, '') // Remove common markdown symbols
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove Markdown links but keep the link text
            .replace(/!\[(.*?)\]\(.*?\)/g, '$1') // Remove Markdown image links but keep the alt text
            .replace(/`{1,2}([^`]*)`{1,2}/g, '$1') // Remove inline code formatting
            .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough formatting
            .replace(/^\s+|\s+$/g, '') // Trim leading and trailing whitespace
            .replace(/\n{2,}/g, '\n'); // Replace multiple newlines with a single newline
    };

    const parseTextWithLatex = (text) => {
        const parts = text.split(/(\\\(.*?\\\))/g).filter(Boolean);
    
        return parts.map((part, index) => {
            if (part.startsWith('\\(') && part.endsWith('\\)')) {
                const nextPart = parts[index + 1];
                const spaceAfterLatex = nextPart && !/^[?.]/.test(nextPart) ? ' ' : '';
                
                return (
                    <span key={index}>
                        {' '}
                        <span
                            dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(2, -2), { throwOnError: false }) }}
                        />
                        {spaceAfterLatex}
                    </span>
                );
            }
            // Clean the non-LaTeX part
            return <span key={index}>{cleanText(part)}</span>;
        });
    };
    

    const sizeClass = size === 'large' ? 'card-large' : '';

    return (
        <div id="card-container" className={`${flipped ? 'flipped' : ''} ${sizeClass}`} onClick={handleClick}>
            <div id="card-front">
                <p>{parseTextWithLatex(card.front)}</p>
            </div>
            <div id="card-back">
                <p>{parseTextWithLatex(card.back)}</p>
            </div>
        </div>
    );
});

FlashCard.displayName = 'FlashCard';

export default FlashCard;
