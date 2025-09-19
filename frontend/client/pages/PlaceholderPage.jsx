import React from "react"
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function PlaceholderPage({ title, description }) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="flex items-center justify-center py-20">
        <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
          <h1
            className="text-white text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            {title}
          </h1>
          <p
            className="text-white text-xl"
            style={{
              fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            {description}
          </p>
          <p
            className="text-blood-light text-lg"
            style={{
              fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            This page is under development. Please continue prompting to fill in
            this page content.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
