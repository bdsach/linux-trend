#!/bin/bash

# Get the current date (date time)
current_datetime=$(date +'%d-%m-%Y %H:%M:%S')

# Navigate to your project directory
cd /Users/bandit/Development/React/linux-trend/

# Run your Node.js scrip
/Users/bandit/Library/Caches/fnm_multishells/37387_1708908416318/bin/node fetch.js

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
  # Add and commit changes to Git
  git add .
  git commit -m "📚 update from script: $current_datetime"

  # Push to GitHub (replace <branch> with your desired branch name)
  git push origin main
else
  echo "No changes to commit."
fi
