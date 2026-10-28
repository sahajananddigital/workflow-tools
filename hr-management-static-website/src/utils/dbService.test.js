import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DBService } from './dbService';
import { DatabaseService } from '../db/database';

// Mock the underlying DatabaseService
vi.mock('../db/database', () => ({
    DatabaseService: {
        query: vi.fn(),
        run: vi.fn(),
    },
}));

describe('DBService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getEmployees should return mapped employees', () => {
        const mockRows = [
            {
                id: 1,
                emp_id: 'EMP001',
                name: 'Test User',
                type: 'Full Time',
                which_role: 'Dev',
                phone: '123',
                email: 'test@example.com',
                start_date: '2024-01-01',
                payment_amount: 5000,
                amount_in_text: 'Five Thousand',
                account_number: 'ACC123',
                ifsc: 'IFSC123',
                branch_name: 'Main'
            }
        ];

        DatabaseService.query.mockReturnValue(mockRows);

        const result = DBService.getEmployees();

        expect(DatabaseService.query).toHaveBeenCalledWith("SELECT * FROM employees");
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            "ID": 'EMP001',
            "Name": 'Test User',
            "Type": 'Full Time',
            "Which": 'Dev',
            "Phone": '123',
            "Email": 'test@example.com',
            "Start Date": '2024-01-01',
            "Payment Amount": 5000,
            "Amount In Text": 'Five Thousand',
            "Account Number": 'ACC123',
            "IFSC": 'IFSC123',
            "Branch Name": 'Main'
        });
    });

    it('addEmployee should insert mapped data', () => {
        const newEmp = {
            "ID": 'EMP002',
            "Name": 'New User',
            "Type": 'Part Time',
            "Which": 'Design',
            "Phone": '456',
            "Email": 'new@example.com',
            "Start Date": '2024-02-01',
            "Payment Amount": 3000,
            "Amount In Text": 'Three Thousand',
            "Account Number": 'ACC456',
            "IFSC": 'IFSC456',
            "Branch Name": 'City',
            "PAN": 'ABCDE1234F',
            "UAN": '1009001234',
            "Bank Name": 'Test Bank'
        };

        DBService.addEmployee(newEmp);

        expect(DatabaseService.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO employees'),
            [
                'EMP002', 'New User', 'Part Time', 'Design', '456',
                'new@example.com', '2024-02-01', 3000,
                'Three Thousand', 'ACC456', 'IFSC456', 'City',
                'ABCDE1234F', '1009001234', 'Test Bank'
            ]
        );
    });
});
