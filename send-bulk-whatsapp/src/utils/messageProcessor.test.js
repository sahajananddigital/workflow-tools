import { describe, it, expect } from 'vitest';
import { processMessage, processSpintax } from './messageProcessor';

describe('Message Processor', () => {
    it('should process spintax correctly', () => {
        const template = 'Hello {World|Universe}';
        const result = processSpintax(template);
        expect(['Hello World', 'Hello Universe']).toContain(result);
    });

    it('should replace variables', () => {
        const template = 'Hi {name}';
        const contact = { name: 'John' };
        const result = decodeURIComponent(processMessage(template, contact));
        expect(result).toBe('Hi John');
    });

    it('should handle case insensitive variables', () => {
        const template = 'Hi {NAME}';
        const contact = { name: 'John' };
        const result = decodeURIComponent(processMessage(template, contact));
        expect(result).toBe('Hi John');
    });

    it('should append random ID when requested', () => {
        const template = 'Test';
        const contact = {};
        const result = decodeURIComponent(processMessage(template, contact, { appendRandomId: true }));
        expect(result).toMatch(/Test\n\nID: [a-z0-9]+/);
    });
});
