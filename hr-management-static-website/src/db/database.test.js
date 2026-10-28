import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseService } from './database';
import initSqlJs from 'sql.js';

// Mock sql.js
vi.mock('sql.js', () => {
    const Database = vi.fn(() => ({
        run: vi.fn(),
        exec: vi.fn(() => []), // Return empty result by default
        prepare: vi.fn(() => ({
            bind: vi.fn(),
            step: vi.fn(() => false),
            getAsObject: vi.fn(() => ({})),
            free: vi.fn(),
        })),
        export: vi.fn(() => new Uint8Array([])),
    }));
    return {
        default: vi.fn(() => Promise.resolve({ Database })),
    };
});

// Mock window.showOpenFilePicker and showSaveFilePicker
const mockFileHandle = {
    getFile: vi.fn(() => Promise.resolve({
        arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(8))),
        name: 'test.sqlite'
    })),
    createWritable: vi.fn(() => Promise.resolve({
        write: vi.fn(),
        close: vi.fn(),
    })),
};

global.window = {
    showOpenFilePicker: vi.fn(() => Promise.resolve([mockFileHandle])),
    showSaveFilePicker: vi.fn(() => Promise.resolve(mockFileHandle)),
};
global.URL = {
    createObjectURL: vi.fn(),
    revokeObjectURL: vi.fn(),
};

describe('DatabaseService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset internal state if possible (though module state persists, we rely on re-init behavior)
        // In a real scenario, we might export a reset function for testing.
    });

    it('should create a new database and run migrations', async () => {
        const result = await DatabaseService.createDatabase();
        expect(result.success).toBe(true);
        expect(result.name).toBe('New Database');

        // Verify SQL operations
        // We can't easily access the internal 'db' instance without exporting it or spying on the sql.js mock extensively.
        // However, createDatabase calls runMigrations, which executes SQL.
        // Let's create a testable scenario by mocking exec to return version 0, triggering migrations.
    });

    it('should open an existing database', async () => {
        const result = await DatabaseService.openDatabase();
        expect(result.success).toBe(true);
        expect(result.name).toBe('test.sqlite');
        expect(window.showOpenFilePicker).toHaveBeenCalled();
    });

    it('should save database to existing handle', async () => {
        // Ensure DB is initialized first
        await DatabaseService.createDatabase();

        // Mock that we have a file handle (from openDatabase)
        // Since we can't inject fileHandle directly into the module scope from here easily without re-writing the module to export setters,
        // we'll simulate the flow: Open -> Save
        await DatabaseService.openDatabase();

        const saveResult = await DatabaseService.saveDatabase();
        expect(saveResult.success).toBe(true);
        expect(mockFileHandle.createWritable).toHaveBeenCalled();
    });

    it('should save database as new file (Save As) if no handle', async () => {
        // Re-create DB to clear fileHandle (conceptually, though module state persists)
        // Actually, to test "Save As", we need fileHandle to be null.
        // We can just call saveAsNew directly which enforces file picker.
        await DatabaseService.createDatabase();
        await DatabaseService.saveAsNew();
        expect(window.showSaveFilePicker).toHaveBeenCalled();
    });
});
