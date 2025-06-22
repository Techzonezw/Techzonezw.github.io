import config from './config.js';

// GitHub repository details
const GITHUB_REPO = config.GITHUB_REPO;
const GITHUB_CLIENT_ID = config.GITHUB_CLIENT_ID;

// Check for GitHub authentication code
window.addEventListener('load', function() {
    const code = sessionStorage.getItem('github_code');
    if (code) {
        // Clear the code from session storage
        sessionStorage.removeItem('github_code');
        // Show the comment form and hide login button
        document.getElementById('comment-form').style.display = 'block';
        document.getElementById('github-login').style.display = 'none';
        console.log('Authenticated with GitHub');
    }
});

// Function to handle GitHub login
function handleGitHubLogin() {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(config.REDIRECT_URI)}&scope=public_repo`;
    window.location.href = authUrl;
}

// Add login button event listener
const githubLoginBtn = document.getElementById('github-login');
if (githubLoginBtn) {
    githubLoginBtn.addEventListener('click', handleGitHubLogin);
}

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to load comments
async function loadComments() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues?labels=comment`);
        const issues = await response.json();
        
        const commentsContainer = document.getElementById('comments-list');
        commentsContainer.innerHTML = '';

        issues.forEach(issue => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${issue.user.login}</span>
                    <span class="comment-date">${formatDate(issue.created_at)}</span>
                </div>
                <div class="comment-content">
                    ${issue.body}
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Function to post a new comment
async function postComment(comment) {
    try {
        const token = sessionStorage.getItem('github_token');
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'New Comment',
                body: comment,
                labels: ['comment']
            })
        });

        if (response.ok) {
            loadComments();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error posting comment:', error);
        return false;
    }
}

// Handle comment form submission
const commentForm = document.getElementById('comment-form');
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentInput = document.getElementById('comment-text');
        const success = await postComment(commentInput.value);
        if (success) {
            commentInput.value = '';
            alert('Comment posted successfully!');
        } else {
            alert('Error posting comment. Please try again.');
        }
    });
}

// Load comments when the page loads
loadComments();

// Form submission handling for contact form
const form = document.getElementById('contact-form');
const successMessage = document.getElementById('success-message');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                form.reset();
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
} 
document.getElementById('close-btn').addEventListener('click', function() {
  document.getElementById('ai-box').style.display = 'none';
});

document.getElementById('submit-btn').addEventListener('click', function() {
  // Handle submit button click event
  var input = document.getElementById('ai-input').value;
  // Process the input
})
  