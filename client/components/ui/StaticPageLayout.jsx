import React from "react";

export default function StaticPageLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-red-500">{title}</h1>
        <hr className="border-red-500 mt-2 w-24 mx-auto" />
      </header>
      <main className="max-w-4xl mx-auto text-white text-lg space-y-4">
        {children}
      </main>
    </div>
  );
}
