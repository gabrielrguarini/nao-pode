import type { Card, Prenda } from "../types";

const LOCAL_STORAGE_KEYS = {
    VERSION: 'nao-pode-version',
    CARDS: 'nao-pode-cards',
    PRENDAS: 'nao-pode-prendas',
    LAST_UPDATED: 'nao-pode-last-updated'
};

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface VersionData {
    version: number;
    lastModified?: string;
}

export const ContentService = {
    async initialize(): Promise<{ cards: Card[], prendas: Prenda[] }> {
        const localVersion = localStorage.getItem(LOCAL_STORAGE_KEYS.VERSION);
        const lastUpdated = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_UPDATED);
        const now = Date.now();
        const isOffline = !navigator.onLine;

        // 1. Offline Mode: Trust local storage immediately
        if (isOffline) {
            console.log("Offline mode: Loading from cache.");
            return this.loadFromStorageOrEmpty();
        }

        // 2. Online Mode: Fetch version.json
        try {
            const versionResponse = await fetch('/data/version.json');
            if (!versionResponse.ok) {
                throw new Error(`Failed to fetch version: ${versionResponse.statusText}`);
            }
            
            const remoteVersionData: VersionData = await versionResponse.json();
            
            const isCacheExpired = !lastUpdated || (now - Number(lastUpdated) > CACHE_DURATION_MS);
            const isNewVersion = !localVersion || Number(localVersion) < remoteVersionData.version;

            if (isNewVersion || isCacheExpired) {
                console.log(`Update detected (New Version: ${isNewVersion}, Expired: ${isCacheExpired}). Fetching new content...`);
                return await this.fetchAndSaveContent(remoteVersionData.version);
            } else {
                console.log("Content is up to date (Local version matches remote).");
                const localContent = this.loadFromStorage();
                if (localContent) {
                    return localContent;
                } else {
                    // Edge case: Version matches but storage is empty/corrupt
                    console.warn("Local storage empty despite version match. Refetching...");
                    return await this.fetchAndSaveContent(remoteVersionData.version);
                }
            }

        } catch (error) {
            console.warn("Failed to check version or update content. Falling back to local storage.", error);
            return this.loadFromStorageOrEmpty();
        }
    },

    loadFromStorage(): { cards: Card[], prendas: Prenda[] } | null {
        try {
            const cardsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.CARDS);
            const prendasStr = localStorage.getItem(LOCAL_STORAGE_KEYS.PRENDAS);
            
            if (cardsStr && prendasStr) {
                return {
                    cards: JSON.parse(cardsStr),
                    prendas: JSON.parse(prendasStr)
                };
            }
            return null;
        } catch (e) {
            console.error("Error parsing local storage", e);
            return null;
        }
    },

    loadFromStorageOrEmpty(): { cards: Card[], prendas: Prenda[] } {
        const data = this.loadFromStorage();
        return data || { cards: [], prendas: [] };
    },

    async fetchAndSaveContent(version: number): Promise<{ cards: Card[], prendas: Prenda[] }> {
        const [cards, prendas] = await Promise.all([
            this.fetchJson<Card[]>('/data/cards.json'),
            this.fetchJson<Prenda[]>('/data/prendas.json')
        ]);

        // Validate data simply (check is array)
        if (!Array.isArray(cards) || !Array.isArray(prendas)) {
            throw new Error("Invalid content format");
        }

        localStorage.setItem(LOCAL_STORAGE_KEYS.CARDS, JSON.stringify(cards));
        localStorage.setItem(LOCAL_STORAGE_KEYS.PRENDAS, JSON.stringify(prendas));
        localStorage.setItem(LOCAL_STORAGE_KEYS.VERSION, String(version));
        localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_UPDATED, String(Date.now()));

        return { cards, prendas };
    },

    async fetchJson<T>(url: string): Promise<T> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        return response.json();
    }
};
