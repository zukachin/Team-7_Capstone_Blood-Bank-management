// src/components/HeroSection.jsx
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X } from 'lucide-react'; // Chatbot icons
import Chatbot from '../pages/Chatbot'; 

export function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const statsRef = useRef(null);
  const portalsRef = useRef(null);
  const imageRef = useRef(null);

  // // Chatbot states
  // const [isChatOpen, setIsChatOpen] = useState(false);
  // const [messages, setMessages] = useState([
  //   { from: "bot", text: "Hi! I am your blood donation assistant." }
  // ]);
  // const [input, setInput] = useState("");
    // Chatbot states
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I am your blood donation assistant." },
  ]);
  const [input, setInput] = useState("");

  // Send message handler
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { from: "user", text: input }]);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: "123456",
          query: input
        }),
      });

      const data = await res.json();

      // Extract only the message string from response
      const botReply = data.response || data.reply || JSON.stringify(data);

      setMessages(prev => [...prev, { from: "bot", text: botReply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { from: "bot", text: "Error connecting to agent." },
      ]);
    }

    setInput(""); // Clear input after sending
  };

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(headlineRef.current.children, 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current, 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 }, "-=0.4"
    )
    .fromTo(buttonRef.current, 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5 }, "-=0.3"
    )
    .fromTo(statsRef.current.children, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, duration: 0.6 }, "-=0.2"
    )
    .fromTo(portalsRef.current.children, 
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.2, duration: 0.7 }, "-=0.3"
    )
    .fromTo(imageRef.current, 
      { scale: 0.8, opacity: 0, rotation: -5 },
      { scale: 1, opacity: 0.75, rotation: 0, duration: 1, ease: "elastic.out(1, 0.3)" }, "-=0.5"
    );

    gsap.to(imageRef.current, {
      y: 20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  // // Send message function
  // const sendMessage = async () => {
  //   if (!input.trim()) return;

  //   // Add user message
  //   setMessages(prev => [...prev, { from: "user", text: input }]);
    
  //   // TODO: Call your Python agent API here
  //   try {
  //     const res = await fetch("http://localhost:8000/chat", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ text: input })
  //     });
  //     const data = await res.json();
  //     setMessages(prev => [...prev, { from: "bot", text: data.reply }]);
  //   } catch (err) {
  //     setMessages(prev => [...prev, { from: "bot", text: "Error connecting to agent." }]);
  //   }

  //   setInput("");
  // };

  return (
    <section ref={sectionRef} className="relative bg-black min-h-screen flex flex-col justify-center items-center py-8 md:py-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 ref={headlineRef} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-center md:text-left">
              <div>Connecting Donors, Hospitals</div>
              <div>& Patients — <span className="text-red-500">Instantly</span></div>
            </h1>

            <p
              ref={subtitleRef}
              className="text-white text-base sm:text-lg font-normal max-w-xl mx-auto md:mx-0 text-center md:text-left"
              style={{ fontFamily: "Lustria, -apple-system, Roboto, Helvetica, sans-serif" }}
            >
              Every drop counts. Our platform ensures that hospitals can find,
              request, and track blood in real time.
            </p>

            <div ref={buttonRef} className="flex justify-center md:justify-start">
              <Button
                onClick={() => navigate("/register-donor")}
                className="bg-white text-black hover:bg-gray-100 rounded-sm px-6 py-2 sm:px-8 sm:py-3 text-base font-normal underline"
                style={{ fontFamily: "Love Ya Like A Sister, -apple-system, Roboto, Helvetica, sans-serif" }}
              >
                Schedule Your Donation
              </Button>
            </div>

            {/* Statistics */}
            <div ref={statsRef} className="space-y-4 pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4 bg-black/95 rounded px-4 py-3 text-center sm:text-left">
                <span className="text-white text-lg font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>12,300</span>
                <div className="h-6 w-px" style={{ backgroundColor: "#C21717" }}></div>
                <span className="text-white text-lg font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif", WebkitTextStroke: "1px #C21717" }}>Donor Registered</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:space-x-4 bg-lifelink-darkgray rounded px-4 py-3 text-center sm:text-left">
                <span className="text-white text-lg font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>12,300</span>
                <div className="h-6 w-px" style={{ backgroundColor: "#C21717" }}></div>
                <span className="text-white text-lg font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif", WebkitTextStroke: "1px #C21717" }}>Blood Units Collected</span>
              </div>
            </div>

            {/* Portals */}
            <div ref={portalsRef} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 pt-6">
              <button
                onClick={() => navigate("/donor-portal")}
                className="w-full bg-black/70 hover:bg-red-700 transition-colors rounded-lg p-4 text-center md:text-left space-y-2"
              >
                <h3 className="text-white text-xl md:text-3xl font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>Donor Portal</h3>
                <p className="text-red-400 text-sm font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>
                  Register, book appointments, and manage your donations.
                </p>
              </button>

              <button
                onClick={() => navigate("/admin/login")}
                className="w-full bg-black/70 hover:bg-red-700 transition-colors rounded-lg p-4 text-center md:text-left space-y-2"
              >
                <h3 className="text-white text-xl md:text-3xl font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>Inventory Portal</h3>
                <p className="text-red-400 text-sm font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>
                  View and manage blood stock information.
                </p>
              </button>
            </div>
          </div>

          {/* Right Side - Medical Image */}
          <div className="flex justify-center md:justify-end -mt-32 md:-mt-100">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
              <img 
                ref={imageRef}
                src="https://api.builder.io/api/v1/image/assets/TEMP/4ef6a46c6ac992bd8fcc6d9db0667b8c8e85d7b9?width=610" 
                alt="Medical professional" 
                className="w-full h-auto opacity-75 mix-blend-hard-light rounded-full" 
              />
              <p
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-white text-2xl sm:text-3xl"
                style={{
                  fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                  WebkitTextStroke: "1px #ffffff",
                }}
              >
                Together, we save lives
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Floating Button & Panel */}
      {/* <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-red-600 hover:bg-red-700 p-4 rounded-full shadow-lg text-white flex items-center justify-center"
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button> */}

        {/* Chatbot Panel */}
{/* {isChatOpen && (
  <div className="mt-4 w-80 h-96 bg-black text-white shadow-xl rounded-lg flex flex-col overflow-hidden"> */}
    {/* Header with close button */}
    {/* <div className="bg-red-600 p-4 flex justify-between items-center font-bold">
      <span>Assistant</span>
      <button 
        onClick={() => setIsChatOpen(false)}
        className="text-white hover:text-gray-200"
      >
        <X size={20} />
      </button> */}
    {/* </div> */}
// 
    {/* Messages */}
    {/* <div className="flex-1 p-4 overflow-y-auto space-y-2">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-2 rounded ${
            msg.from === "bot" ? "bg-red-600 self-start" : "bg-gray-800 self-end"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div> */}

    {/* Input
    <div className="p-2 border-t border-red-600 flex">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        placeholder="Type a message..."
        className="flex-1 bg-black text-white border border-red-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
      />
    </div> */}
{/* //   </div> */}
{/* // )} */}
{/* //       </div> */}
   {/* Chatbot Component */}
      <Chatbot
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
    </section>
  );
}
