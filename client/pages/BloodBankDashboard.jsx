import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, RefreshCw, Users, Droplet, User, Activity, Calendar, Award, Download, MapPin, Phone, Mail, Star, Trophy, Heart, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const UserBloodDashboard = () => {
  // User profile and donation data
  const [userProfile, setUserProfile] = useState({});
  const [donationHistory, setDonationHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [nextEligibleDate, setNextEligibleDate] = useState("");
  const [scheduledAppointments, setScheduledAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(null);
  
  // Refs for GSAP animations
  const headerRef = useRef(null);
  const welcomeRef = useRef(null);
  const statsRef = useRef(null);
  const profileRef = useRef(null);
  const eligibilityRef = useRef(null);
  const appointmentsRef = useRef(null);
  const achievementsRef = useRef(null);
  const historyRef = useRef(null);
  const footerRef = useRef(null);

  // Simulated user data
  const fetchUserProfile = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: "John Doe",
          bloodGroup: "O+",
          phone: "+1234567890",
          email: "john.doe@email.com",
          address: "123 Main St, City, State",
          totalDonations: 12,
          totalUnits: 24,
          joinDate: "2023-01-15",
          lastDonation: "2025-08-20"
        });
      }, 500);
    });
  };

  const fetchDonationHistory = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, date: "2025-08-20", hospital: "City General Hospital", units: 2, status: "Completed", certificate: true },
          { id: 2, date: "2025-05-15", hospital: "St. Mary's Medical Center", units: 2, status: "Completed", certificate: true },
          { id: 3, date: "2025-02-10", hospital: "Regional Medical Center", units: 2, status: "Completed", certificate: true },
          { id: 4, date: "2024-11-05", hospital: "Emergency Care Hospital", units: 2, status: "Completed", certificate: true },
          { id: 5, date: "2024-08-20", hospital: "City General Hospital", units: 2, status: "Completed", certificate: true },
          { id: 6, date: "2024-05-15", hospital: "Community Health Center", units: 2, status: "Completed", certificate: true },
        ]);
      }, 600);
    });
  };

  const fetchAchievements = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, title: "Life Saver", description: "Completed 10+ donations", icon: "heart", earned: true, date: "2024-08-20" },
          { id: 2, title: "Regular Donor", description: "Donated 5 times", icon: "trophy", earned: true, date: "2024-02-15" },
          { id: 3, title: "First Timer", description: "Completed first donation", icon: "star", earned: true, date: "2023-01-15" },
          { id: 4, title: "Hero Status", description: "Complete 20 donations", icon: "award", earned: false, date: null },
          { id: 5, title: "Community Champion", description: "Donate for 2+ years", icon: "users", earned: true, date: "2025-01-15" }
        ]);
      }, 400);
    });
  };

  const fetchScheduledAppointments = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, date: "2025-09-25", time: "10:00 AM", hospital: "City General Hospital", status: "Confirmed" },
          { id: 2, date: "2025-10-15", time: "2:30 PM", hospital: "St. Mary's Medical Center", status: "Confirmed" },
          { id: 3, date: "2025-11-05", time: "11:15 AM", hospital: "Regional Medical Center", status: "Pending" }
        ]);
      }, 500);
    });
  };

  const fetchDonationTrends = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { month: "Jan", donations: 0 },
          { month: "Feb", donations: 2 },
          { month: "Mar", donations: 0 },
          { month: "Apr", donations: 0 },
          { month: "May", donations: 2 },
          { month: "Jun", donations: 0 },
          { month: "Jul", donations: 0 },
          { month: "Aug", donations: 2 },
        ]);
      }, 500);
    });
  };

  // GSAP Animations
  useEffect(() => {
    if (!loading) {
      // Header animation
      gsap.fromTo(headerRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      // Welcome section animation
      gsap.fromTo(welcomeRef.current.children, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.15,
          scrollTrigger: {
            trigger: welcomeRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );

      // Stats counter animation
      const stats = statsRef.current.children;
      gsap.fromTo(stats, 
        { scale: 0.8, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );

      // Profile and eligibility section
      gsap.fromTo([profileRef.current, eligibilityRef.current], 
        { x: -50, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.2,
          scrollTrigger: {
            trigger: profileRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );

      // Appointments animation
      const appointmentCards = appointmentsRef.current.children;
      gsap.fromTo(appointmentCards, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          scrollTrigger: {
            trigger: appointmentsRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );

      // Achievements animation
      const achievementCards = achievementsRef.current.children;
      gsap.fromTo(achievementCards, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          scrollTrigger: {
            trigger: achievementsRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );

      // History section animation
      const historyItems = historyRef.current.children;
      gsap.fromTo(historyItems, 
        { x: -30, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          scrollTrigger: {
            trigger: historyRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );

      // Footer animation
      gsap.fromTo(footerRef.current, 
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8,
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }
  }, [loading]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profile, history, achievementsData, appointments, trends] = await Promise.all([
          fetchUserProfile(),
          fetchDonationHistory(),
          fetchAchievements(),
          fetchScheduledAppointments(),
          fetchDonationTrends()
        ]);
        
        setUserProfile(profile);
        setDonationHistory(history);
        setAchievements(achievementsData);
        setScheduledAppointments(appointments);
        
        // Calculate next eligible date (3 months after last donation)
        const lastDonationDate = new Date(profile.lastDonation);
        lastDonationDate.setMonth(lastDonationDate.getMonth() + 3);
        setNextEligibleDate(lastDonationDate.toISOString().split('T')[0]);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const generateCertificate = (donation) => {
    return {
      donorName: userProfile.name,
      donationDate: donation.date,
      hospital: donation.hospital,
      units: donation.units,
      certificateId: `CERT-${donation.id}-${Date.now()}`,
      bloodGroup: userProfile.bloodGroup
    };
  };

  const downloadCertificate = (donation) => {
    const cert = generateCertificate(donation);
    
    // Animate certificate modal appearance
    setShowCertificate(cert);
    
    // Animate the modal in after a slight delay to allow state to update
    setTimeout(() => {
      const modal = document.querySelector(".certificate-modal");
      if (modal) {
        gsap.fromTo(modal, 
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
      }
    }, 10);
  };

  const closeCertificate = () => {
    const modal = document.querySelector(".certificate-modal");
    if (modal) {
      gsap.to(modal, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setShowCertificate(null)
      });
    } else {
      setShowCertificate(null);
    }
  };

const cancelAppointment = async (appointmentId) => {
  try {
    // First: API call to cancel in database
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication token if needed
        // 'Authorization': `Bearer ${userToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to cancel appointment');
    }

    // Only remove from local state if database operation succeeded
    const appointmentCard = document.getElementById(`appointment-${appointmentId}`);
    if (appointmentCard) {
      gsap.to(appointmentCard, {
        opacity: 0,
        height: 0,
        duration: 0.5,
        onComplete: () => {
          setScheduledAppointments(prev => 
            prev.filter(appointment => appointment.id !== appointmentId)
          );
        }
      });
    }
    
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    // Show error message to user
    alert("Failed to cancel appointment. Please try again.");
  }
};

  const getAchievementIcon = (iconType) => {
    switch(iconType) {
      case 'heart': return <Heart className="w-8 h-8" />;
      case 'trophy': return <Trophy className="w-8 h-8" />;
      case 'star': return <Star className="w-8 h-8" />;
      case 'award': return <Award className="w-8 h-8" />;
      case 'users': return <Users className="w-8 h-8" />;
      default: return <Award className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <header ref={headerRef} className="w-full bg-black border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              {/* Red arrow icon */}
              <svg
                width="10"
                height="58"
                viewBox="0 0 10 58"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-2"
              >
                <path d="M0 14.5L10 0V43L0 57.5V14.5Z" fill="#FF0000" />
              </svg>
              <a
                href="/"
                className="text-red-500 font-bold text-2xl"
                style={{
                  fontFamily:
                    "Instrument Sans, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                LIFE LINK
              </a>
            </div>

            {/* Navigation buttons */}
            <div className="hidden md:flex space-x-9">
              <a
                href="/"
                className="hover:text-red-400 text-xl transition-colors"
              >
                Home
              </a>
              <a
                href="/looking-for-blood"
                className="hover:text-red-400 text-xl transition-colors"
              >
                Looking for Blood
              </a>
              <a
                href="/want-to-donate"
                className="hover:text-red-400 text-xl transition-colors"
              >
                Want to donate Blood
              </a>
              <a
                href="/blood-bank-dashboard"
                className="text-red-500 hover:text-red-400 text-xl transition-colors"
              >
                Blood Bank Dashboard
              </a>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-right">
                <p className="text-white font-medium">{userProfile.name}</p>
                <p className="text-red-400 text-xs">{userProfile.bloodGroup} Donor</p>
              </div>
              <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        {/* Welcome Section */}
        <div ref={welcomeRef} className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Welcome Back, </span>
            <span className="text-red-500">{userProfile.name.split(' ')[0]}</span>
            <span className="text-white"> — </span>
            <span className="text-white">Life Saver</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Thank you for being a hero! Your blood donations have made a real difference in saving lives.
          </p>

          {/* Personal Stats */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {userProfile.totalDonations}
              </div>
              <div className="text-red-400 font-medium">Total Donations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {userProfile.totalUnits}
              </div>
              <div className="text-red-400 font-medium">Units Donated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {achievements.filter(a => a.earned).length}
              </div>
              <div className="text-red-400 font-medium">Achievements Earned</div>
            </div>
          </div>
        </div>

        {/* Profile & Next Donation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Profile Info */}
          <div ref={profileRef} className="lg:col-span-2 bg-black-900 bg-opacity-50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-red-400" />
              Donor Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Blood Group</label>
                  <p className="text-2xl font-bold text-red-400">{userProfile.bloodGroup}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p className="text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {userProfile.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {userProfile.email}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Member Since</label>
                  <p className="text-white">{userProfile.joinDate}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Last Donation</label>
                  <p className="text-white">{userProfile.lastDonation}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Address</label>
                  <p className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {userProfile.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Donation Eligibility */}
          <div ref={eligibilityRef} className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-6 border border-red-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Next Donation
            </h3>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{nextEligibleDate}</div>
              <p className="text-red-200 text-sm mb-4">You'll be eligible to donate again</p>
              <button className="w-full bg-white text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Scheduled Appointments Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Your Scheduled Appointments</h2>
          <div ref={appointmentsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduledAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                id={`appointment-${appointment.id}`}
                className="bg-gray-900 bg-opacity-50 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-400" />
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      appointment.status === 'Confirmed' 
                        ? 'bg-green-900 bg-opacity-30 text-green-400' 
                        : 'bg-yellow-900 bg-opacity-30 text-yellow-400'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => cancelAppointment(appointment.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{appointment.hospital}</h3>
                  <p className="text-gray-400 text-sm">{appointment.date} at {appointment.time}</p>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-red-700 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
            
            {scheduledAppointments.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>You don't have any scheduled appointments.</p>
                <button className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-colors">
                  Schedule Your First Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Your Achievements</h2>
          <div ref={achievementsRef} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-2xl border transition-all hover:scale-105 ${
                  achievement.earned
                    ? "bg-red-500 bg-opacity-20 border-red-500 border-opacity-50"
                    : "bg-gray-800 bg-opacity-50 border-gray-700 opacity-50"
                }`}
              >
                <div className={`text-center ${achievement.earned ? "text-red-400" : "text-gray-500"}`}>
                  {getAchievementIcon(achievement.icon)}
                  <h4 className="font-bold mt-2 mb-1">{achievement.title}</h4>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                  {achievement.earned && achievement.date && (
                    <p className="text-xs text-red-300 mt-2">Earned: {achievement.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation History & Certificates */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Donation History & Certificates</h2>
          <div className="bg-gray-900 bg-opacity-50 rounded-2xl p-6 border border-gray-800">
            <div ref={historyRef} className="space-y-4">
              {donationHistory.map((donation) => (
                <div key={donation.id} className="bg-black bg-opacity-30 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
                        <Droplet className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{donation.hospital}</div>
                        <div className="text-sm text-gray-400">{donation.date} • {donation.units} units</div>
                        <div className="text-xs text-green-400">{donation.status}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {donation.certificate && (
                        <button
                          onClick={() => downloadCertificate(donation)}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <Award className="w-4 h-4" />
                          Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div ref={footerRef} className="text-center">
          <p className="text-red-400 text-lg font-medium">Thank you for being a life saver! ❤️</p>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="certificate-modal bg-white text-black rounded-2xl p-8 max-w-2xl w-full relative">
            <button
              onClick={closeCertificate}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            
            {/* Certificate Design */}
            <div className="text-center border-4 border-red-500 p-8 rounded-xl bg-gradient-to-br from-red-50 to-white">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-red-600 mb-2">LIFE LINK</h1>
                <h2 className="text-2xl font-bold text-gray-800">Certificate of Appreciation</h2>
              </div>
              
              <div className="mb-6">
                <Award className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-lg text-gray-700">This certificate is presented to</p>
                <h3 className="text-4xl font-bold text-red-600 my-4">{showCertificate.donorName}</h3>
                <p className="text-lg text-gray-700">
                  for the generous donation of <strong>{showCertificate.units} units</strong> of{" "}
                  <strong>{showCertificate.bloodGroup}</strong> blood on{" "}
                  <strong>{showCertificate.donationDate}</strong>
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600">Donation Location:</p>
                <p className="font-semibold text-gray-800">{showCertificate.hospital}</p>
              </div>
              
              <div className="border-t border-gray-300 pt-4">
                <p className="text-sm text-gray-500">Certificate ID: {showCertificate.certificateId}</p>
                <p className="text-red-600 font-semibold mt-2">Your donation saves lives!</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBloodDashboard;