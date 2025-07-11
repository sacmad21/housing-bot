const showToast = (message, type = "success") => {
    const isDarkMode = document.body.classList.contains("dark");
    const toast = document.createElement("div");
    const toastId = `toast-${Date.now()}`;
    toast.dataset.toastId = toastId;
    
    // Modern, softer color palette that matches the Facebook-like blue theme
    const bgColor =
      type === "success"
        ? isDarkMode
          ? "bg-blue-600/90" 
          : "bg-blue-500/90"
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

