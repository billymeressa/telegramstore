// Smart search utility with fuzzy matching and relevance scoring

/**
 * Calculate similarity between two strings (0-1 score)
 * Uses Levenshtein distance for fuzzy matching
 */
function similarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

/**
 * Smart search function that searches across multiple fields with relevance scoring
 * @param {Array} products - Array of product objects
 * @param {string} query - Search query
 * @returns {Array} Sorted array of products by relevance
 */
export function smartSearch(products, query) {
    if (!query || query.trim() === '') {
        return products;
    }

    const searchTerm = query.toLowerCase().trim();
    const searchWords = searchTerm.split(/\s+/);

    const scoredProducts = products.map(product => {
        let score = 0;
        const title = (product.title || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const department = (product.department || '').toLowerCase();

        // Exact match in title (highest priority)
        if (title === searchTerm) {
            score += 100;
        }

        // Title starts with search term
        if (title.startsWith(searchTerm)) {
            score += 50;
        }

        // Title contains exact search term
        if (title.includes(searchTerm)) {
            score += 30;
        }

        // Check each word in search query
        searchWords.forEach(word => {
            // Title contains word
            if (title.includes(word)) {
                score += 20;
            }

            // Description contains word
            if (description.includes(word)) {
                score += 10;
            }

            // Category matches
            if (category.includes(word)) {
                score += 15;
            }

            // Department matches
            if (department.includes(word)) {
                score += 8;
            }

            // Fuzzy matching for typos (similarity > 0.8)
            const titleWords = title.split(/\s+/);
            titleWords.forEach(titleWord => {
                const sim = similarity(word, titleWord);
                if (sim > 0.8 && sim < 1.0) {
                    score += Math.floor(sim * 15); // Partial score for fuzzy match
                }
            });
        });

        // Variation names matching (if product has variations)
        if (product.variations && product.variations.length > 0) {
            product.variations.forEach(variation => {
                const varName = (variation.name || '').toLowerCase();
                if (varName.includes(searchTerm)) {
                    score += 12;
                }
                searchWords.forEach(word => {
                    if (varName.includes(word)) {
                        score += 8;
                    }
                });
            });
        }

        return { product, score };
    });

    // Filter out products with score 0 and sort by score (descending)
    return scoredProducts
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
}

/**
 * Get search suggestions based on partial query
 * @param {Array} products - Array of product objects
 * @param {string} query - Partial search query
 * @param {number} limit - Maximum number of suggestions
 * @returns {Array} Array of suggestion strings
 */
export function getSearchSuggestions(products, query, limit = 5) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const suggestions = new Set();

    products.forEach(product => {
        const title = (product.title || '').toLowerCase();
        const category = (product.category || '');

        // Add product titles that start with or contain the query
        if (title.startsWith(searchTerm) || title.includes(searchTerm)) {
            suggestions.add(product.title);
        }

        // Add categories that match
        if (category.toLowerCase().includes(searchTerm)) {
            suggestions.add(category);
        }

        // Add variation names that match
        if (product.variations && product.variations.length > 0) {
            product.variations.forEach(variation => {
                const varName = variation.name || '';
                if (varName.toLowerCase().includes(searchTerm)) {
                    suggestions.add(`${product.title} - ${varName}`);
                }
            });
        }
    });

    return Array.from(suggestions).slice(0, limit);
}
