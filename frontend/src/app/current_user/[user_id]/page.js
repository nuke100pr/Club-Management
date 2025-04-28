"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Award, User, Settings, Shield, Activity, FileText, Key, Medal, Users, Bell, Lock, CreditCard, Trash2, HelpCircle, Languages, Edit, Clock } from 'lucide-react';
import { getAuthToken } from "@/utils/auth";

export default function EnhancedUserProfile() {
  // State to track if the current user is viewing their own profile
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState('account');
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    async function fetchAuthToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }

    fetchAuthToken();
  }, []);

  const toggleProfileView = () => {
    setIsOwnProfile(!isOwnProfile);
  };

  if (!authToken) {
    return;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b shadow-sm py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button className="text-blue-600 flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="ml-1">Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-700">User Profile</h1>
          </div>
          
          {/* For demo purposes - toggle between own/other profile view */}
          <button 
            onClick={toggleProfileView} 
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-600"
          >
            {isOwnProfile ? "View as other user" : "View as self"}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow px-4 py-6 md:px-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-24"></div>
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row">
              {/* Avatar */}
              <div className="relative -mt-12 mb-4 md:mb-0">
                <div className="bg-blue-500 text-white text-4xl font-bold w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  R
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
              </div>
              
              {/* User Info */}
              <div className="md:ml-6 flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Ramesh Tendulkar</h2>
                    <div className="flex items-center mt-1">
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Super Admin
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded-full flex items-center">
                        <Activity className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                      <Settings className="w-4 h-4 mr-1" />
                      Edit Profile
                    </button>
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium text-gray-700">
                      More Options
                    </button>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>ramesh@gmail.com</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined: 4/4/2025</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award className="w-4 h-4 mr-2" />
                    <span>Computer Science</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="mb-4 border-b">
          <nav className="flex space-x-8">
            <button 
              className={`py-2 px-1 font-medium ${activeTab === 'account' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('account')}
            >
              Account Details
            </button>
            <button 
              className={`py-2 px-1 font-medium ${activeTab === 'badges' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('badges')}
            >
              Badges
            </button>
            <button 
              className={`py-2 px-1 font-medium ${activeTab === 'memberships' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('memberships')}
            >
              Memberships
            </button>
            {isOwnProfile && (
              <button 
                className={`py-2 px-1 font-medium ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            )}
          </nav>
        </div>

        {/* Account Details Section */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Account Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">User ID</div>
                  <div className="flex items-center">
                    <Key className="w-4 h-4 text-gray-400 mr-2" />
                    <div className="text-gray-800 font-mono">67ef2c87072e6188314b813f</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Account Status</div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <div className="text-gray-800">Active Account</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">User Role</div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-purple-500 mr-2" />
                    <div className="text-gray-800">Super Admin</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Department</div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-blue-500 mr-2" />
                    <div className="text-gray-800">Computer Science</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Security Settings</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <div className="text-gray-800 font-medium">Two-Factor Authentication</div>
                        <div className="text-gray-500 text-sm">Add an extra layer of security to your account</div>
                      </div>
                    </div>
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium text-gray-700 mr-2">
                  Cancel
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Badges Section (Renamed from Activity Log) */}
        {activeTab === 'badges' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Badges & Achievements</h3>
            </div>
            <div className="p-6">
              {/* Featured Badges */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Featured Badges</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Medal className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-gray-800 font-medium mt-2 text-center">Top Contributor</div>
                    <div className="text-gray-500 text-xs text-center mt-1">Earned 3 months ago</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-gray-800 font-medium mt-2 text-center">Expert Solver</div>
                    <div className="text-gray-500 text-xs text-center mt-1">Earned 1 month ago</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-gray-800 font-medium mt-2 text-center">90-Day Streak</div>
                    <div className="text-gray-500 text-xs text-center mt-1">Earned 5 days ago</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-gray-800 font-medium mt-2 text-center">Verified Expert</div>
                    <div className="text-gray-500 text-xs text-center mt-1">Earned 2 weeks ago</div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activities */}
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-800 mb-3">Recent Activities</h4>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Award className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-gray-800 font-medium">Earned "Problem Solver" Badge</div>
                        <div className="text-gray-500 text-sm flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          April 10, 2025
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-gray-800 font-medium">Joined "Frontend Masters" Group</div>
                        <div className="text-gray-500 text-sm flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          April 8, 2025
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-gray-800 font-medium">Published "React Best Practices" Article</div>
                        <div className="text-gray-500 text-sm flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          April 5, 2025
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Medal className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-gray-800 font-medium">Received "Top Contributor" Recognition</div>
                        <div className="text-gray-500 text-sm flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          April 1, 2025
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium text-gray-700">
                  View All Activities
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Memberships Section (Renamed from Permissions) */}
        {activeTab === 'memberships' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Memberships & Teams</h3>
            </div>
            <div className="p-6">
              {/* Active Memberships */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Active Memberships</h4>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-gray-800 font-medium">Development Team</div>
                          <div className="text-gray-500 text-sm">Team Lead • 8 Members</div>
                        </div>
                      </div>
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700">
                        View Team
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-gray-800 font-medium">Research Group</div>
                          <div className="text-gray-500 text-sm">Member • 12 Members</div>
                        </div>
                      </div>
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700">
                        View Team
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-gray-800 font-medium">Project Cosmos</div>
                          <div className="text-gray-500 text-sm">Admin • 5 Members</div>
                        </div>
                      </div>
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700">
                        View Team
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Role-based Access */}
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-800 mb-3">Role-based Access</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-purple-600 mr-2" />
                      <div className="text-gray-800 font-medium">Super Admin</div>
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Highest Access
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-700">User Management</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-700">Project Creation</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-700">System Configuration</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-700">Security Controls</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-700">Financial Operations</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-700">Reporting & Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isOwnProfile && (
                <div className="mt-6 flex justify-end">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Request Additional Access
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Section - Only visible when viewing own profile */}
        {activeTab === 'settings' && isOwnProfile && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Account Settings</h3>
            </div>
            <div className="p-6">
              {/* Profile Settings */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-800 mb-4">Profile Settings</h4>
                
                <div className="space-y-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        className="flex-grow rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        defaultValue="Ramesh Tendulkar"
                      />
                      <button className="ml-2 bg-white border border-gray-300 hover:bg-gray-50 p-2 rounded-md text-gray-500">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="flex">
                      <input 
                        type="email" 
                        className="flex-grow rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        defaultValue="ramesh@gmail.com"
                      />
                      <button className="ml-2 bg-white border border-gray-300 hover:bg-gray-50 p-2 rounded-md text-gray-500">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select className="rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Computer Science</option>
                      <option>Engineering</option>
                      <option>Product Design</option>
                      <option>Marketing</option>
                      <option>Human Resources</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Notification Settings */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-800 mb-4">Notification Settings</h4>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-gray-800 font-medium">Email Notifications</div>
                          <div className="text-gray-500 text-sm">Receive updates via email</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-gray-800 font-medium">Push Notifications</div>
                          <div className="text-gray-500 text-sm">Receive alerts on your device</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-gray-800 font-medium">Team Activity Updates</div>
                          <div className="text-gray-500 text-sm">Get notified about team activities</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Security Settings */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-800 mb-4">Security Settings</h4>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Lock className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-gray-800 font-medium">Two-Factor Authentication</div>
                          <div className="text-gray-500 text-sm">Add an extra layer of security to your account</div>
                        </div>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium">
                        Enable
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Key className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-gray-800 font-medium">Change Password</div>
                          <div className="text-gray-500 text-sm">Last changed 3 months ago</div>
                        </div>
                      </div>
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700">
                        Change
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-gray-800 font-medium">Connected Devices</div>
                          <div className="text-gray-500 text-sm">3 devices currently active</div>
                        </div>
                      </div>
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-red-600 mb-4">Danger Zone</h4>
                
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Trash2 className="w-5 h-5 text-red-500 mr-3" />
                        <div>
                          <div className="text-gray-800 font-medium">Delete Account</div>
                          <div className="text-gray-500 text-sm">Permanently remove your account and all data</div>
                        </div>
                      </div>
                      <button className="bg-white border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium text-red-600">
                        Delete Account
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <HelpCircle className="w-5 h-5 text-red-500 mr-3" />
                        <div>
                          <div className="text-gray-800 font-medium">Export Data</div>
                          <div className="text-gray-500 text-sm">Download all your data in JSON format</div>
                        </div>
                      </div>
                      <button className="bg-white border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium text-red-600">
                        Export Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium text-gray-700 mr-2">
                  Cancel
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}