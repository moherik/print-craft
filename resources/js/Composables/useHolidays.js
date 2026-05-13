import { ref } from 'vue';
import axios from 'axios';

const holidayCache = new Map();
const pendingRequests = new Map();

export function useHolidays() {
    const loading = ref(false);
    const error = ref(null);

    async function fetchHolidays(year, countryCode = 'ID') {
        if (!year || year === 'undefined') return [];
        const cacheKey = `${year}-${countryCode}`;
        
        // 1. Check completed cache
        if (holidayCache.has(cacheKey)) {
            return holidayCache.get(cacheKey);
        }

        // 2. Check pending requests
        if (pendingRequests.has(cacheKey)) {
            return pendingRequests.get(cacheKey);
        }

        loading.value = true;
        error.value = null;

        // Create the promise for this request
        const requestPromise = (async () => {
            try {
                const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
                const holidays = response.data.map(h => ({
                    date: h.date,
                    name: h.localName || h.name,
                }));
                
                holidayCache.set(cacheKey, holidays);
                return holidays;
            } catch (err) {
                console.error('Failed to fetch holidays:', err);
                error.value = 'Gagal mengambil data hari libur';
                return [];
            } finally {
                pendingRequests.delete(cacheKey);
                loading.value = false;
            }
        })();

        // Store the promise so others can wait for it
        pendingRequests.set(cacheKey, requestPromise);
        return requestPromise;
    }

    return {
        loading,
        error,
        fetchHolidays
    };
}
