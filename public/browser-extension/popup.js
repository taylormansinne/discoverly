const API_URL = 'https://dcmpuhlqeuowjizkemel.supabase.co/functions/v1/submit-feedback';
const TOKEN_KEY = 'extensionToken';

const setupView = document.getElementById('setup-view');
const captureView = document.getElementById('capture-view');
const tokenInput = document.getElementById('token');
const saveTokenBtn = document.getElementById('save-token');
const resetTokenBtn = document.getElementById('reset-token');
const feedbackInput = document.getElementById('feedback');
const submitButton = document.getElementById('submit');
const statusDiv = document.getElementById('status');

function showStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + (isError ? 'error' : 'success');
  statusDiv.style.display = 'block';
}

function showSetup() {
  setupView.classList.remove('hidden');
  captureView.classList.add('hidden');
  setTimeout(() => tokenInput.focus(), 0);
}

function showCapture() {
  setupView.classList.add('hidden');
  captureView.classList.remove('hidden');
  setTimeout(() => feedbackInput.focus(), 0);
}

function getStoredToken() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([TOKEN_KEY], (result) => resolve(result[TOKEN_KEY] || ''));
    } else {
      resolve(localStorage.getItem(TOKEN_KEY) || '');
    }
  });
}

function setStoredToken(token) {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [TOKEN_KEY]: token }, () => resolve());
    } else {
      localStorage.setItem(TOKEN_KEY, token);
      resolve();
    }
  });
}

async function submitFeedback() {
  const content = feedbackInput.value.trim();
  if (!content) {
    showStatus('Please enter some feedback', true);
    return;
  }
  if (content.length > 5000) {
    showStatus('Feedback must be 5000 characters or fewer', true);
    return;
  }

  const token = await getStoredToken();
  if (!token) {
    showSetup();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Saving...';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-extension-token': token,
      },
      body: JSON.stringify({ content, source: 'Browser Extension' })
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      showStatus('Invalid token. Please update it.', true);
      showSetup();
      return;
    }

    if (response.ok && data.success) {
      showStatus('✓ Feedback saved!');
      feedbackInput.value = '';
      setTimeout(() => window.close(), 1500);
    } else {
      showStatus(data.error || 'Failed to save feedback', true);
    }
  } catch (error) {
    console.error('Error:', error);
    showStatus('Network error. Please try again.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Save Feedback';
  }
}

saveTokenBtn.addEventListener('click', async () => {
  const value = tokenInput.value.trim();
  if (!value) return;
  await setStoredToken(value);
  tokenInput.value = '';
  showCapture();
});

resetTokenBtn.addEventListener('click', async () => {
  await setStoredToken('');
  showSetup();
});

submitButton.addEventListener('click', submitFeedback);

feedbackInput.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') submitFeedback();
});

(async () => {
  const token = await getStoredToken();
  if (token) showCapture(); else showSetup();
})();
