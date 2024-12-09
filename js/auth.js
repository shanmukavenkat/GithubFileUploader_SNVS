export function setupAuthToken() {
    const tokenInput = document.getElementById('tokenInput');
    const saveTokenButton = document.getElementById('saveToken');

    const storedToken = localStorage.getItem('githubToken');
    if (storedToken) {
        tokenInput.value = storedToken;
    }

    saveTokenButton.addEventListener('click', () => {
        const token = tokenInput.value.trim();
        if (token) {
            localStorage.setItem('githubToken', token);
            showSuccess('Token saved successfully');
        } else {
            showError('Please enter a valid token');
        }
    });
}

export function getStoredToken() {
    return localStorage.getItem('githubToken');
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.auth-section').appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.auth-section').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}