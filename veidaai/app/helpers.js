// hyphenate & encode a URL from a string
export function formatURL(str) {
    let hyphenated = str.replace(/\s+/g, '-');
    let encoded = encodeURIComponent(hyphenated);
    return encoded;
};

// unhyphenate & decode a URL to return a string 
export function unformatURL(urlCourseName) {
    let decoded = decodeURIComponent(urlCourseName);
    let unhyphenated = decoded.replace(/-/g, ' ');
    return unhyphenated;
}