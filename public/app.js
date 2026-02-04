// Sagan Image Generator - Frontend App

const API_URL = window.location.origin;

// State
let state = {
  jobs: [],
  selectedJobs: [],
  templates: [],
  selectedTemplate: 'catalog-1',
  outputType: 'single', // 'single' or 'carousel'
  dotStyle: 'default',
  generatedImages: []
};

// DOM Elements
const elements = {
  jobsList: document.getElementById('jobsList'),
  templatesGrid: document.getElementById('templatesGrid'),
  generateBtn: document.getElementById('generateBtn'),
  dotStyleSelect: document.getElementById('dotStyle'),
  previewPanel: document.getElementById('previewPanel'),
  previewContent: document.getElementById('previewContent'),
  modal: document.getElementById('modal'),
  modalBody: document.getElementById('modalBody'),
  toastContainer: document.getElementById('toastContainer'),
  aiPrompt: document.getElementById('aiPrompt'),
  aiPreview: document.getElementById('aiPreview')
};

// Templates data (will be loaded from API)
const TEMPLATES = [
  { id: 'catalog-1', name: 'Catalog 1', description: 'Clean card layout' },
  { id: 'catalog-2', name: 'Catalog 2', description: 'Modern split design' },
  { id: 'catalog-3', name: 'Catalog 3', description: 'Bold gradient' },
  { id: 'modern-clean', name: 'Modern Clean', description: 'Minimal professional' },
  { id: 'diagonal', name: 'Diagonal', description: 'Dynamic angle design' },
  { id: 'waves', name: 'Waves', description: 'Flowing wave pattern' },
  { id: 'bold-gradient', name: 'Bold Gradient', description: 'Vibrant gradients' },
  { id: 'split-screen', name: 'Split Screen', description: 'Two-tone layout' },
  { id: 'magazine', name: 'Magazine', description: 'Editorial style' },
  { id: 'brutalist', name: 'Brutalist', description: 'Raw bold design' },
  { id: 'minimal-zen', name: 'Minimal Zen', description: 'Clean and calm' },
  { id: 'neon-card', name: 'Neon Card', description: 'Glowing effects' }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTypeToggle();
  initDotStyleSelector();
  initModalHandlers();
  loadTemplates();
  loadJobs();
});

// Navigation
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;

      // Update nav buttons
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update pages
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(`page-${page}`).classList.add('active');
    });
  });
}

// Output Type Toggle
function initTypeToggle() {
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.outputType = btn.dataset.type;
      updateGenerateButton();
    });
  });
}

// Dot Style Selector
function initDotStyleSelector() {
  elements.dotStyleSelect.addEventListener('change', (e) => {
    state.dotStyle = e.target.value;
  });
}

// Modal Handlers
function initModalHandlers() {
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalDownload').addEventListener('click', downloadAllImages);

  elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) closeModal();
  });

  document.getElementById('closePreview').addEventListener('click', () => {
    elements.previewPanel.classList.remove('open');
  });

  // Generate button
  elements.generateBtn.addEventListener('click', generateImages);

  // AI Generate button
  document.getElementById('generateAiBtn').addEventListener('click', generateAiTemplate);
}

