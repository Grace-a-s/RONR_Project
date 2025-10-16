// Using an object (JavaScript's dictionary) to store multiple users
// Key: email, Value: password
const users = {
    'user@example.com': 'password123',
    'admin@example.com': 'admin2024',
    'john.doe@example.com': 'securepwd',
    'test@example.com': 'test1234'
};

// This function handles login attempts when the user submits the form
function handleLogin(email, password) {
    // Check if email exists in our users object
    if (users[email]) {
        // Check if password matches
        if (users[email] === password) {
            return { success: true, message: 'Login successful! Welcome!' };
        } else {
            return { success: false, message: 'Incorrect password.' };
        }
    } else {
        return { success: false, message: 'Email not found.' };
    }
}

// Display message to user using alert (you can customize this later)
function showMessage(text, isSuccess) {
    if (isSuccess) {
        alert(text);
        // Redirect or perform other actions on successful login
        // window.location.href = 'dashboard.html';
    } else {
        alert(text);
    }
}

// Wait for the DOM to fully load before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get the form element
    const loginForm = document.getElementById('loginForm');
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        // Prevent the default form submission behavior
        e.preventDefault();
        
        // Get the entered email and password
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Attempt login
        const result = handleLogin(email, password);
        showMessage(result.message, result.success);
        
        // Clear password field for security if login failed
        if (!result.success) {
            document.getElementById('password').value = '';
        }
    });
});
