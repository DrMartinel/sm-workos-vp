#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Replace the placeholder with your actual GitHub username
GITHUB_USER="quangsmg"

# An array of your submodule paths and their corresponding repo URLs
declare -A submodules
submodules["app/shared-ui"]="sm-workos-shared-ui"
submodules["app/domain-apps"]="sm-workos-domain-apps"
submodules["app/(dashboard)/reports"]="sm-workos-reports"

echo "Initializing submodules..."

for path in "${!submodules[@]}"; do
  repo_name=${submodules[$path]}
  repo_url="https://oauth2:${GITHUB_PAT}@github.com/${GITHUB_USER}/${repo_name}.git"
  
  echo "Processing submodule: $path"

  # Remove the submodule configuration from .git/config
  git config -f .git/config --remove-section "submodule.$path" 2>/dev/null || true
  
  # Remove the submodule entry from .gitmodules
  git config -f .gitmodules --remove-section "submodule.$path" 2>/dev/null || true

  # Remove the submodule directory from the git index
  git rm --cached "$path" 2>/dev/null || true

  # Remove the submodule's git directory
  rm -rf ".git/modules/$path"

  # Remove the local submodule directory
  rm -rf "$path"
  
  # Add the submodule with the PAT, using --force to override the .gitignore rule
  echo "Adding submodule $repo_name at $path"
  git submodule add --force "$repo_url" "$path"
done

echo "Submodule initialization complete." 