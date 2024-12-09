export function validateFile(file) {
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    
    if (file.size > maxSize) {
        showError(`File ${file.name} is too large. Maximum size is 20MB`);
        return false;
    }
    
    return true;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.upload-section').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}