// Initialize localStorage with default user if no users exist
function initializeUsers() {
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
        // Create default admin account
        const defaultUsers = {
            admin: "admin"
        };
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Get users from localStorage
function getUsers() {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : {};
}

// This function handles login attempts when the user submits the form
function handleLogin(user, password) {
    const users = getUsers();

    // Check if username exists in our users object
    if (users[user]) {
        // Check if password matches
        if (users[user] === password) {
            // Store logged-in user in sessionStorage for the current session
            sessionStorage.setItem('currentUser', user);
            return { success: true, message: 'Login successful! Welcome!' };
        } else {
            return { success: false, message: 'Incorrect password.' };
        }
    } else {
        return { success: false, message: 'Username not found.' };
    }
}

// Display message to user using alert (you can customize this later)
function showMessage(text, isSuccess) {
    if (isSuccess) {
        alert(text);
        // Redirect to landing page on successful login
        window.location.href = 'landing_page.html';
    } else {
        alert(text);
    }
}

// Wait for the DOM to fully load before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize users in localStorage
    initializeUsers();

    // Get the form element
    const loginForm = document.getElementById('loginForm');

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        // Prevent the default form submission behavior
        e.preventDefault();

        // Get the entered username and password
        const user = document.getElementById('user').value;
        const password = document.getElementById('password').value;

        // Attempt login
        const result = handleLogin(user, password);
        showMessage(result.message, result.success);

        // Clear password field for security if login failed
        if (!result.success) {
            document.getElementById('password').value = '';
        }
    });
});
