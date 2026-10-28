import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { DatabaseService } from '../db/database';
import { DBService } from '../utils/dbService';
import { EmailService } from '../utils/EmailService';
import PayrollHistoryModal from './PayrollHistoryModal';
import { Mail, FileText, CheckCircle, ChevronDown, ChevronUp, History } from 'lucide-react';

export default function EmployeeTable({ employees, mode = 'view', onEdit, onDelete }) {
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [processing, setProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [viewingHistoryEmployee, setViewingHistoryEmployee] = useState(null);

    const toggleSelection = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Helper to format currency
    const formatCurrency = (amount) => {
        const value = new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0
        }).format(amount);
        return `Rs. ${value}`;
    };

    const calculateSalaryComponents = (employee) => {
        const gross = parseFloat(employee['Payment Amount']) || 0;
        const basic = Math.round(gross * 0.50);
        const hra = Math.round(basic * 0.40);
        const special = gross - basic - hra;
        const pt = 0; // standard deviation/logic can be added
        const pf = 0;
        const totalDeductions = pt + pf;
        const netPay = gross - totalDeductions;
        return { gross, basic, hra, special, pt, pf, totalDeductions, netPay };
    };

    const generatePayslipPDF = (employee, salaryDetails = null) => {
        const doc = new jsPDF();

        // Use provided details or calculate
        const details = salaryDetails || calculateSalaryComponents(employee);
        const { gross, basic, hra, special, pt, pf, totalDeductions, netPay } = details;

        // Fetch Settings
        const companyName = DatabaseService.getSetting('companyName') || 'Your Company Name';
        const companyAddress = DatabaseService.getSetting('companyAddress') || 'Company Address';
        const logoBase64 = DatabaseService.getSetting('logoBase64');

        // Color Palette
        const primaryColor = [41, 128, 185]; // Blue
        const textColor = [50, 50, 50];

        // --- Header Section ---
        // Logo
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, 'PNG', 15, 10, 25, 25, undefined, 'FAST');
            } catch (e) { console.error("Logo error", e); }
        }

        // Company Details (Centered if no logo, or right/next to logo)
        doc.setTextColor(...primaryColor);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(companyName.toUpperCase(), 105, 18, null, null, "center");

        doc.setTextColor(...textColor);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const addressLines = doc.splitTextToSize(companyAddress, 100);
        doc.text(addressLines, 105, 25, null, null, "center");

        // Title
        doc.setDrawColor(200, 200, 200);
        doc.line(10, 40, 200, 40);

        const [year, month] = payrollMonth.split('-');
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`PAYSLIP FOR ${monthName.toUpperCase()} ${year}`, 105, 48, null, null, "center");

        // --- Employee Details Box ---
        doc.setDrawColor(0);
        doc.rect(10, 55, 190, 35);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        // Left Column
        doc.text("Employee Name:", 15, 62);
        doc.text("Designation:", 15, 70);
        doc.text("Date of Joining:", 15, 78);
        doc.text("Bank Account:", 15, 86);

        // Right Column
        doc.text("Employee ID:", 110, 62);
        doc.text("PAN Number:", 110, 70);
        doc.text("UAN / PF No:", 110, 78);
        doc.text("Bank IFSC:", 110, 86);

        // Values
        doc.setFont("helvetica", "normal");
        doc.text(employee.Name || '-', 50, 62);
        doc.text(employee.Which || '-', 50, 70);
        doc.text(employee['Start Date'] || '-', 50, 78);
        doc.text(employee['Account Number'] || '-', 50, 86);

        doc.text(employee.ID || '-', 150, 62);
        doc.text(employee.PAN || 'XXXXXXXXXX', 150, 70); // Placeholder
        doc.text(employee.UAN || 'NA', 150, 78);
        doc.text(employee.IFSC || '-', 150, 86);

        // --- Salary Table ---
        const startY = 100;
        doc.setFillColor(240, 240, 240);
        doc.rect(10, startY, 190, 10, 'F'); // Header bg
        doc.rect(10, startY, 190, 80); // Main Box border
        doc.line(105, startY, 105, startY + 80); // Vertical separator

        // Table Headers
        doc.setFont("helvetica", "bold");
        doc.text("EARNINGS", 15, startY + 7);
        doc.text("AMOUNT", 80, startY + 7);
        doc.text("DEDUCTIONS", 110, startY + 7);
        doc.text("AMOUNT", 175, startY + 7);
        doc.line(10, startY + 10, 200, startY + 10); // Header line

        // Rows
        doc.setFont("helvetica", "normal");
        let rowY = startY + 18;
        const lineHeight = 8;

        // Earnings Side
        doc.text("Basic Salary", 15, rowY);
        doc.text(formatCurrency(basic), 95, rowY, null, null, "right");

        rowY += lineHeight;
        doc.text("House Rent Allowance", 15, rowY);
        doc.text(formatCurrency(hra), 95, rowY, null, null, "right");

        rowY += lineHeight;
        doc.text("Special Allowance", 15, rowY);
        doc.text(formatCurrency(special), 95, rowY, null, null, "right");

        // Deductions Side (Reset Y)
        rowY = startY + 18;
        doc.text("Provident Fund", 110, rowY);
        doc.text(formatCurrency(pf), 190, rowY, null, null, "right");

        rowY += lineHeight;
        doc.text("Professional Tax", 110, rowY);
        doc.text(formatCurrency(pt), 190, rowY, null, null, "right");

        rowY += lineHeight;
        doc.text("TDS / Income Tax", 110, rowY);
        doc.text(formatCurrency(0), 190, rowY, null, null, "right");

        // Totals Line
        const totalY = startY + 70;
        doc.line(10, totalY, 200, totalY);
        doc.setFont("helvetica", "bold");

        doc.text("Total Earnings", 15, totalY + 7);
        doc.text(formatCurrency(gross), 95, totalY + 7, null, null, "right");

        doc.text("Total Deductions", 110, totalY + 7);
        doc.text(formatCurrency(totalDeductions), 190, totalY + 7, null, null, "right");

        // Net Pay Box
        doc.setFillColor(...primaryColor);
        doc.rect(10, startY + 85, 190, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text("NET PAYABLE", 15, startY + 95);
        doc.setFontSize(14);
        doc.text(formatCurrency(netPay), 190, startY + 95, null, null, "right");

        // Amount in Words
        doc.setTextColor(...textColor);
        doc.setFontSize(10);
        doc.text(`Amount in Words: ${employee['Amount In Text'] || '-'}`, 15, startY + 110);

        // Footer
        doc.text("For " + companyName, 190, 270, null, null, "right");
        doc.text("Authorised Signatory", 190, 280, null, null, "right");

        doc.setFontSize(8);
        doc.text("This is a computer generated document.", 105, 290, null, null, "center");

        return doc;
        return doc;
    };

    const handleEmailPayslip = (employee) => {
        if (!employee.Email) {
            alert("Employee email is missing.");
            return;
        }
        const details = calculateSalaryComponents(employee);
        const subject = `Payslip for ${payrollMonth} - ${employee.Name}`;
        const body = `Dear ${employee.Name},

Please find your payslip details for ${payrollMonth} below:

Basic Salary: ${details.basic}
HRA: ${details.hra}
Special Allowance: ${details.special}

Total Earnings: ${details.gross}
Total Deductions: ${details.totalDeductions}

Net Pay: ${details.netPay}

Regards,
HR Team`;

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Payslip for ${payrollMonth}</h2>
                <p>Dear <strong>${employee.Name}</strong>,</p>
                <p>Please find your payslip details below:</p>
                
                <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin-top: 20px;">
                    <tr style="background-color: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Basic Salary</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(details.basic)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>HRA</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(details.hra)}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Special Allowance</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(details.special)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Earnings</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>${formatCurrency(details.gross)}</strong></td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Net Payable</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #2980b9;"><strong>${formatCurrency(details.netPay)}</strong></td>
                    </tr>
                </table>

                <p style="margin-top: 30px;">Regards,<br/>HR Team</p>
                <p style="font-size: 12px; color: #777;">This is a system generated email.</p>
            </div>
        `;

        EmailService.sendEmail(employee.Email, subject, body, [], htmlBody);
    };

    const handleRunPayroll = async () => {
        if (selectedIds.size === 0) return;
        setProcessing(true);
        setStatusMessage({ type: 'info', text: 'Generating payslips...' });

        try {
            const selectedEmployees = employees.filter(e => selectedIds.has(e.ID));

            // Process sequential downloads
            for (const emp of selectedEmployees) {
                const salaryDetails = calculateSalaryComponents(emp);

                // Save to History
                DBService.savePayrollHistory({
                    emp_id: emp.ID,
                    month: payrollMonth,
                    ...salaryDetails,
                    tds: 0 // Explicitly setting TDS to 0 as in logic
                });

                const doc = generatePayslipPDF(emp, salaryDetails);
                doc.save(`Payslip_${emp.Name.replace(/ /g, '_')}.pdf`);
                await new Promise(r => setTimeout(r, 500)); // Small delay between downloads
            }

            setStatusMessage({ type: 'success', text: `Generated & Saved ${selectedEmployees.length} payslips!` });
            setSelectedIds(new Set());
        } catch (error) {
            console.error("Payroll Error:", error);
            const msg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
            setStatusMessage({ type: 'error', text: 'Failed to run payroll: ' + msg });
        } finally {
            setProcessing(false);
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleGenerateOffer = (employee) => {
        setProcessing(true);
        try {
            const doc = new jsPDF();

            // Fetch Settings
            const companyName = DatabaseService.getSetting('companyName') || 'Your Company Name';
            const logoBase64 = DatabaseService.getSetting('logoBase64');

            // 1. Fetch Template
            let template = DatabaseService.getSetting('offerTemplate');

            // Default Template Fallback
            if (!template) {
                template = `Date: {{Date}}

To,
{{Name}}

Subject: Offer of Employment - {{Role}}

Dear {{Name}},

We are pleased to offer you the position of {{Role}} at {{CompanyName}}. We were impressed with your qualifications and believe you will be a valuable asset to our team.

**Position Details:**
- Designation: {{Role}}
- Employment Type: {{Type}}
- Start Date: {{StartDate}}
- CTC (Annual): {{Salary}} ({{AmountInWords}})

You will be expected to carry out the duties and responsibilities as described in the job description.

We look forward to welcoming you to {{CompanyName}}.

Sincerely,

Authorized Signatory
{{CompanyName}}`;
            }

            // 2. Prepare Data for Replacement
            const currentDate = new Date().toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            const amountInWords = employee['Amount In Text'] || '';
            const salary = employee['Payment Amount'] ? formatCurrency(employee['Payment Amount']) : '-';

            const replacements = {
                '{{Date}}': currentDate,
                '{{Name}}': employee.Name || '',
                '{{Role}}': employee.Which || '',
                '{{Type}}': employee.Type || '',
                '{{CompanyName}}': companyName,
                '{{StartDate}}': employee['Start Date'] || 'TBD',
                '{{Salary}}': salary,
                '{{AmountInWords}}': amountInWords
            };

            // 3. Replace Placeholders
            let finalContent = template;
            Object.keys(replacements).forEach(key => {
                const val = replacements[key];
                const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                finalContent = finalContent.replace(regex, val);
            });

            // 4. Generate PDF

            // Add Logo with format detection
            if (logoBase64) {
                try {
                    const format = logoBase64.split(';')[0].split('/')[1].toUpperCase();
                    doc.addImage(logoBase64, format === 'SVG+XML' ? 'PNG' : format, 15, 10, 30, 30, undefined, 'FAST');
                } catch (e) {
                    console.error("Logo error", e);
                    // Fallback to PNG if detection fails
                    try { doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30, undefined, 'FAST'); } catch (e2) { }
                }
            }

            // Header - Date
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(currentDate, 190, 50, null, null, "right");

            // Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("OFFER LETTER", 105, 65, null, null, "center");
            doc.line(70, 67, 140, 67);

            // Body Content
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const lineHeight = 7;
            let cursorY = 80;

            // Simple Markdown Parser & Renderer with Text Wrapping
            const lines = finalContent.split('\n');
            const maxWidth = 170;
            const startX = 20;

            lines.forEach(originalLine => {
                let line = originalLine;
                
                // Extra spacing for paragraphs
                if (line.trim() === '') {
                    cursorY += lineHeight;
                    return;
                }

                let indent = 0;
                // Handle Bullets
                if (line.trim().startsWith('- ')) {
                    line = '• ' + line.trim().substring(2);
                    indent = 5;
                }

                const parts = line.split(/(\*\*.*?\*\*)/g);
                let cursorX = startX + indent;

                // Word-level text wrapping for mixed styles
                parts.forEach(part => {
                    if (!part) return;

                    let isBold = false;
                    let text = part;
                    if (part.startsWith('**') && part.endsWith('**')) {
                        isBold = true;
                        text = part.substring(2, part.length - 2);
                    }

                    doc.setFont("helvetica", isBold ? "bold" : "normal");

                    // Split by spaces but preserve them to calculate correct width
                    const words = text.match(/(\S+|\s+)/g) || [];

                    words.forEach(word => {
                        const wordWidth = doc.getTextWidth(word);
                        
                        // If word exceeds max width, wrap to next line
                        // Ignore wrapping if it's just a space at the end of the line
                        if (word.trim() !== '' && cursorX + wordWidth > startX + maxWidth) {
                            cursorY += lineHeight;
                            cursorX = startX + indent;
                            
                            if (cursorY > pageHeight - margin) {
                                doc.addPage();
                                cursorY = margin;
                            }
                        }

                        // Don't render spaces if it's at the very beginning of a new line
                        if (cursorX === startX + indent && word.trim() === '') {
                            return;
                        }

                        doc.text(word, cursorX, cursorY);
                        cursorX += wordWidth;
                    });
                });

                cursorY += lineHeight;

                // Page break check after a line
                if (cursorY > pageHeight - margin) {
                    doc.addPage();
                    cursorY = margin;
                }
            });

            // Save
            const safeName = (employee.Name || 'Employee').replace(/ /g, '_');
            doc.save(`Offer_Letter_${safeName}.pdf`);

            setStatusMessage({
                type: 'success',
                text: `Offer letter downloaded for ${employee.Name || 'Employee'}`,
            });
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Failed to create offer letter: ' + error.message });
        } finally {
            setProcessing(false);
        }
    };

    const isPayroll = mode === 'payroll';
    const isOffer = mode === 'offer';

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isPayroll ? 'Select Employees for Payslips' : isOffer ? 'Select Employee for Offer' : 'Employee Directory'}
                </h3>
                {isPayroll && (
                    <div className="flex items-center space-x-2">
                        <input
                            type="month"
                            value={payrollMonth}
                            onChange={(e) => setPayrollMonth(e.target.value)}
                            className="border border-gray-300 rounded-md text-sm px-2 py-1 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            onClick={handleRunPayroll}
                            disabled={selectedIds.size === 0 || processing}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                    ${selectedIds.size === 0 || processing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {processing ? 'Processing...' : `Download Payslips (${selectedIds.size})`}
                        </button>
                    </div>
                )}
            </div>

            {statusMessage && (
                <div className={`p-4 ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} border-l-4 ${statusMessage.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
                    <p>{statusMessage.text}</p>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {isPayroll && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <span className="sr-only">Select</span>
                                </th>
                            )}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                            {(isOffer || mode === 'view' || isPayroll) && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No employees found.</td>
                            </tr>
                        ) : (
                            employees.map((employee) => (
                                <tr key={employee.ID} className={selectedIds.has(employee.ID) ? 'bg-indigo-50' : ''}>
                                    {isPayroll && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(employee.ID)}
                                                onChange={() => toggleSelection(employee.ID)}
                                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{employee.Name}</div>
                                                <div className="text-xs text-gray-500">{employee.ID}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{employee.Which}</div>
                                        <div className="text-xs text-gray-400">{employee.Type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.Email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee['Start Date']}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {employee['Payment Amount'] ? `₹${Number(employee['Payment Amount']).toLocaleString()}` : '-'}
                                    </td>
                                    {(isOffer || mode === 'view' || isPayroll) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isOffer ? (
                                                <button
                                                    onClick={() => handleGenerateOffer(employee)}
                                                    disabled={processing}
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full"
                                                >
                                                    <FileText className="w-4 h-4 mr-1" /> Generate
                                                </button>
                                            ) : isPayroll ? (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => setViewingHistoryEmployee(employee)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="View History"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEmailPayslip(employee)}
                                                        className="text-green-600 hover:text-green-900 flex items-center"
                                                        title="Send Email"
                                                    >
                                                        <Mail className="w-4 h-4 mr-1" /> Email
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => setViewingHistoryEmployee(employee)}
                                                        className="text-gray-600 hover:text-gray-900 mr-2"
                                                        title="View History"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit && onEdit(employee)}
                                                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete && onDelete(employee.ID)}
                                                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {viewingHistoryEmployee && (
                <PayrollHistoryModal
                    employee={viewingHistoryEmployee}
                    onClose={() => setViewingHistoryEmployee(null)}
                />
            )}
        </div>
    );
}
