// Get users from localStorage
function getUsers() {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : {};
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Handle signup form submission
function handleSignup(username, email, password) {
    const users = getUsers();

    // Check if username already exists
    if (users[username]) {
        return { success: false, message: 'Username already exists. Please choose another.' };
    }

    // Validate inputs
    if (!username || !email || !password) {
        return { success: false, message: 'All fields are required.' };
    }

    if (username.trim() === '' || password.trim() === '') {
        return { success: false, message: 'Username and password cannot be empty.' };
    }

    // Add new user to localStorage
    users[username] = password;
    saveUsers(users);

    // Store logged-in user in sessionStorage
    sessionStorage.setItem('currentUser', username);

    return { success: true, message: 'Account created successfully!' };
}

// Display message to user
function showMessage(text, isSuccess) {
    if (isSuccess) {
        alert(text);
        // Redirect to landing page on successful signup
        window.location.href = 'landing_page.html';
    } else {
        alert(text);
    }
}

// Wait for the DOM to fully load before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get the form element
    const signupForm = document.querySelector('form');

    // Handle form submission
    signupForm.addEventListener('submit', function(e) {
        // Prevent the default form submission behavior
        e.preventDefault();

        // Get the entered username, email, and password
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Attempt signup
        const result = handleSignup(username, email, password);
        showMessage(result.message, result.success);

        // Clear form fields if signup failed
        if (!result.success) {
            document.getElementById('password').value = '';
        }
    });
});
