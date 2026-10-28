import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getContacts, saveContacts, getCampaignState, saveCampaignState } from './storage';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        })
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('Storage Utils', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('should save and retrieve contacts', () => {
        const contacts = [{ name: 'John', phone: '123' }];
        saveContacts(contacts);
        expect(window.localStorage.setItem).toHaveBeenCalledWith('wa_contacts', JSON.stringify(contacts));

        const retrieved = getContacts();
        expect(retrieved).toEqual(contacts);
    });

    it('should return empty array if no contacts', () => {
        const retrieved = getContacts();
        expect(retrieved).toEqual([]);
    });

    it('should save and retrieve campaign state', () => {
        const state = { message: 'Hi', config: {} };
        saveCampaignState(state);
        expect(window.localStorage.setItem).toHaveBeenCalledWith('wa_campaign_state', JSON.stringify(state));

        const retrieved = getCampaignState();
        expect(retrieved).toEqual(state);
    });
});
