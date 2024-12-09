import { initializeGitHubUploader } from './github-uploader.js';
import { setupDropzone } from './dropzone.js';
import { setupAuthToken } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    setupAuthToken();
    setupDropzone();
    initializeGitHubUploader();
});