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

    const convertMath = (text) => {
        if (typeof text !== 'string') return '';

        text = text.replace(/^\*\*\s*|\s*\*\*$/g, '').trim();
    
        const replacements = {
            '\\\\cdotp': '\\cdotp',
            '\\\\times': '\\times',
            '\\\\infty': '\\infty',
            '\\\\sqrt': '\\sqrt',
            '\\\\leq': '\\leq',
            '\\\\geq': '\\geq',
            '\\\\alpha': '\\alpha',
            '\\\\beta': '\\beta',
            '\\\\gamma': '\\gamma',
            '\\\\delta': '\\delta',
            '\\\\epsilon': '\\epsilon',
            '\\\\pi': '\\pi',
            '\\\\theta': '\\theta',
            '\\\\lambda': '\\lambda',
            '\\\\sigma': '\\sigma',
            '\\\\omega': '\\omega',
            '\\\\mu': '\\mu',
            '\\\\sin': '\\sin',
            '\\\\cos': '\\cos',
            '\\\\tan': '\\tan',
            '\\\\log': '\\log',
            '\\\\ln': '\\ln',
            '\\\\int': '\\int',
            '\\\\sum': '\\sum',
            '\\\\prod': '\\prod'
        };
    
        for (const [key, value] of Object.entries(replacements)) {
            text = text.replace(new RegExp(key, 'g'), `$${value}$`);
        }
    
        return text
            .replace(/\\\[(.*?)\\\]/gs, '$$ $1 $$')
            .replace(/\\\((.*?)\\\)/g, '$ $1 $')
            .replace(/\\{2}(.*?)\\{2}/g, '$$$$ $1 $$$$')
            .replace(/\$\$ +([^$]+) +\$\$/g, '$$ $1 $$') 
            .replace(/\$ +([^$]+) +\$/g, '$ $1 $') 
            .replace(/\s+/g, ' ')       
            .trim();    
    };    
    

    const parseTextWithLatex = (text) => {
        if (!text) return []; // Return empty array if text is undefined or null
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
            return <span key={index}>{convertMath(part)}</span>;
        });
    };
    

    const sizeClass = size === 'large' ? 'card-large' : '';

    return (
        <div id="card-container" className={`${flipped ? 'flipped' : ''} ${sizeClass}`} onClick={handleClick}>
            <div id="card-front">
                <p>{card && card.front ? parseTextWithLatex(card.front) : 'No content'}</p>
            </div>
            <div id="card-back">
                <p>{card && card.back ? parseTextWithLatex(card.back) : 'No content'}</p>
            </div>
        </div>
    );
});

FlashCard.displayName = 'FlashCard';

export default FlashCard;