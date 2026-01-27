// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
if (savedTheme === 'dark') {
    themeToggle.checked = true;
}

themeToggle.addEventListener('change', function() {
    const newTheme = this.checked ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Script generation functionality
function generateScript() {
    const jobName = document.getElementById('job-name').value || 'my-job';
    const partition = document.getElementById('partition').value || 'normal';
    const time = document.getElementById('time').value || '01:00:00';
    const nodes = document.getElementById('nodes').value || '1';
    const ntasks = document.getElementById('ntasks').value || '1';
    const cpus = document.getElementById('cpus').value || '1';
    const memory = document.getElementById('memory').value || '4G';
    const gpus = document.getElementById('gpus').value || '0';
    const email = document.getElementById('email').value;
    const mailBegin = document.getElementById('mail-begin').checked;
    const mailEnd = document.getElementById('mail-end').checked;
    const mailFail = document.getElementById('mail-fail').checked;
    const modules = document.getElementById('modules').value;
    const commands = document.getElementById('commands').value;

    let script = '#!/bin/bash\n\n';
    script += `#SBATCH --job-name=${jobName}\n`;
    script += `#SBATCH --partition=${partition}\n`;
    script += `#SBATCH --time=${time}\n`;
    script += `#SBATCH --nodes=${nodes}\n`;
    script += `#SBATCH --ntasks-per-node=${ntasks}\n`;
    script += `#SBATCH --cpus-per-task=${cpus}\n`;
    script += `#SBATCH --mem-per-cpu=${memory}\n`;

    if (gpus && parseInt(gpus) > 0) {
        script += `#SBATCH --gres=gpu:${gpus}\n`;
    }

    script += `#SBATCH --output=%x-%j.out\n`;
    script += `#SBATCH --error=%x-%j.err\n`;

    if (email) {
        script += `#SBATCH --mail-user=${email}\n`;
        const mailTypes = [];
        if (mailBegin) mailTypes.push('BEGIN');
        if (mailEnd) mailTypes.push('END');
        if (mailFail) mailTypes.push('FAIL');
        if (mailTypes.length > 0) {
            script += `#SBATCH --mail-type=${mailTypes.join(',')}\n`;
        }
    }

    script += '\n# Job information\n';
    script += 'echo "Job started on $(date)"\n';
    script += 'echo "Running on node: $SLURM_NODELIST"\n';
    script += 'echo "Job ID: $SLURM_JOB_ID"\n';
    script += 'echo ""\n\n';

    if (modules) {
        script += '# Load modules\n';
        const moduleList = modules.split('\n').filter(m => m.trim());
        moduleList.forEach(module => {
            script += `module load ${module.trim()}\n`;
        });
        script += '\n';
    }

    if (commands) {
        script += '# Execute commands\n';
        script += commands.trim() + '\n\n';
    }

    script += '# Job completion\n';
    script += 'echo ""\n';
    script += 'echo "Job completed on $(date)"\n';

    document.getElementById('output').innerHTML = `<code>${escapeHtml(script)}</code>`;
    return script;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Copy to clipboard functionality
function copyToClipboard() {
    const outputElement = document.getElementById('output');
    const text = outputElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
        `;
        copyBtn.classList.add('btn-success');
        copyBtn.classList.remove('btn-secondary');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('btn-success');
            copyBtn.classList.add('btn-secondary');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

// Download script functionality
function downloadScript() {
    const outputElement = document.getElementById('output');
    const text = outputElement.textContent;
    const jobName = document.getElementById('job-name').value || 'my-job';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jobName}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Event listeners
document.getElementById('generate-btn').addEventListener('click', generateScript);
document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
document.getElementById('download-btn').addEventListener('click', downloadScript);

// Generate initial script on page load
window.addEventListener('DOMContentLoaded', generateScript);
