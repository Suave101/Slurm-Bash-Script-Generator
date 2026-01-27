# Slurm Bash Script Generator

A simple and intuitive web-based GUI for generating bash scripts configured for Slurm cluster job submissions.

## Features

- 🎨 Clean, modern web interface
- ⚙️ Configure all essential SBATCH parameters:
  - Job name
  - Number of nodes and tasks
  - Output log file
  - Partition selection
  - GPU resources (gres)
  - CPUs per task
  - Memory allocation
- 📝 Real-time script preview
- 💾 Download generated script as `.sh` file
- 🚀 No installation required - runs in any modern web browser

## Usage

Simply open `index.html` in your web browser:

```bash
open index.html
```

Or serve it with a simple HTTP server:

```bash
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

## Generated Script Format

The tool generates Slurm bash scripts with the following header format:

```bash
#!/bin/bash

# --- Slurm Job Configuration ---
#SBATCH --job-name=distTestassist
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --output=distributionShiftAssist.log
#SBATCH --partition=gpu2
#SBATCH --gres=gpu:4
#SBATCH --cpus-per-task=16        # Request 16 CPUs (4 per GPU is a good ratio)
#SBATCH --mem=128G                # Increase memory to handle larger batches
#

# Your commands here
# Example:
# module load python/3.9
# source activate myenv
# python your_script.py
```

## Customization

Default values are pre-filled based on common GPU cluster configurations, but all fields can be customized to match your specific requirements.

## License

This project is open source and available under the MIT License.