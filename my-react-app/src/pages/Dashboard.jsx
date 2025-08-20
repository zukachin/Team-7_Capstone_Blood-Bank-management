import React from 'react';

const Dashboard = () => {
  return (
    <div className="px-8 py-16">
      <h1 style={{
        fontSize: 'var(--font-4xl)',
        fontWeight: 'var(--font-bold)',
        marginBottom: 'var(--spacing-xl)',
        color: 'var(--color-white)'
      }}>
        Blood Bank Dashboard
      </h1>
      <p style={{
        color: 'var(--color-gray-400)',
        fontSize: 'var(--font-lg)'
      }}>
        Manage blood inventory...
      </p>
    </div>
  );
};

export default Dashboard;
