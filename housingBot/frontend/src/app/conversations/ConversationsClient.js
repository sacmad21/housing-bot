"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "primereact/button";
import {
  MessageCircle,
  ArrowLeft,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  Moon,
  Sun,
  ExternalLink,
  Search,
  Calendar,
  Filter,
  Clock
} from "lucide-react";

const fetchConvoData = async (username, setConversations, setError) => {
  if (!username) {
    setError("Username is required to fetch conversations.");
    return;
  }

  try {
    const response = await axios.get(`/api/conversations?username=${username}`);
    // console.log("Raw API Response:", response.data);

    if (typeof response.data === "string") {
      // Extract JSON from string if response is incorrect
      const jsonStartIndex = response.data.indexOf("["); // Find the start of JSON
      const jsonString = response.data.slice(jsonStartIndex); // Remove unwanted text
      const cleanedJson = JSON.parse(jsonString); // Parse valid JSON

      setConversations(cleanedJson);
      localStorage.setItem("conversations", JSON.stringify(cleanedJson));
    } else {
      // If it's already a valid object, set it normally
      setConversations(response.data);
      localStorage.setItem("conversations", JSON.stringify(response.data));
    }
  } catch (error) {
    setConversations([]);
    setError("Error fetching conversations.");
    console.error("Error fetching conversations:", error);
  }
};

