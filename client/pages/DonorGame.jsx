import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Heart, Calendar, Users, TrendingUp, Gift, Crown, Medal, Droplets, Shield, Target } from 'lucide-react';

const BloodBankGamification = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    bloodType: 'O+',
    totalDonations: 12,
    currentBadge: 'Gold Donor',
    points: 2400,
    nextMilestone: 15,
    streak: 8,
    rank: 5,
    lastDonation: '2024-07-15'
  });

  // Badge system configuration with blood bank theme
  const badges = [
    { 
      name: 'First Drop', 
      icon: Droplets, 
      color: 'text-red-500', 
      bgColor: 'bg-red-50',
      requirement: 1, 
      points: 100,
      description: 'Your journey as a life saver begins!'
    },
    { 
      name: 'Bronze Donor', 
      icon: Medal, 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50',
      requirement: 3, 
      points: 300,
      description: 'Committed to saving lives'
    },
    { 
      name: 'Silver Donor', 
      icon: Award, 
      color: 'text-gray-500', 
      bgColor: 'bg-gray-50',
      requirement: 6, 
      points: 600,
      description: 'A true community hero'
    },
    { 
      name: 'Gold Donor', 
      icon: Trophy, 
      color: 'text-yellow-500', 
      bgColor: 'bg-yellow-50',
      requirement: 10, 
      points: 1000,
      description: 'Golden heart, golden impact'
    },
    { 
      name: 'Platinum Hero', 
      icon: Crown, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      requirement: 15, 
      points: 1500,
      description: 'Elite life saver'
    },
    { 
      name: 'Life Guardian', 
      icon: Shield, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      requirement: 25, 
      points: 2500,
      description: 'Guardian of precious lives'
    },
    { 
      name: 'Blood Angel', 
      icon: Star, 
      color: 'text-rose-600', 
      bgColor: 'bg-rose-50',
      requirement: 50, 
      points: 5000,
      description: 'The ultimate blood donation champion'
    }
  ];

  // Sample leaderboard data
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Sarah Johnson', bloodType: 'AB+', donations: 28, points: 5600, badge: 'Life Guardian', streak: 15 },
    { rank: 2, name: 'Mike Chen', bloodType: 'A-', donations: 22, points: 4400, badge: 'Life Guardian', streak: 12 },
    { rank: 3, name: 'Emma Wilson', bloodType: 'B+', donations: 18, points: 3600, badge: 'Platinum Hero', streak: 9 },
    { rank: 4, name: 'David Brown', bloodType: 'O-', donations: 15, points: 3000, badge: 'Platinum Hero', streak: 7 },
    { rank: 5, name: 'John Doe', bloodType: 'O+', donations: 12, points: 2400, badge: 'Gold Donor', streak: 8 },
    { rank: 6, name: 'Lisa Garcia', bloodType: 'A+', donations: 11, points: 2200, badge: 'Gold Donor', streak: 5 },
    { rank: 7, name: 'Tom Anderson', bloodType: 'B-', donations: 9, points: 1800, badge: 'Silver Donor', streak: 4 },
    { rank: 8, name: 'Anna Martinez', bloodType: 'AB-', donations: 7, points: 1400, badge: 'Silver Donor', streak: 3 }
  ]);

  const getCurrentBadge = (donations) => {
    return badges.slice().reverse().find(badge => donations >= badge.requirement);
  };

  const getNextBadge = (donations) => {
    return badges.find(badge => donations < badge.requirement);
  };

  const getProgressPercentage = () => {
    const nextBadge = getNextBadge(userProfile.totalDonations);
    if (!nextBadge) return 100;
    const currentBadge = getCurrentBadge(userProfile.totalDonations);
    const prevRequirement = currentBadge ? currentBadge.requirement : 0;
    const progress = ((userProfile.totalDonations - prevRequirement) / (nextBadge.requirement - prevRequirement)) * 100;
    return Math.min(progress, 100);
  };

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-200 text-blue-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-200 text-green-900'
    };
    return colors[bloodType] || 'bg-gray-100 text-gray-800';
  };

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {userProfile.name}!</h2>
            <p className="opacity-90">Thank you for being a hero in our community</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBloodTypeColor(userProfile.bloodType)} bg-white`}>
              <Droplets className="w-4 h-4 mr-1" />
              {userProfile.bloodType}
            </div>
          </div>
        </div>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Droplets className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userProfile.totalDonations}</div>
              <div className="text-sm text-gray-600">Total Donations</div>
              <div className="text-xs text-red-600 font-medium">Lives Saved: {userProfile.totalDonations * 3}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userProfile.points}</div>
              <div className="text-sm text-gray-600">Reward Points</div>
              <div className="text-xs text-yellow-600 font-medium">{userProfile.currentBadge}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userProfile.streak}</div>
              <div className="text-sm text-gray-600">Month Streak</div>
              <div className="text-xs text-blue-600 font-medium">Keep it up!</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">#{userProfile.rank}</div>
              <div className="text-sm text-gray-600">Local Rank</div>
              <div className="text-xs text-green-600 font-medium">Chennai Area</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Badge & Progress */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Your Achievement Journey</h3>
          <div className="text-sm text-gray-500">Last donation: {userProfile.lastDonation}</div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-xl text-gray-900">{userProfile.currentBadge}</div>
              <div className="text-gray-600 mb-2">Current Achievement Level</div>
              <div className="text-sm text-gray-500">You've helped save {userProfile.totalDonations * 3} lives so far!</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-medium text-gray-700">Progress to Platinum Hero</span>
              <span className="text-gray-600">{userProfile.totalDonations}/{userProfile.nextMilestone} donations</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {userProfile.nextMilestone - userProfile.totalDonations} more donations to unlock next level
            </div>
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Life-Saving Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-red-600 mb-1">{userProfile.totalDonations * 3}</div>
            <div className="text-sm text-gray-600">Lives Potentially Saved</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-red-600 mb-1">{userProfile.totalDonations * 450}ml</div>
            <div className="text-sm text-gray-600">Blood Donated</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-red-600 mb-1">{userProfile.streak * 4}</div>
            <div className="text-sm text-gray-600">Weeks of Commitment</div>
          </div>
        </div>
      </div>

      {/* Next Rewards Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center space-x-3 mb-3">
            <Crown className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-gray-900">Next Achievement</span>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            <strong>Platinum Hero Badge</strong> - Just 3 more donations away!
          </div>
          <div className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
            +1500 bonus points when unlocked
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center space-x-3 mb-3">
            <Gift className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-gray-900">Special Reward</span>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            Free comprehensive health checkup after your next donation
          </div>
          <button className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Schedule Donation
          </button>
        </div>
      </div>
    </div>
  );

  const BadgesView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Achievement Collection</h3>
          <div className="text-sm text-gray-500">
            {badges.filter(badge => userProfile.totalDonations >= badge.requirement).length} of {badges.length} earned
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge, index) => {
            const IconComponent = badge.icon;
            const isEarned = userProfile.totalDonations >= badge.requirement;
            
            return (
              <div key={index} className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                isEarned 
                  ? `${badge.bgColor} border-gray-200 shadow-md` 
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}>
                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-full mb-4 ${
                    isEarned ? 'bg-white shadow-sm' : 'bg-gray-200'
                  }`}>
                    <IconComponent className={`w-8 h-8 ${
                      isEarned ? badge.color : 'text-gray-400'
                    }`} />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900">{badge.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  <div className="text-xs text-gray-500 mb-2">
                    {badge.requirement} donation{badge.requirement > 1 ? 's' : ''} required
                  </div>
                  <div className="text-sm font-semibold text-red-600 mb-3">
                    {badge.points} reward points
                  </div>
                  {isEarned && (
                    <div className="inline-flex items-center text-xs text-white bg-green-500 px-3 py-1 rounded-full">
                      <Award className="w-3 h-3 mr-1" />
                      Earned
                    </div>
                  )}
                  {!isEarned && (
                    <div className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                      {badge.requirement - userProfile.totalDonations} more needed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const LeaderboardView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Community Heroes Leaderboard</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
            <Users className="w-4 h-4" />
            <span>Chennai Blood Bank Network</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {leaderboard.map((donor, index) => (
            <div key={index} className={`p-4 rounded-xl transition-all duration-300 ${
              donor.name === userProfile.name 
                ? 'bg-red-50 border-2 border-red-200 shadow-md' 
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-md'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    donor.rank <= 3 
                      ? donor.rank === 1 
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-md' 
                        : donor.rank === 2 
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md' 
                        : 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {donor.rank}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-semibold text-gray-900">{donor.name}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBloodTypeColor(donor.bloodType)}`}>
                        <Droplets className="w-3 h-3 mr-1" />
                        {donor.bloodType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-medium">{donor.donations} donations</span>
                      <span className="text-gray-400">•</span>
                      <span>{donor.points} points</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-orange-600 font-medium">{donor.streak} month streak</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700 mb-1">{donor.badge}</div>
                  {donor.rank <= 3 && (
                    <div className="flex items-center justify-end">
                      <Trophy className={`w-5 h-5 ${
                        donor.rank === 1 ? 'text-yellow-500' :
                        donor.rank === 2 ? 'text-gray-500' : 'text-amber-600'
                      }`} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Target className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-2">Climb to the Top!</h3>
            <p className="text-sm opacity-90 mb-4">
              You're just 3 donations away from breaking into the top 3! 
              Regular donations help you maintain your streak and earn bonus points.
            </p>
            <div className="flex space-x-3">
              <button className="bg-white text-red-600 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                Schedule Donation
              </button>
              <button className="border border-white/30 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                Invite Friends
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blood Bank Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LifeBlood Rewards</h1>
                <p className="text-sm text-gray-600">Blood Bank Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Emergency Hotline</div>
                <div className="text-sm text-red-600 font-bold">+91 99999 99999</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'badges', label: 'My Achievements', icon: Award },
              { id: 'leaderboard', label: 'Community Heroes', icon: Trophy }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'badges' && <BadgesView />}
          {activeTab === 'leaderboard' && <LeaderboardView />}
        </div>
      </div>
    </div>
  );
};

export default BloodBankGamification;