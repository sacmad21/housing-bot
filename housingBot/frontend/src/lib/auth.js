export const isLoggedIn = () => {
    // Check if token exists in localStorage
    return typeof window !== "undefined" && localStorage.getItem("token");
};

export const login = (token) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
    }
};

export const logout = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/auth/login"; // Redirect to login page
    }
};