// Load Jobs from Airtable (via API)
async function loadJobs() {
  elements.jobsList.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading jobs from Airtable...</p>
    </div>
  `;

  try {
    const response = await fetch(`${API_URL}/api/airtable/jobs`);

    if (!response.ok) {
      throw new Error('Failed to load jobs');
    }

    const data = await response.json();
    state.jobs = data.jobs || [];

    renderJobs();
  } catch (error) {
    console.error('Error loading jobs:', error);

    // Show demo data if Airtable is not configured
    state.jobs = [
      {
        id: 'demo-1',
        title: 'AR/AP Specialist',
        jobCode: 'HR37374',
        salary: '$1,300 - $1,600',
        location: '100% Remote',
        schedule: 'M-F, 9AM-6PM PST',
        responsibilities: ['Manage AR/AP processes', 'Handle invoicing and reconciliations'],
        qualifications: ['2+ years experience', 'Proficient with accounting tools']
      },
      {
        id: 'demo-2',
        title: 'Marketing Manager',
        jobCode: 'HR37375',
        salary: '$2,500 - $3,500',
        location: '100% Remote',
        schedule: 'M-F, 9AM-5PM EST',
        responsibilities: ['Lead marketing campaigns', 'Manage social media presence'],
        qualifications: ['5+ years experience', 'Strong analytical skills']
      },
      {
        id: 'demo-3',
        title: 'Video Editor',
        jobCode: 'HR37376',
        salary: '$1,200 - $1,800',
        location: '100% Remote',
        schedule: 'Flexible',
        responsibilities: ['Edit promotional videos', 'Create social media content'],
        qualifications: ['Proficient in Adobe Premiere', 'Portfolio required']
      },
      {
        id: 'demo-4',
        title: 'Senior Executive Assistant',
        jobCode: 'HR37377',
        salary: '$2,500 - $3,000',
        location: '100% Remote',
        schedule: 'M-F, 8AM-5PM PST',
        responsibilities: ['Calendar management', 'Travel arrangements'],
        qualifications: ['3+ years EA experience', 'Excellent communication']
      },
      {
        id: 'demo-5',
        title: 'Payroll Specialist',
        jobCode: 'HR37378',
        salary: '$1,500 - $2,000',
        location: '100% Remote',
        schedule: 'M-F, 9AM-6PM EST',
        responsibilities: ['Process payroll', 'Handle tax filings'],
        qualifications: ['2+ years payroll experience', 'Detail-oriented']
      }
    ];

    renderJobs();
    showToast('Using demo data. Connect Airtable for live jobs.', 'warning');
  }
}

// Render Jobs List
function renderJobs() {
  if (state.jobs.length === 0) {
    elements.jobsList.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="6" width="36" height="36" rx="4"/>
          <path d="M12 18h24M12 24h24M12 30h16"/>
        </svg>
        <p>No jobs found. Add jobs in Airtable.</p>
      </div>
    `;
    return;
  }

  elements.jobsList.innerHTML = state.jobs.map(job => `
    <div class="job-card" data-id="${job.id}" onclick="toggleJobSelection('${job.id}')">
      <div class="job-checkbox">
        <svg width="14" height="14" fill="none" stroke="white" stroke-width="3">
          <path d="M2 7l4 4 8-8"/>
        </svg>
      </div>
      <div class="job-info">
        <div class="job-title">${job.title}</div>
        <div class="job-meta">
          <span class="job-salary">${job.salary}</span>
          <span>${job.location}</span>
          <span>${job.schedule}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Toggle Job Selection
function toggleJobSelection(jobId) {
  const index = state.selectedJobs.indexOf(jobId);

  if (index === -1) {
    state.selectedJobs.push(jobId);
  } else {
    state.selectedJobs.splice(index, 1);
  }

  // Update UI
  document.querySelectorAll('.job-card').forEach(card => {
    if (state.selectedJobs.includes(card.dataset.id)) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  updateGenerateButton();
}

// Update Generate Button State
function updateGenerateButton() {
  const hasSelection = state.selectedJobs.length > 0;
  elements.generateBtn.disabled = !hasSelection;

  if (state.outputType === 'carousel' && state.selectedJobs.length < 2) {
    elements.generateBtn.textContent = 'Select 2+ jobs for carousel';
    elements.generateBtn.disabled = true;
  } else if (hasSelection) {
    const count = state.selectedJobs.length;
    const type = state.outputType === 'carousel' ? 'Carousel' : `${count} Image${count > 1 ? 's' : ''}`;
    elements.generateBtn.textContent = `Generate ${type}`;
    elements.generateBtn.disabled = false;
  } else {
    elements.generateBtn.textContent = 'Generate Images';
  }
}

// Load Templates
function loadTemplates() {
  elements.templatesGrid.innerHTML = TEMPLATES.map(template => `
    <div class="template-card ${template.id === state.selectedTemplate ? 'selected' : ''}"
         data-id="${template.id}"
         onclick="selectTemplate('${template.id}')">
      <div class="template-preview">
        <img src="${API_URL}/api/template-preview/${template.id}"
             alt="${template.name}"
             onerror="this.parentElement.innerHTML='<div style=\\'padding:40px;color:#999;\\'>Preview</div>'">
      </div>
      <div class="template-info">
        <div class="template-name">${template.name}</div>
      </div>
    </div>
  `).join('');
}

// Select Template
function selectTemplate(templateId) {
  state.selectedTemplate = templateId;

  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.id === templateId);
  });

  showToast(`Template "${templateId}" selected`);
}

// Generate Images
async function generateImages() {
  const selectedJobData = state.jobs.filter(job => state.selectedJobs.includes(job.id));

  if (selectedJobData.length === 0) {
    showToast('Please select at least one job', 'error');
    return;
  }

  elements.generateBtn.disabled = true;
  elements.generateBtn.textContent = 'Generating...';

  try {
    if (state.outputType === 'carousel') {
      // Generate carousel (cover + details)
      const response = await fetch(`${API_URL}/generate-carousel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobs: selectedJobData,
          dotStyle: state.dotStyle
        })
      });

      if (!response.ok) throw new Error('Failed to generate carousel');

      const data = await response.json();
      state.generatedImages = [data.images.cover, ...data.images.details];

      showImagesModal();
      showToast(`Generated ${state.generatedImages.length} images!`, 'success');

    } else {
      // Generate single images
      state.generatedImages = [];

      for (const job of selectedJobData) {
        const response = await fetch(`${API_URL}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobTitle: job.title,
            salary: job.salary,
            location: job.location,
            schedule: job.schedule,
            responsibilities: job.responsibilities || [],
            qualifications: job.qualifications || [],
            jobCode: job.jobCode || '',
            template: state.selectedTemplate,
            dotStyle: state.dotStyle
          })
        });

        if (!response.ok) throw new Error('Failed to generate image');

        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        state.generatedImages.push(base64);
      }

      showImagesModal();
      showToast(`Generated ${state.generatedImages.length} image(s)!`, 'success');
    }

  } catch (error) {
    console.error('Error generating images:', error);
    showToast('Failed to generate images. Please try again.', 'error');
  } finally {
    updateGenerateButton();
  }
}

// Show Images Modal
function showImagesModal() {
  elements.modalBody.innerHTML = state.generatedImages.map((img, index) => `
    <div class="image-item">
      <img src="${img.startsWith('data:') ? img : 'data:image/png;base64,' + img}"
           alt="Generated image ${index + 1}">
      <button class="btn btn-secondary btn-small" onclick="downloadImage(${index})">
        Download
      </button>
    </div>
  `).join('');

  elements.modal.classList.add('open');
}

// Close Modal
function closeModal() {
  elements.modal.classList.remove('open');
}

// Download Single Image
function downloadImage(index) {
  const img = state.generatedImages[index];
  const link = document.createElement('a');
  link.href = img.startsWith('data:') ? img : 'data:image/png;base64,' + img;
  link.download = `sagan-job-image-${index + 1}.png`;
  link.click();
}

// Download All Images
function downloadAllImages() {
  state.generatedImages.forEach((img, index) => {
    setTimeout(() => downloadImage(index), index * 500);
  });
  showToast('Downloading all images...', 'success');
}

// Generate AI Template
async function generateAiTemplate() {
  const prompt = elements.aiPrompt.value.trim();

  if (!prompt) {
    showToast('Please enter a description', 'error');
    return;
  }

  const btn = document.getElementById('generateAiBtn');
  btn.disabled = true;
  btn.textContent = 'Generating...';

  elements.aiPreview.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>AI is creating your template...</p>
    </div>
  `;

  try {
    const response = await fetch(`${API_URL}/api/ai-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) throw new Error('Failed to generate template');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    elements.aiPreview.innerHTML = `<img src="${url}" alt="AI Generated Template">`;
    showToast('Template generated!', 'success');

  } catch (error) {
    console.error('Error:', error);
    elements.aiPreview.innerHTML = `
      <div class="placeholder">
        <p>Failed to generate template. AI feature requires configuration.</p>
      </div>
    `;
    showToast('AI generation failed. Feature may not be configured.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate Template';
  }
}

// Utility: Blob to Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Expose to global scope for onclick handlers
window.toggleJobSelection = toggleJobSelection;
window.selectTemplate = selectTemplate;
window.downloadImage = downloadImage;
