import React from 'react';

export const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl ${className}`}>
            {children}
        </div>
    );
};
