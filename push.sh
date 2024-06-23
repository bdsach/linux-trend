#!/bin/bash


# Get the current date (date time)
current_datetime=$(date +'%d-%m-%Y %H:%M:%S')

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
  # Add and commit changes to Git
  git add .
  git commit -m "📚 push from script: $current_datetime"

  # Push to GitHub (replace <branch> with your desired branch name)
  git push origin main
else
  echo "No changes to commit."
fi
