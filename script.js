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
/**
 * Generates a Slurm bash script based on form input values.
 * Reads all form fields and constructs a complete bash script with SBATCH directives.
 * @returns {string} The generated Slurm bash script
 */
function generateScript() {
    const jobName = document.getElementById('job-name').value || 'my-job';
    const account = document.getElementById('account').value;
    const qos = document.getElementById('qos').value;
    const partition = document.getElementById('partition').value || 'normal';
    const time = document.getElementById('time').value || '01:00:00';
    const nodes = document.getElementById('nodes').value || '1';
    const ntasks = document.getElementById('ntasks').value || '1';
    const cpus = document.getElementById('cpus').value || '1';
    const memory = document.getElementById('memory').value || '4G';
    const gpus = document.getElementById('gpus').value || '0';
    const workdir = document.getElementById('workdir').value;
    const email = document.getElementById('email').value;
    const mailBegin = document.getElementById('mail-begin').checked;
    const mailEnd = document.getElementById('mail-end').checked;
    const mailFail = document.getElementById('mail-fail').checked;
    const modules = document.getElementById('modules').value;
    const commands = document.getElementById('commands').value;

    let script = '#!/bin/bash\n\n';
    script += `#SBATCH --job-name='${escapeShell(jobName)}'\n`;
    
    if (account) {
        script += `#SBATCH --account='${escapeShell(account)}'\n`;
    }
    
    script += `#SBATCH --partition='${escapeShell(partition)}'\n`;
    
    if (qos) {
        script += `#SBATCH --qos='${escapeShell(qos)}'\n`;
    }
    
    script += `#SBATCH --time='${escapeShell(time)}'\n`;
    script += `#SBATCH --nodes='${escapeShell(nodes)}'\n`;
    script += `#SBATCH --ntasks-per-node='${escapeShell(ntasks)}'\n`;
    script += `#SBATCH --cpus-per-task='${escapeShell(cpus)}'\n`;
    script += `#SBATCH --mem-per-cpu='${escapeShell(memory)}'\n`;

    if (gpus && parseInt(gpus) > 0) {
        script += `#SBATCH --gres=gpu:'${escapeShell(gpus)}'\n`;
    }

    script += `#SBATCH --output=%x-%j.out\n`;
    script += `#SBATCH --error=%x-%j.err\n`;

    if (email) {
        script += `#SBATCH --mail-user='${escapeShell(email)}'\n`;
        const mailTypes = [];
        if (mailBegin) mailTypes.push('BEGIN');
        if (mailEnd) mailTypes.push('END');
        if (mailFail) mailTypes.push('FAIL');
        if (mailTypes.length > 0) {
            script += `#SBATCH --mail-type=${mailTypes.join(',')}\n`;
        }
    }

    script += '\n# Set working directory (if specified)\n';
    if (workdir) {
        script += `cd '${escapeShell(workdir)}' || exit 1\n`;
    }
    script += '\n';

    script += '# Job information\n';
    script += 'echo "========================================"\n';
    script += 'echo "Job started on $(date)"\n';
    script += 'echo "Job ID: $SLURM_JOB_ID"\n';
    script += 'echo "Running on node(s): $SLURM_NODELIST"\n';
    script += 'echo "Working directory: $(pwd)"\n';
    script += 'echo "========================================"\n';
    script += 'echo ""\n\n';

    if (modules) {
        script += '# Purge and load modules\n';
        script += '# Note: module purge may unload system modules; remove if not desired\n';
        script += 'module purge\n';
        const moduleList = modules.split('\n').filter(m => m.trim());
        moduleList.forEach(module => {
            script += `module load '${escapeShell(module.trim())}'\n`;
        });
        script += 'echo "Loaded modules:"\n';
        script += 'module list 2>&1\n';
        script += 'echo ""\n\n';
    }

    if (commands) {
        script += '# Execute commands\n';
        script += '# WARNING: Commands are executed as-is without escaping\n';
        script += commands.trim() + '\n\n';
    }

    script += '# Job completion and resource usage\n';
    script += 'echo ""\n';
    script += 'echo "========================================"\n';
    script += 'echo "Job completed on $(date)"\n';
    script += 'echo "========================================"\n';
    script += '\n# Display resource usage (wait for accounting data to be available)\n';
    script += '# Note: Delay is system-dependent; increase if data is not available\n';
    script += 'sleep 5\n';
    script += 'sacct -j "$SLURM_JOB_ID" --format=JobID,JobName,Partition,AllocCPUS,State,ExitCode,Elapsed,MaxRSS,MaxVMSize 2>/dev/null || echo "Resource usage data not yet available"\n';

    document.getElementById('output').innerHTML = `<code>${escapeHtml(script)}</code>`;
    return script;
}

/**
 * Escapes shell special characters to prevent command injection.
 * @param {string} text - The text to escape
 * @returns {string} The escaped text safe for shell use
 */
function escapeShell(text) {
    // Handle null or undefined inputs
    if (!text) return '';
    // For Slurm directives and shell commands, wrap in single quotes and escape any single quotes
    return String(text).replace(/'/g, "'\\''");
}

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * @param {string} text - The text to escape
 * @returns {string} The escaped text safe for HTML display
 */
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

/**
 * Copies the generated script to the clipboard.
 * Shows a success indicator on the button and handles errors gracefully.
 */
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

/**
 * Downloads the generated script as a .sh file.
 * The filename is based on the job name from the form.
 */
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