export default function ConversationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedConvos, setExpandedConvos] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTimeframe, setFilterTimeframe] = useState("all");

  useEffect(() => {
    if (!username) {
      setError("Username not found. Please log in.");
      setLoading(false);
      return;
    }

    // Check system preference for dark mode
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }

    // Load dark mode setting from localStorage
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    document.body.classList.toggle("dark", savedMode);

    fetchConvoData(username, setConversations, setError).finally(() =>
      setLoading(false)
    );
  }, [username]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode);
      document.body.classList.toggle("dark", newMode);
      return newMode;
    });
  };

  const toggleExpand = (id) => {
    setExpandedConvos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNavigateBack = () => {
    router.push(`/chat?username=${username}`);
  };

  // const formatTimestamp = (timestamp) => {
  //   if (!timestamp) return "Unknown date";
    
  //   try {
  //     const date = new Date(timestamp);
  //     return date.toLocaleString();
  //   } catch {
  //     return timestamp;
  //   }
  // };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown date";
    
    try {
        const date = new Date(timestamp);
        
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    } catch {
        return timestamp;
    }
};

  const deleteConversation = async (id) => {
    try {
      await axios.delete(`/api/conversations?id=${id}`);
      setConversations(conversations.filter(convo => convo._id !== id));
      showToast("Conversation deleted successfully");
    } catch (error) {
      console.error("Failed to delete conversation", error);
      showToast("Failed to delete conversation", "error");
    }
  };

  const showToast = (message, type = "success") => {
    const isDarkMode = document.body.classList.contains("dark");
    const toast = document.createElement("div");
    const toastId = `toast-${Date.now()}`;
    toast.dataset.toastId = toastId;
    
    // Modern, softer color palette that matches the Facebook-like blue theme
    const bgColor =
      type === "success"
        ? isDarkMode
          ? "bg-blue-600/90" // Deeper blue with transparency in dark mode
          : "bg-blue-500/90" // Primary blue with transparency in light mode
        : type === "error"
        ? isDarkMode
          ? "bg-red-600/90" // Deep red with transparency in dark mode
          : "bg-red-500/90" // Bright red with transparency in light mode
        : type === "info"
        ? isDarkMode
          ? "bg-indigo-600/90" // Rich indigo with transparency in dark mode
          : "bg-indigo-500/90" // Medium indigo with transparency in light mode
        : isDarkMode
        ? "bg-gray-700/90" // Dark gray with transparency for loading in dark mode
        : "bg-gray-600/90"; // Medium gray with transparency in light mode
    
    // Updated toast with a more modern look - added backdrop filter for glassmorphism effect
    toast.className = `fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-3 rounded-lg backdrop-blur-sm shadow-lg z-50 animate-fade-in-up ${bgColor} text-white text-sm font-montserrat border border-white/10`;
    
    if (type === "loading") {
      toast.innerHTML = `<div class="loader mr-2"></div> ${message}`;
    } else {
      // Add appropriate icon based on toast type
      const icon = type === "success" 
        ? '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        : type === "error"
        ? '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
        : '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      
      toast.innerHTML = `${icon} <span>${message}</span>`;
    }
    
    document.body.appendChild(toast);
    
    if (type !== "loading") {
      setTimeout(() => removeToast(toastId), 3000);
    }
    
    return toastId;
  };

  const removeToast = (toastId) => {
    const toast = document.querySelector(`[data-toast-id="${toastId}"]`);
    if (toast) {
      toast.classList.add("animate-fade-out");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  };

  const filterConversations = () => {
    if (!conversations || !Array.isArray(conversations)) return [];
    
    let filtered = [...conversations];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(convo => 
        convo.messages.some(msg => 
          msg.text && msg.text.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Filter by timeframe
    if (filterTimeframe !== "all") {
      const now = new Date();
      let timeLimit;
      
      switch(filterTimeframe) {
        case "hour":
          timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "day":
          timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeLimit = null;
      }
      
      if (timeLimit) {
        filtered = filtered.filter(convo => {
          const convoDate = new Date(convo.createdAt || 0);
          return convoDate > timeLimit;
        });
      }
    }
    
    // Sort by most recent first
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  };

  const baseTheme = {
    background: darkMode ? "bg-gray-900" : "bg-gray-100",
    text: darkMode ? "text-gray-100" : "text-gray-800",
    primary: "bg-[#4267B2]",
    primaryHover: "hover:bg-[#365899]",
    card: darkMode ? "bg-gray-800" : "bg-white",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    userMessage: "bg-[#4267B2] text-white",
    botMessage: darkMode
      ? "bg-gray-800 text-gray-200"
      : "bg-white text-gray-800",
    input: darkMode
      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
      : "bg-gray-100 text-gray-800 border-gray-300 placeholder-gray-500",
    accent: darkMode ? "text-blue-300" : "text-blue-600",
    buttonActive: "active:scale-95",
    shadow: darkMode ? "shadow-dark" : "shadow-md",
    transition: "transition-all duration-200",
  };

  const filteredConversations = filterConversations();
  
  return (
    <div
      className={`flex flex-col min-h-screen ${baseTheme.background} ${baseTheme.text} ${baseTheme.transition} font-plus-jakarta`}
    >
      {/* Header */}
      <header
        className={`backdrop-blur-md bg-opacity-95 ${baseTheme.primary} text-white py-4 px-5 sticky top-0 z-10 ${baseTheme.shadow} ${baseTheme.transition}`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button
              icon={<ArrowLeft size={18} />}
              className={`p-2 hover:bg-[#365899] rounded-full ${baseTheme.transition} ${baseTheme.buttonActive}`}
              onClick={handleNavigateBack}
              aria-label="Go back"
            />
            <div className="hidden md:flex bg-white bg-opacity-20 p-2.5 rounded-full">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <h1 className="font-outfit font-bold text-xl">Saved Chats</h1>
                <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
                  {username}
                </span>
              </div>
              <div className="flex items-center text-xs text-blue-100 opacity-80 mt-0.5 font-dm-sans">
                <Clock size={12} className="mr-1" />
                <span>
                  {filteredConversations.length} conversation
                  {filteredConversations.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleDarkMode}
              className={`p-2 hover:bg-[#365899] rounded-full ${baseTheme.transition} ${baseTheme.buttonActive}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            {/* <Button
              icon={<ExternalLink size={18} />}
              className={`p-2 hover:bg-[#365899] rounded-full ${baseTheme.transition} ${baseTheme.buttonActive}`}
              onClick={handleNavigateBack}
              aria-label="Back to chat"
            /> */}
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className={`px-4 py-3 ${baseTheme.card} border-b ${baseTheme.border} ${baseTheme.transition}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
              <Search size={16} className={baseTheme.accent} />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 py-2.5 rounded-lg pr-4 border font-montserrat ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${baseTheme.transition}`}
            />
          </div>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3">
            <div className="flex items-center">
              <Calendar size={16} className={`mr-2 ${baseTheme.accent}`} />
              <div
                className={`relative inline-flex rounded-full p-1 ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                {["hour", "day", "week", "all"].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setFilterTimeframe(timeframe)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                      baseTheme.transition
                    } ${
                      filterTimeframe === timeframe
                        ? `bg-[#4267B2] text-white shadow-sm`
                        : `${darkMode ? "text-gray-300" : "text-gray-700"}`
                    } font-poppins`}
                  >
                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-4 ${baseTheme.background}`}>
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="loader-lg"></div>
            </div>
          ) : error ? (
            <div className={`${baseTheme.card} p-6 rounded-lg ${baseTheme.shadow} text-center`}>
              <div className="text-red-500 mb-3">
                <AlertCircle size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-medium mb-2 font-outfit">{error}</h3>
              <p className="mb-4 font-dm-sans">Please try again or go back to the chat page.</p>
              <Button
                icon={<ArrowLeft size={16} className="mr-2" />}
                label="Back to Chat"
                onClick={handleNavigateBack}
                className={`px-5 py-2 rounded-full text-white text-sm flex items-center justify-center ${baseTheme.transition} ${baseTheme.buttonActive} bg-[#4267B2] hover:bg-[#365899] font-outfit font-medium`}
              />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className={`${baseTheme.card} p-8 rounded-lg ${baseTheme.shadow} text-center`}>
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <MessageCircle size={32} className={baseTheme.accent} />
                </div>
              </div>
              <h3 className="text-xl font-medium mb-3 font-outfit">No conversations found</h3>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-6 font-dm-sans`}>
                {searchTerm || filterTimeframe !== "all" 
                  ? "Try changing your search or filter settings" 
                  : "Start a new chat and save it to see it here"}
              </p>
              <Button
                icon={<ArrowLeft size={16} className="mr-2" />}
                label="Back to Chat"
                onClick={handleNavigateBack}
                className={`px-5 py-2 rounded-full text-white text-sm flex items-center justify-center ${baseTheme.transition} ${baseTheme.buttonActive} bg-[#4267B2] hover:bg-[#365899] font-outfit font-medium`}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((convo) => (
                <div
                  key={convo._id}
                  className={`${baseTheme.card} rounded-lg border ${baseTheme.border} ${baseTheme.shadow} overflow-hidden animate-fade-in ${baseTheme.transition}`}
                >
                  {/* Conversation Header */}
                  <div className="flex items-center justify-between p-4 border-b border-opacity-50 border-gray-300 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className={`bg-[#4267B2] rounded-full p-2.5 ${baseTheme.shadow}`}>
                        <MessageCircle size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium font-outfit">Conversation{/*{convo.sessionId.slice(-4)}*/}</h3>
                        <p className="text-xs opacity-70 font-montserrat">
                          {formatTimestamp(convo.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        icon={<Trash2 size={16} />}
                        className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-red-900" : "bg-gray-100 hover:bg-red-100"} text-red-500 ${baseTheme.transition} ${baseTheme.buttonActive}`}
                        onClick={() => deleteConversation(convo._id)}
                        aria-label="Delete conversation"
                      />
                      <Button
                        icon={expandedConvos[convo._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} ${baseTheme.transition} ${baseTheme.buttonActive}`}
                        onClick={() => toggleExpand(convo._id)}
                        aria-label={expandedConvos[convo._id] ? "Collapse" : "Expand"}
                      />
                    </div>
                  </div>

                  {/* Conversation Preview */}
                  {!expandedConvos[convo._id] && convo.messages && convo.messages.length > 0 && (
                    <div className="p-4 border-b border-opacity-50 border-gray-300 dark:border-gray-700">
                      <div className="flex items-start space-x-2">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center`}>
                          <User size={16} className="text-gray-700" />
                        </div>
                        <div className={`${baseTheme.background} rounded-lg px-3 py-2 max-w-[90%]`}>
                          <p className="text-sm font-dm-sans line-clamp-2">
                            {convo.messages[0].text}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expanded Messages */}
                  {expandedConvos[convo._id] && convo.messages && (
                    <div className="p-4 space-y-4">
                      {convo.messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex items-start max-w-[80%] md:max-w-[70%]">
                            {msg.sender === "bot" && (
                              <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-[#4267B2] flex items-center justify-center mr-2 mt-1`}>
                                <Bot size={16} className="text-white" />
                              </div>
                            )}

                            <div
                              className={`rounded-lg px-4 py-3 ${
                                msg.sender === "user"
                                  ? "bg-[#4267B2] text-white"
                                  : `${baseTheme.botMessage} border ${baseTheme.border}`
                              } ${baseTheme.shadow}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`text-xs font-semibold ${
                                    msg.sender === "user"
                                      ? "text-blue-200"
                                      : baseTheme.accent
                                  } font-poppins`}
                                >
                                  {msg.sender === "user" ? (
                                    <User size={12} className="inline mr-1" />
                                  ) : (
                                    <Bot size={12} className="inline mr-1" />
                                  )}
                                  {msg.sender === "user" ? "You" : "AI"}
                                </span>
                                <span className="text-xs opacity-70 font-montserrat">
                                  {msg.timestamp || ""}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap text-sm font-dm-sans">
                                {msg.text}
                              </p>
                            </div>

                            {msg.sender === "user" && (
                              <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1`}>
                                <User size={16} className="text-gray-700" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Footer with collection info */}
                  <div className={`${darkMode ? "bg-gray-750" : "bg-gray-50"} px-4 py-2.5 text-xs flex justify-between items-center`}>
                    <span className="font-medium font-montserrat flex items-center">
                      <Filter size={12} className="mr-1.5" />
                      Collection: {convo.collectionName || "general"}
                    </span>
                    <button 
                      className={`font-medium ${baseTheme.accent} hover:underline flex items-center font-poppins`}
                      onClick={() => toggleExpand(convo._id)}
                    >
                      {expandedConvos[convo._id] ? "Show less" : "View full conversation"}
                      <ChevronDown size={14} className={`ml-1 transform ${expandedConvos[convo._id] ? "rotate-180" : ""} ${baseTheme.transition}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={`p-4 text-center text-xs ${darkMode ? "text-gray-500" : "text-gray-400"} font-montserrat`}>
        <p>can make mistake. Check important info.</p>
      </footer>

      {/* Global styles */}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-in-out;
        }

        .animate-fade-out {
          animation: fadeOut 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        .loader {
          width: 18px;
          height: 18px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid ${darkMode ? "#8b5cf6" : "#4267B2"};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loader-lg {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid ${darkMode ? "#8b5cf6" : "#4267B2"};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: ${darkMode ? "#1e1e1e" : "#f1f1f1"};
        }

        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? "#555" : "#888"};
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? "#666" : "#999"};
        }

        /* Helper class for dark theming */
        .bg-gray-750 {
          background-color: #2a2e37;
        }

        /* Font classes for Next.js font implementation */
        .font-inter {
          font-family: var(--font-inter);
        }

        .font-poppins {
          font-family: var(--font-poppins);
        }

        .font-dm-sans {
          font-family: var(--font-dm-sans);
        }

        .font-outfit {
          font-family: var(--font-outfit);
        }

        .font-plus-jakarta {
          font-family: var(--font-plus-jakarta);
        }

        .font-montserrat {
          font-family: var(--font-montserrat);
        }

        /* Line clamp utilities */
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Add shadow variants */
        .shadow-dark {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}