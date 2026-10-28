import { DatabaseService } from '../db/database';

export const DBService = {
    getEmployees: () => {
        try {
            const rows = DatabaseService.query("SELECT * FROM employees");
            // Map DB columns to UI expected format (preserving original keys for compatibility)
            return rows.map(r => ({
                "ID": r.emp_id || r.id, // Fallback to auto-inc ID
                "Name": r.name,
                "Type": r.type,
                "Which": r.which_role,
                "Phone": r.phone,
                "Email": r.email,
                "Start Date": r.start_date,
                "Payment Amount": r.payment_amount,
                "Amount In Text": r.amount_in_text,
                "Account Number": r.account_number,
                "IFSC": r.ifsc,
                "Branch Name": r.branch_name,
                "PAN": r.pan,
                "UAN": r.uan,
                "Bank Name": r.bank_name
            }));
        } catch (e) {
            console.warn("DB not ready:", e);
            return [];
        }
    },

    addEmployee: (emp) => {
        const sql = `
      INSERT INTO employees (
        emp_id, name, type, which_role, phone, email, start_date, 
        payment_amount, amount_in_text, account_number, ifsc, branch_name,
        pan, uan, bank_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const params = [
            emp['ID'], emp['Name'], emp['Type'], emp['Which'], emp['Phone'],
            emp['Email'], emp['Start Date'], emp['Payment Amount'],
            emp['Amount In Text'], emp['Account Number'], emp['IFSC'], emp['Branch Name'],
            emp['PAN'], emp['UAN'], emp['Bank Name']
        ];
        DatabaseService.run(sql, params);
    },

    deleteEmployee: (id) => {
        DatabaseService.run("DELETE FROM employees WHERE emp_id = ?", [id]);
    },

    updateEmployee: (emp) => {
        const sql = `
            UPDATE employees SET
                name = ?, type = ?, which_role = ?, phone = ?, email = ?, start_date = ?,
                payment_amount = ?, amount_in_text = ?, account_number = ?, ifsc = ?, branch_name = ?,
                pan = ?, uan = ?, bank_name = ?
            WHERE emp_id = ?
        `;
        const params = [
            emp['Name'], emp['Type'], emp['Which'], emp['Phone'],
            emp['Email'], emp['Start Date'], emp['Payment Amount'],
            emp['Amount In Text'], emp['Account Number'], emp['IFSC'], emp['Branch Name'],
            emp['PAN'], emp['UAN'], emp['Bank Name'],
            emp['ID']
        ];
        DatabaseService.run(sql, params);
    },
    importEmployees(employees) {
        let successCount = 0;
        let errors = [];

        employees.forEach(emp => {
            try {
                // ... (existing import logic) ...
                // Basic Normalization/Validation could go here
                if (!emp.Name || !emp.Email) {
                    throw new Error(`Missing Name or Email for row`);
                }

                // Map 'Employee ID' from CSV to 'ID'
                if (emp['Employee ID']) {
                    emp.ID = emp['Employee ID'];
                }

                // Generate ID if missing
                if (!emp.ID) {
                    emp.ID = `EMP${Math.floor(Math.random() * 100000)}`;
                }

                this.addEmployee(emp);
                successCount++;
            } catch (e) {
                errors.push({ name: emp.Name || 'Unknown', error: e.message });
            }
        });

        return { successCount, errors };
    },

    savePayrollHistory: (record) => {
        const sql = `
            INSERT INTO payroll_history (
                emp_id, month, basic, hra, special, pf, pt, tds, net_pay
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            record.emp_id, record.month,
            record.basic ?? 0,
            record.hra ?? 0,
            record.special ?? 0,
            record.pf ?? 0,
            record.pt ?? 0,
            record.tds ?? 0,
            record.net_pay ?? 0
        ];
        DatabaseService.run(sql, params);
    },

    getPayrollHistory: (empId) => {
        return DatabaseService.query("SELECT * FROM payroll_history WHERE emp_id = ? ORDER BY month DESC", [empId]);
    }
};
