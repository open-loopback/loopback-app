import { createCache } from 'flamecache';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY!,
    databaseURL: process.env.FIREBASE_DATABASE_URL!,
    projectId: process.env.FIREBASE_PROJECT_ID!,
};

if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL || !firebaseConfig.projectId) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Firebase configuration for Flamecache is missing');
    } else {
        console.warn('Firebase configuration for Flamecache is missing. Caching will be disabled.');
    }
}

export const cache = createCache({
    firebase: firebaseConfig,
    rootPath: 'loopback-cache',
    ttl: 7200, // Default TTL: 2 hours
    disableCache: !firebaseConfig.apiKey || process.env.DISABLE_CACHE === 'true',
});

