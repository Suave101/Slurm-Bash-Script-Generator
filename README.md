# Slurm Bash Script Generator

A web-based tool for generating Slurm batch scripts with an intuitive user interface built using Daisy UI.

## Features

- 🎨 Beautiful UI powered by Daisy UI and Tailwind CSS
- 🌓 Dark/Light theme toggle
- ⚙️ Comprehensive Slurm job configuration options:
  - Job name, partition, and time limits
  - Node and CPU resource allocation
  - Memory and GPU configuration
  - Email notifications
  - Module loading
  - Custom command execution
- 📋 Copy to clipboard functionality
- 💾 Download generated scripts
- 📱 Responsive design for all devices

## Usage

1. Open `index.html` in your web browser
2. Fill in the job configuration form:
   - Set basic job parameters (name, partition, time limit)
   - Configure resource requirements (nodes, CPUs, memory, GPUs)
   - Add email for notifications (optional)
   - Specify modules to load
   - Add your commands to execute
3. Click "Generate Script" to see your Slurm bash script
4. Copy to clipboard or download the script
5. Submit to your Slurm cluster using `sbatch your_script.sh`

## About Slurm

Slurm (Simple Linux Utility for Resource Management) is an open-source workload manager designed for Linux clusters. It's widely used in high-performance computing (HPC) environments for:
- Job scheduling
- Resource allocation
- Workload management

## Technologies Used

- **Daisy UI** - Component library for Tailwind CSS
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - For script generation and interactivity

## License

MIT