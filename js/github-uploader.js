import { getStoredToken } from './auth.js';
import { validateFile } from './utils.js';

export function initializeGitHubUploader() {
    const uploadButton = document.getElementById('uploadButton');
    const uploadList = document.getElementById('uploadList');
    const repoOwnerInput = document.getElementById('repoOwner');
    const repoNameInput = document.getElementById('repoName');

    uploadButton.addEventListener('click', handleUpload);
    repoOwnerInput.addEventListener('blur', validateRepository);
    repoNameInput.addEventListener('blur', validateRepository);
}

async function validateRepository() {
    const token = getStoredToken();
    const owner = document.getElementById('repoOwner').value;
    const repo = document.getElementById('repoName').value;

    if (!owner || !repo) return;

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Repository not found');
        }

        showSuccess('Repository validated successfully');
    } catch (error) {
        showError(`Repository validation failed: ${error.message}`);
    }
}

async function handleUpload() {
    const token = getStoredToken();
    if (!token) {
        showError('Please enter a GitHub token first');
        return;
    }

    const files = Array.from(document.querySelectorAll('.file-item'))
        .map(item => item.file)
        .filter(file => file);

    if (files.length === 0) {
        showError('Please select at least one file');
        return;
    }

    const repoOwner = document.getElementById('repoOwner').value;
    const repoName = document.getElementById('repoName').value;
    const branch = document.getElementById('repoBranch').value || 'main';

    if (!repoOwner || !repoName) {
        showError('Please enter repository details');
        return;
    }

    // Validate repository before upload
    try {
        const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!repoResponse.ok) {
            throw new Error('Repository not found or access denied');
        }

        // Check if user has write access
        const permissionsResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${repoOwner}/permission`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!permissionsResponse.ok) {
            throw new Error('Unable to verify repository permissions');
        }

        const permissions = await permissionsResponse.json();
        if (!['admin', 'write'].includes(permissions.permission)) {
            throw new Error('You don\'t have write access to this repository');
        }

        // Proceed with upload if all checks pass
        for (const file of files) {
            try {
                await uploadFileToGitHub(file, token, repoOwner, repoName, branch);
                showSuccess(`Successfully uploaded ${file.name}`);
            } catch (error) {
                showError(`Failed to upload ${file.name}: ${error.message}`);
            }
        }
    } catch (error) {
        showError(`Repository error: ${error.message}`);
        return;
    }
}

async function uploadFileToGitHub(file, token, owner, repo, branch) {
    const content = await readFileAsBase64(file);
    const path = file.name;

    try {
        // Check if file already exists
        const checkResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha;
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            sha = existingFile.sha;
        }

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Upload ${file.name}`,
                content: content,
                branch: branch,
                ...(sha && { sha }) // Include sha if file exists
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        return response.json();
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64Content = reader.result.split(',')[1];
            resolve(base64Content);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.upload-section').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.upload-section').appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}