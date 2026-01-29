
const GENERIC_CATEGORIES = ['Parts & Accessories', 'Tools', 'Tools & Equipment', 'Other', 'Computer Accessories', 'Cables', 'Adapters'];

export const smartSort = (items) => {
    if (!items || items.length === 0) return [];

    // 1. Get User Data
    let interests = {};
    let seenIds = [];
    try {
        interests = JSON.parse(localStorage.getItem('user_interests') || '{}');
        seenIds = JSON.parse(localStorage.getItem('seen_products') || '[]');
    } catch (e) {
        console.error(e);
    }

    // Get Top 3 Categories
    const topCategories = Object.entries(interests)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat);

    // 2. Separate Seen vs Unseen
    const unseenItems = [];
    const seenItems = [];

    items.forEach(p => {
        if (seenIds.includes(p.id)) {
            seenItems.push(p);
        } else {
            unseenItems.push(p);
        }
    });

    // 3. Bucket Helper
    const bucketAndShuffle = (list) => {
        const personalized = [];
        const premium = [];
        const generic = [];

        list.forEach(p => {
            const cat = p.category || 'Other';
            if (GENERIC_CATEGORIES.includes(cat)) {
                generic.push(p);
            } else if (topCategories.includes(cat)) {
                personalized.push(p);
            } else {
                premium.push(p);
            }
        });

        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        return [...shuffle(personalized), ...shuffle(premium), ...generic];
    };

    // 4. Final Mix: Unseen (Sorted) -> Seen (Sorted)
    // Ensures fresh items are prioritized
    return [...bucketAndShuffle(unseenItems), ...bucketAndShuffle(seenItems)];
};
