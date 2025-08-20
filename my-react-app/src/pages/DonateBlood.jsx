import React from 'react';

const DonateBlood = () => {
  return (
    <div className="px-8 py-16">
      <h1 style={{
        fontSize: 'var(--font-4xl)',
        fontWeight: 'var(--font-bold)',
        marginBottom: 'var(--spacing-xl)',
        color: 'var(--color-white)'
      }}>
        Donate Blood
      </h1>
      <p style={{
        color: 'var(--color-gray-400)',
        fontSize: 'var(--font-lg)'
      }}>
        Register as a blood donor...
      </p>
    </div>
  );
};

export default DonateBlood;
