// IMPORTANT: Update this URL to your deployed app's edge function URL
const API_URL = 'https://dcmpuhlqeuowjizkemel.supabase.co/functions/v1/submit-feedback';

const feedbackInput = document.getElementById('feedback');
const submitButton = document.getElementById('submit');
const statusDiv = document.getElementById('status');

function showStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + (isError ? 'error' : 'success');
  statusDiv.style.display = 'block';
}

async function submitFeedback() {
  const content = feedbackInput.value.trim();
  
  if (!content) {
    showStatus('Please enter some feedback', true);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Saving...';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        source: 'Browser Extension'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showStatus('✓ Feedback saved!');
      feedbackInput.value = '';
      
      // Auto-close after success
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

submitButton.addEventListener('click', submitFeedback);

// Submit on Ctrl+Enter
feedbackInput.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    submitFeedback();
  }
});

// Focus the textarea on popup open
feedbackInput.focus();
