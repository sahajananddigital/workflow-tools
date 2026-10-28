import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function EmployeeForm({ onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState(initialData || {
    ID: `EMP${Math.floor(Math.random() * 10000)}`,
    Name: '',
    Type: 'Full Time',
    Which: 'Engineering',
    Phone: '',
    Email: '',
    'Start Date': new Date().toISOString().split('T')[0],
    'Payment Amount': '',
    'Amount In Text': '',
    'Account Number': '',
    IFSC: '',
    'Branch Name': '',
    'PAN': '',
    'UAN': '',
    'Bank Name': ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full m-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Employee</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
            <input name="ID" value={formData.ID} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">Auto-generated. You can modify if needed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input required name="Name" value={formData.Name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input required type="email" name="Email" value={formData.Email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role (Which)</label>
            <input required name="Which" value={formData.Which} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select name="Type" value={formData.Type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Contract</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" name="Start Date" value={formData['Start Date']} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input name="Phone" value={formData.Phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Amount</label>
            <input type="number" name="Payment Amount" value={formData['Payment Amount'] || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (Words)</label>
            <input name="Amount In Text" value={formData['Amount In Text'] || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Account Number</label>
            <input name="Account Number" value={formData['Account Number'] || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">IFSC</label>
            <input name="IFSC" value={formData.IFSC || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input name="Bank Name" value={formData['Bank Name'] || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PAN</label>
              <input name="PAN" value={formData.PAN || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">UAN</label>
              <input name="UAN" value={formData.UAN || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Branch Name</label>
            <input name="Branch Name" value={formData['Branch Name'] || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end space-x-3 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded hover:bg-gray-300 text-gray-800">Cancel</button>
            <button type="submit" className="bg-indigo-600 py-2 px-4 rounded hover:bg-indigo-700 text-white">{initialData ? 'Update' : 'Save'} Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}
