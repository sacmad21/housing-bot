"use client";
import { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useDarkMode } from "@/context/DarkModeContext";
import { IoMdBookmark } from "react-icons/io";

import {
  BookMarked,
  Send,
  Bookmark,
  Trash2,
  PlusCircle,
  Save,
  Languages,
  Menu,
  LogOut,
  Clock,
  MessageCircle,
  Filter,
  Book,
  Moon,
  Sun,
  Archive,
  User,
  MessageCirclePlus,
  Bot,
  Globe,
  X,
  HardDriveDownload,
} from "lucide-react";

import { isLoggedIn, logout } from "@/lib/auth";
import jsPDF from "jspdf";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("housing");
  const [sessionId, setSessionId] = useState("");
  const [language, setLanguage] = useState("English");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookmarkModal, setBookmarkModal] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState("all");
  const { darkMode, setDarkMode } = useDarkMode();
  const [expandedBookmarks, setExpandedBookmarks] = useState({});
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlUsername = searchParams.get("username"); // Ensure this is a string
  const storedUsername = localStorage.getItem("username");
  const [username, setUsername] = useState(
    () => storedUsername || urlUsername || ""
  );
  // const options = [
  //   { label: "General Collection", value: "general" },
  //   { label: "housing", value: "housing" },
  //   { label: "Housing", value: "housing" },
  //   { label: "Inheritance", value: "inheritance" },
  //   { label: "Land Acquisition", value: "LandAcquisition" },
  //   // { label: "MP Data", value: "MPdata" },
  //   // { label: "MH Law", value: "mhlaw" },
  // ];

  const startingQuestions = [
    "What documents do I need for buying a house?",
    "What are the steps involved in property registration?"
    // "What legal documents do I need for mutual divorce?",
    // "How can the 6 months \"cooling period\" be avoided?"
  ];

  useEffect(() => {
    // fetchBookmarks();

    // Check system preference for dark mode
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }

    // Focus the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (urlUsername && urlUsername !== storedUsername) {
      localStorage.setItem("username", urlUsername);
      setUsername(urlUsername);
    }
  }, [urlUsername, storedUsername]);

  useEffect(() => {
    if (!isLoggedIn()) {
      //console.log("User not logged in");
      // localStorage.clear();
      router.push("/auth/login");
      return;
    }

    const storedSessionId = localStorage.getItem("sessionId");

    if (!storedSessionId || storedSessionId === "loggedOut") {
      const newSessionId = Date.now().toString();
      setSessionId(newSessionId);
      localStorage.setItem("sessionId", newSessionId);
    } else {
      setSessionId(storedSessionId);
      const storedMessages = localStorage.getItem(`chat_${storedSessionId}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    }
  }, [router]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchBookmarks = async (timeFilter = "all") => {
    if (bookmarksLoading) return; // Prevent multiple calls

    setBookmarksLoading(true);
    setFilter(timeFilter);
    setBookmarks([]); // Clear UI while loading

    try {
      const response = await axios.get(
        `/api/bookmarks?filter=${timeFilter}&username=${username}`
      );
      setBookmarks(response.data.bookmarks);
    } catch (error) {
      //console.error("Failed to fetch bookmarks:", error);
      showToast("Unable to load bookmarks. Try again later.", "error");
    } finally {
      setBookmarksLoading(false);
    }
  };

  const handleStartingQuestion = (question) => {
    setInput(question);
    // Auto-focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const openBookmarkModal = () => {
    fetchBookmarks("all");
    setBookmarkModal(true);
    setMenuOpen(false);
  };

  // const bookmarkMessage = async (message) => {
  //   if (!username || !sessionId) {
  //     showToast("User session is missing. Please log in again.", "error");
  //     return;
  //   }

  //   const toastId = showToast("Bookmarking...", "loading");

  //   try {
  //     await axios.post("/api/bookmarks", {
  //       username,
  //       session_id: sessionId,
  //       message,
  //       collection_name: collectionName,
  //     });

  //     updateToast(toastId, "Message bookmarked successfully!", "success");
  //     // fetchBookmarks(); // Refresh bookmarks
  //   } catch (error) {
  //     //console.error("Bookmarking failed:", error);
  //     updateToast(
  //       toastId,
  //       "Failed to bookmark message. Try again later.",
  //       "error"
  //     );
  //   }
  // };

  const [bookmarkedMessages, setBookmarkedMessages] = useState(new Set());

  const bookmarkMessage = async (message) => {
    if (!username || !sessionId) {
      showToast("User session is missing. Please log in again.", "error");
      return;
    }

    const toastId = showToast("Bookmarking...", "loading");

    try {
      await axios.post("/api/bookmarks", {
        username,
        session_id: sessionId,
        message,
        collection_name: collectionName,
      });

      updateToast(toastId, "Message bookmarked successfully!", "success");

      setBookmarkedMessages((prev) => new Set(prev).add(message)); // Add to state
    } catch (error) {
      updateToast(toastId, "Failed to bookmark message. Try again later.", "error");
    }
  };

  const deleteBookmark = async (bookmarkId) => {
    if (!bookmarkId) {
      showToast("Bookmark ID is missing!", "error");
      return;
    }

    try {
      await axios.delete("/api/bookmarks", { data: { bookmarkId } });
      fetchBookmarks(filter);
      showToast("Bookmark deleted successfully!", "success");
    } catch (error) {
      //console.error("Failed to delete bookmark:", error);
      showToast("Error deleting bookmark. Try again later.", "error");
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
      const icon =
        type === "success"
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

  const handleNewChat = () => {
    setMessages([]); // Clears messages
    const newSession = Date.now().toString();
    setSessionId(newSession);
    // console.log(localStorage);

    // localStorage.setItem("sessionId", newSession);
    localStorage.removeItem(`chat_${sessionId}`);
    localStorage.removeItem(`conversations`);
    // localStorage.clear();
    // console.log(localStorage);
  };

  useEffect(() => {
    const clearLocalStorage = () => {
      const hours = 36;
      const now = new Date().getTime();
      const setUpTime = localStorage.getItem("setupTime");

      if (!setUpTime || now - Number(setUpTime) > hours * 60 * 60 * 1000) {
        localStorage.clear();
        localStorage.setItem("setupTime", now);
      }
    };
    clearLocalStorage();
  }, []);

  const handleLogout = () => {
    localStorage.setItem("sessionId", "loggedOut");
    localStorage.removeItem(`chat_${sessionId}`);
    localStorage.removeItem("token");
    // localStorage.clear();

    setMenuOpen(false);
    showToast("Logging out...");
    setTimeout(() => {
      router.push("/auth/login");
    }, 1500);
    // console.log(localStorage);
  };

  const toggleExpand = (id) => {
    setExpandedBookmarks((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the expansion state for each message
    }));
  };

  const updateToast = (toastId, message, type = "success") => {
    const isDarkMode = document.body.classList.contains("dark");
    const toast = document.querySelector(`[data-toast-id="${toastId}"]`);

    if (toast) {
      const bgColor =
        type === "success"
          ? isDarkMode
            ? "bg-blue-600/90"
            : "bg-blue-500/90"
          : type === "error"
            ? isDarkMode
              ? "bg-red-600/90"
              : "bg-red-500/90"
            : isDarkMode
              ? "bg-indigo-600/90"
              : "bg-indigo-500/90";

      toast.className = `fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-3 rounded-lg backdrop-blur-sm shadow-lg z-50 animate-fade-in-up ${bgColor} text-white border border-white/10`;

      // Add appropriate icon based on toast type
      const icon =
        type === "success"
          ? '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
          : type === "error"
            ? '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
            : '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

      toast.innerHTML = `${icon} <span>${message}</span>`;

      setTimeout(() => removeToast(toastId), 2500);
    }
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

  const sendMessage = async () => {
    if (!input.trim()) {
      showToast("Message cannot be empty!", "error");
      return;
    }

    if (loading) return; // Prevent duplicate requests

    setLoading(true);

    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    // Update messages immediately for better user experience
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    localStorage.setItem(
      `chat_${sessionId}`,
      JSON.stringify([...messages, userMessage])
    );

    setInput(""); // Clear input field after sending

    // try {
    //   // Call API to send user message and get bot response
    //   const response = await axios.post("/api/chat", {
    //     message: input,
    //     session_id: sessionId,
    //     collection_name: collectionName,
    //     language,
    //   });

    //   // Extract AI response (or set a fallback message)
    //   const botResponseText =
    //     response.data.content || "Sorry, I couldn't understand that.";

    //   const botMessage = {
    //     text: "",
    //     sender: "bot",
    //     timestamp: new Date().toLocaleTimeString(),
    //   };

    //   setMessages((prevMessages) => [...prevMessages, botMessage]);

    //   // Typewriter Effect: Simulating AI response typing
    //   const words = botResponseText.split(" ");
    //   let currentText = "";

    //   words.forEach((word, index) => {
    //     setTimeout(() => {
    //       currentText += word + " ";
    //       setMessages((prevMessages) => {
    //         const updatedMessages = [...prevMessages];
    //         updatedMessages[updatedMessages.length - 1].text = currentText;
    //         return updatedMessages;
    //       });

    //       // Save conversation to local storage dynamically
    //       localStorage.setItem(
    //         `chat_${sessionId}`,
    //         JSON.stringify([
    //           ...messages,
    //           userMessage,
    //           { ...botMessage, text: currentText },
    //         ])
    //       );

    //       // Re-enable send button once AI finishes response
    //       if (index === words.length - 1) {
    //         setLoading(false);
    //       }
    //     }, index * 40); // Speed of "typing"
    //   });
    // } 
    try {
      const response = await axios.post("/api/chat", {
        message: input,
        session_id: sessionId,
        collection_name: collectionName,
        language,
      });
    
      const botResponseText =
        response.data.content || "Sorry, I couldn't understand that.";
      const references = response.data.references || [];
    
      // Format references into a string if available
      const referencesText =
        references.length > 0
        ? `\n\n📚 *References:*\n${references.map((ref) => `• ${ref.slice(0, 25)}${ref.length > 25 ? '…' : ''}`).join("\n")}`

          : "";
    
      const fullResponse = botResponseText + referencesText;
    
      const botMessage = {
        text: "",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
    
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    
      const words = fullResponse.split(" ");
      let currentText = "";
    
      words.forEach((word, index) => {
        setTimeout(() => {
          currentText += word + " ";
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1].text = currentText;
            return updatedMessages;
          });
    
          localStorage.setItem(
            `chat_${sessionId}`,
            JSON.stringify([
              ...messages,
              userMessage,
              { ...botMessage, text: currentText },
            ])
          );
    
          if (index === words.length - 1) {
            setLoading(false);
          }
        }, index * 40);
      });
    }
    
    catch (error) {
      showToast("Chat message failed:", error);

      // Set an error response from the bot
      const errorMessage = {
        text: "⚠️ AI is currently unavailable. Please try again later.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      showToast("Failed to send message. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode);
      document.body.classList.toggle("dark", newMode);
      return newMode;
    });
  };

  // Ensure dark mode applies on page load
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    document.body.classList.toggle("dark", savedMode);
  }, []);

  // New method to export chat as text file
  const exportChat = () => {
    const chatText = messages
      .map(
        (msg) =>
          `[${msg.timestamp}] ${msg.sender === "user" ? "You" : "AI"}: ${msg.text}`
      )
      .join("\n\n");
  
    const doc = new jsPDF();
  
    // Split the text into lines that fit the page width
    const lines = doc.splitTextToSize(chatText, 180); // 180 is width in mm
  
    doc.text(lines, 10, 10); // X:10, Y:10
  
    const filename = `chat_export_${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}.pdf`;
  
    doc.save(filename);
  
    showToast("Chat exported as PDF successfully");
  };


  const saveConvo = async (username, sessionId, messages, collectionName) => {
    // if (!username || !sessionId || messages.length === 0) {
    //     console.error("Missing required data to save conversation.");
    //     return;
    // }

    try {
      // Ensure you have the username from state or props
      //console.log(username);

      if (!username) {
        showToast("Username is missing!");
        return;
      }

      const response = await axios.post("/api/conversations", {
        username, // ✅ Send username in the request body
        sessionId,
        messages,
        collectionName,
      });

      if (response.status === 200) {
        showToast(`Conversation saved for ${username}`);
        // router.push(`/conversations?username=${username}`); // ✅ Redirect with username
      } else {
        showToast("Failed to save conversation:");
      }
    } catch (error) {
      showToast("No conversation to save");
    }
  };
  const fetchConvo = async (username, router) => {
    if (!username) {
      showToast("Username is required to fetch conversations.");
      return;
    }

    try {
      const response = await axios.get(
        `/api/conversations?username=${username}`
      );

      if (response.status === 200) {
        const conversations = response.data;
        // console.log("Fetched conversations:", conversations);

        // Store conversations in localStorage
        // localStorage.setItem("conversations", JSON.stringify(conversations));

        // Redirect to conversations page with username in query params
        router.push(`/conversations?username=${username}`);
      } else {
        showToast("No conversations found.");
      }
    } catch (error) {
      showToast("Error fetching conversations:", error);
    }
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
  };

  return (
    <div
      className={`flex flex-col h-dvh ${baseTheme.background} ${baseTheme.text} ${baseTheme.transition} font-plus-jakarta`}
    >
      {/* Modern Glassmorphism Header */}
      <header
        className={`backdrop-blur-md bg-opacity-95 ${baseTheme.primary} text-white py-4 px-5 sticky top-0 z-20 ${baseTheme.shadow} ${baseTheme.transition}`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex bg-white bg-opacity-20 p-2.5 rounded-full">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <h1 className="font-outfit font-bold text-xl">Welcome</h1>
                <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
                  {username}
                </span>
              </div>
              <div className="flex items-center text-xs text-blue-100 opacity-80 mt-0.5 font-dm-sans">
                <Book size={12} className="mr-1" />
                <span>{collectionName}</span>
                {/* change to housing */}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-3">
            <Button
              onClick={handleNewChat}
              className={`p-2 hover:bg-[#365899] rounded-full ${baseTheme.transition} ${baseTheme.buttonActive} text-xs md:text-sm flex items-center font-medium`}
              aria-label="New chat"
            >
              <MessageCirclePlus size={18} className="md:mr-1" />
              <span className="hidden md:inline font-poppins">New</span>
            </Button>

            <Button
              onClick={toggleDarkMode}
              className={`p-2 hover:bg-[#365899] rounded-full ${baseTheme.transition} ${baseTheme.buttonActive}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 hover:bg-[#365899] rounded-full ${baseTheme.transition} ${baseTheme.buttonActive}`}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </Button>
          </div>
        </div>

        {/* Dropdown Menu with improved positioning and animation */}
        {menuOpen && (
          <div
            className={`absolute top-16 right-4 ${baseTheme.card} ${baseTheme.shadow} rounded-xl py-2 w-56 ${baseTheme.text} z-50 transform ${baseTheme.transition} ease-out border ${baseTheme.border} animate-fade-in-up overflow-hidden font-dm-sans`}
          >
            <div className="px-4 py-2 border-b border-opacity-20 border-gray-400 mb-1">
              <p className="font-poppins font-medium">{username}</p>
              <p className="text-xs opacity-70">Logged in</p>
            </div>

            <button
              onClick={openBookmarkModal}
              className={`flex items-center w-full px-4 py-3 hover:bg-opacity-10 hover:bg-indigo-100 ${baseTheme.transition}`}
            >
              <BookMarked className="mr-3" size={16} />
              <span>View Bookmarks</span>
            </button>

            <button
              onClick={() => fetchConvo(username, router)}
              className={`flex items-center w-full px-4 py-3 hover:bg-opacity-10 hover:bg-indigo-100 ${baseTheme.transition}`}
            >
              <Archive className="mr-3" size={16} />
              <span>Saved Chats</span>
            </button>

            <button
              onClick={exportChat}
              className={`flex items-center w-full px-4 py-3 hover:bg-opacity-10 hover:bg-indigo-100 ${baseTheme.transition}`}
            >
              <HardDriveDownload className="mr-3" size={16} />
              <span>Export Chat</span>
            </button>

            <div
              className={`border-t ${baseTheme.border} border-opacity-20 my-1`}
            ></div>

            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 hover:bg-opacity-10 ${baseTheme.transition}`}
            >
              <LogOut className="mr-3" size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Collection Selection - Simplified with better visuals */}

      <div
        className={`px-4 py-3 ${baseTheme.card} border-b ${baseTheme.border} ${baseTheme.transition} relative z-10`}
        style={{ isolation: "isolate" }} // Add CSS isolation
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-64">
          </div>

          {/* Language Toggle and Save Button */}
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3">
            <div className="flex items-center">
              <Languages size={16} className={`mr-2 ${baseTheme.accent}`} />
              <div
                className={`relative inline-flex rounded-full p-1 ${darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
              >
                <button
                  onClick={() => setLanguage("English")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${baseTheme.transition
                    } ${language === "English"
                      ? `bg-[#4267B2] text-white shadow-sm`
                      : `${darkMode ? "text-gray-300" : "text-gray-700"}`
                    } font-poppins`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("Hindi")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${baseTheme.transition
                    } ${language === "Hindi"
                      ? `bg-[#4267B2] text-white shadow-sm`
                      : `${darkMode ? "text-gray-300" : "text-gray-700"}`
                    } font-poppins`}
                >
                  हि
                </button>
              </div>
            </div>

            <Button
              icon={<Save size={16} className="mr-2" />}
              // label="Save"
              onClick={() =>
                saveConvo(username, sessionId, messages, collectionName)
              }
              className={`px-5 py-2 rounded-full text-white text-sm
                flex items-center justify-center ${baseTheme.transition}
                ${baseTheme.buttonActive}
                bg-[#4267B2] hover:bg-[#365899] font-outfit font-medium`}
            />
          </div>
        </div>
      </div>

      <Dialog
        visible={bookmarkModal}
        onHide={() => setBookmarkModal(false)}
        modal
        closable={false}
        className={`w-full max-w-3xl sm:max-w-4xl h-full`}
        contentClassName={`relative ${darkMode ? "bg-gray-900 text-white" : "bg-white"
          } rounded-mg shadow-xl border ${baseTheme.border} font-plus-jakarta`}
        style={{
          height: "90vh",
          maxHeight: "90vh",
          width: "100%",
          maxWidth: "600px",
          backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          position: "fixed",
          top: "5vh",
        }}
        blockScroll={true}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 backdrop-blur-md bg-opacity-95 bg-[#4267B2] text-white py-4 px-6 shadow-md flex items-center justify-between rounded-t-xl`}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Bookmark size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg font-outfit">
              Saved Bookmarks
            </span>
          </div>
          <button
            onClick={() => setBookmarkModal(false)}
            className="p-2 rounded-full hover:bg-[#365899] transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Filters Section */}
        <div className={`p-4 border-b ${baseTheme.border}`}>
          <p
            className={`text-sm font-semibold ${baseTheme.accent} mb-2 flex items-center font-montserrat`}
          >
            <Filter size={14} className="mr-2" /> Filter by Time:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {["hour", "day", "week", "all"].map((time) => (
              <Button
                key={time}
                label={`Last ${time.charAt(0).toUpperCase() + time.slice(1)}`}
                icon={<Clock size={14} />}
                className={`p-2 text-xs ${darkMode
                    ? filter === time
                      ? "bg-[#4267B2] text-white"
                      : "bg-gray-700"
                    : filter === time
                      ? "bg-[#4267B2] text-white"
                      : "bg-gray-100"
                  } rounded-md ${baseTheme.transition} ${baseTheme.buttonActive
                  } font-dm-sans`}
                onClick={() => fetchBookmarks(time)}
                disabled={bookmarksLoading}
              />
            ))}
          </div>
        </div>

        {/* Bookmarks List (Scrollable) */}
        <div
          className="overflow-y-auto px-4 py-3"
          style={{ height: "calc(90vh - 180px)" }}
        >
          {bookmarksLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="loader-lg"></div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-600"
                } font-plus-jakarta`}
            >
              <Bookmark size={48} className="mb-3 opacity-30" />
              <p className="font-medium">No bookmarks found</p>
              <p className="text-sm mt-1 opacity-75">
                Bookmarked messages will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((b) => (
                <div
                  key={b._id}
                  className={`flex flex-col p-3 ${darkMode
                      ? "bg-gray-700 hover:bg-gray-650"
                      : "bg-gray-50 hover:bg-gray-100"
                    } rounded-lg shadow-sm border ${baseTheme.border} ${baseTheme.transition
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className={`text-xs font-medium ${baseTheme.accent} flex items-center font-montserrat`}
                    >
                      <Bookmark size={12} className="mr-1" />
                      {new Date(b.createdAt).toLocaleString()}
                    </div>
                    <Button
                      icon={<Trash2 size={14} />}
                      className={`w-8 h-8 p-0 rounded-full ${darkMode
                          ? "bg-gray-600 hover:bg-red-800"
                          : "bg-gray-200 hover:bg-red-100"
                        } text-red-500 ${baseTheme.transition} ${baseTheme.buttonActive
                        }`}
                      onClick={() => deleteBookmark(b._id)}
                    />
                  </div>

                  {/* Read More / Read Less Toggle */}
                  <p
                    className={`text-sm whitespace-pre-wrap leading-relaxed ${darkMode ? "text-gray-200" : "text-gray-700"
                      } font-dm-sans`}
                  >
                    {expandedBookmarks[b._id] ? (
                      <>
                        {b.message}
                        <button
                          className={`text-[#4267B2] ml-2 text-xs font-medium font-poppins`}
                          onClick={() => toggleExpand(b._id)}
                        >
                          Read Less
                        </button>
                      </>
                    ) : (
                      <>
                        {b.message.length > 200 ? (
                          <>
                            {b.message.slice(0, 200)}...
                            <button
                              className={`text-[#4267B2] ml-2 text-xs font-medium font-poppins`}
                              onClick={() => toggleExpand(b._id)}
                            >
                              Read More
                            </button>
                          </>
                        ) : (
                          b.message
                        )}
                      </>
                    )}
                  </p>

                  <div className="text-xs mt-2 opacity-75 flex items-center font-montserrat">
                    <Book size={12} className="mr-1" />
                    Collection: {b.collection_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>

      {/* Messages Area with better spacing and animations */}
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${baseTheme.background} ${baseTheme.transition}`}
        style={{ maxHeight: 'calc(100dvh - 250px)' }} // Adjusted for dvh
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div
              className={`p-6 rounded-full ${darkMode ? "bg-gray-800" : "bg-indigo-100"
                } mb-6 ${baseTheme.shadow}`}
            >
              <MessageCircle
                size={32}
                className={darkMode ? "text-[#4267B2]" : "text-[#4267B2]"}
              />
            </div>
            <h3 className="text-xl font-medium mb-3 font-outfit">
              Start a new conversation
            </h3>
            <p
              className={`max-w-md ${darkMode ? "text-gray-400" : "text-gray-600"
                } font-plus-jakarta mb-6`}
            >
              Ask questions, get information.
              Bookmark and Save response.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {startingQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleStartingQuestion(question)}
                  className={`text-left p-4 rounded-lg border ${baseTheme.border
                    } ${baseTheme.card
                    } hover:shadow-md transition flex items-start ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                    }`}
                >
                  <span className="mr-3 mt-1 flex-shrink-0">
                    <MessageCircle
                      size={18}
                      className={darkMode ? "text-blue-400" : "text-blue-500"}
                    />
                  </span>
                  <span className="text-sm">{question}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                } animate-fade-in ${baseTheme.transition}`}
            >
              <div className="flex items-start max-w-[90%] md:max-w-[80%]">
                {message.sender === "bot" && (
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full bg-[#4267B2] flex items-center justify-center mr-2 mt-1`}
                  >
                    <Bot size={16} className="text-white" />
                  </div>
                )}

                <div
                  className={`rounded-lg px-4 py-3 ${message.sender === "user"
                      ? "bg-[#4267B2] text-white"
                      : `${baseTheme.botMessage} border ${baseTheme.border}`
                    } ${baseTheme.shadow}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold ${message.sender === "user"
                          ? "text-blue-200"
                          : baseTheme.accent
                        } font-poppins`}
                    >
                      {message.sender === "user" ? (
                        <User size={12} className="inline mr-1" />
                      ) : (
                        <Bot size={12} className="inline mr-1" />
                      )}
                      {message.sender === "user" ? "You" : "AI"}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs opacity-70 font-montserrat">
                        {message.timestamp}
                      </span>
                      {message.sender === "bot" && (
                        <Button
                        icon={bookmarkedMessages.has(message.text) ? <IoMdBookmark size={14} /> : <Bookmark size={14} />}
                        className={`w-6 h-6 p-0 rounded-full ${
                          darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-200"
                        } ${baseTheme.transition} ${baseTheme.buttonActive}`}
                        onClick={() => bookmarkMessage(message.text)}
                      />
                      )}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm  font-dm-sans">
                    {message.text}
                  </p>
                </div>

                {message.sender === "user" && (
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1`}
                  >
                    <User size={16} className="text-gray-700" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className={`flex items-start`}>
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-full bg-[#4267B2] flex items-center justify-center mr-2 mt-1`}
              >
                <Bot size={16} className="text-white" />
              </div>

              <div
                className={`${baseTheme.botMessage} rounded-lg p-4 shadow-md space-y-2 min-w-[160px]`}
              >
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-[#4267B2] rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-[#4267B2] rounded-full animate-bounce delay-100"></div>
                  <div className="h-2 w-2 bg-[#4267B2] rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area with improved interactivity */}
      <div
        className={`p-4 border-t ${baseTheme.border} ${baseTheme.card} ${baseTheme.shadow} ${baseTheme.transition}`}
      >
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <div className="relative flex-1">
            <InputText
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Type a message in ${language}...`}
              className={`w-full py-3 px-4 rounded-full ${baseTheme.input} ${baseTheme.border} focus:ring-2 focus:ring-[#4267B2] pr-12 ${baseTheme.transition}`}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            {loading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="loader"></div>
              </div>
            )}
          </div>
          <Button
            icon={<Send size={18} />}
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`p-3 rounded-full bg-[#4267B2] hover:bg-[#365899] text-white ${baseTheme.transition
              } ${baseTheme.buttonActive} ${!input.trim() || loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          />
        </div>
        <div
          className={`text-xs text-center mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"
            }`}
        >
          Bot can make mistake. Check important info.
        </div>
      </div>

      {/* Global CSS for animations and loaders */}
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
        .bg-gray-650 {
          background-color: #2d3748;
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
      `}</style>
    </div>
  );
}
