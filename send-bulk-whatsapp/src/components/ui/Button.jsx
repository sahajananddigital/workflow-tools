import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20",
        secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
        danger: "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
