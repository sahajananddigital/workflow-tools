import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeTable from './EmployeeTable';

// Mock jsPDF first
vi.mock('jspdf', () => {
    return {
        jsPDF: vi.fn().mockImplementation(() => ({
            setFontSize: vi.fn(),
            text: vi.fn(),
            line: vi.fn(),
            splitTextToSize: vi.fn(),
            save: vi.fn(),
            addImage: vi.fn(),
        })),
    };
});

// Mock DatabaseService to avoid WASM loading
vi.mock('../db/database', () => ({
    DatabaseService: {
        getSetting: vi.fn().mockReturnValue(null), // Return null or mock value
        saveDatabase: vi.fn(),
    }
}));

// Mock DBService if needed (it seems EmployeeTable uses it?)
// Checking EmployeeTable imports... it imports DBService?
// EmployeeTable uses DatabaseService for getSetting (company info)
// It might use DBService for actions? 
// Let's mock DBService just in case.
vi.mock('../utils/dbService', () => ({
    DBService: {
        // Add methods if EmployeeTable calls them directly
    }
}));

describe('EmployeeTable', () => {
    const mockEmployees = [
        {
            "ID": "EMP001",
            "Name": "John Doe",
            "Type": "Full Time",
            "Which": "Engineering",
            "Email": "john@example.com",
            "Start Date": "2024-01-01",
            "Payment Amount": "50000"
        }
    ];

    it('renders employee data correctly', () => {
        render(<EmployeeTable employees={mockEmployees} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('shows no employees message when list is empty', () => {
        render(<EmployeeTable employees={[]} />);
        expect(screen.getByText('No employees found.')).toBeInTheDocument();
    });

    it('renders payroll actions in payroll mode', () => {
        render(<EmployeeTable employees={mockEmployees} mode="payroll" />);
        // Check for checkbox
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
        // Check for Pay button
        expect(screen.getByText(/Download Payslips/)).toBeInTheDocument();
    });

    it('renders offer letter actions in offer mode', () => {
        render(<EmployeeTable employees={mockEmployees} mode="offer" />);
        expect(screen.getByText('Generate')).toBeInTheDocument();
    });
});
