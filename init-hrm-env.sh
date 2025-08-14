#!/bin/bash
set -e

GITHUB_USER="quangsmg"

# --- Function to handle a single submodule ---
setup_submodule() {
    local path=$1
    local repo_name=$2
    local repo_url="https://github.com/${GITHUB_USER}/${repo_name}.git"

    echo "--- Processing submodule: $path ---"

    # Clean up previous state if it exists
    git submodule deinit -f "$path" >/dev/null 2>&1 || true
    git rm -f "$path" >/dev/null 2>&1 || true
    rm -rf ".git/modules/$path"
    rm -rf "$path"

    echo "Adding submodule from $repo_url"
    git submodule add "$repo_url" "$path"
}

# --- Handle mandatory submodules ---
setup_submodule "app/shared-ui" "sm-workos-shared-ui"
setup_submodule "app/domain-apps" "sm-workos-domain-apps"

echo "--- HRM environment setup complete! ---" 