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

# --- Handle the 'reports' submodule conditionally ---
REPORTS_REPO_NAME="sm-workos-reports"
REPORTS_PATH="app/(dashboard)/reports"
REPORTS_REPO_URL="https://github.com/${GITHUB_USER}/${REPORTS_REPO_NAME}.git"

echo "--- Conditionally processing submodule: $REPORTS_PATH ---"

# Check for access rights using git ls-remote without cloning
if git ls-remote "$REPORTS_REPO_URL" &> /dev/null; then
    echo "Access to reports repository confirmed. Cloning..."
    setup_submodule "$REPORTS_PATH" "$REPORTS_REPO_NAME"
else
    echo "WARNING: No access to reports repository. Creating a dummy module."

    # Clean up any lingering submodule config
    git submodule deinit -f "$REPORTS_PATH" >/dev/null 2>&1 || true
    git rm -f "$REPORTS_PATH" >/dev/null 2>&1 || true
    rm -rf ".git/modules/$REPORTS_PATH"
    
    # Create dummy directory and files
    mkdir -p "$REPORTS_PATH"
    
    # Create a dummy page component
    cat > "$REPORTS_PATH/page.tsx" << EOL
import React from 'react';

const DummyReportsPage = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed #ccc', margin: '2rem' }}>
      <h1>Reports Module</h1>
      <p>This is a placeholder for the reports module.</p>
      <p>You do not have the necessary permissions to view the real content.</p>
    </div>
  );
};

export default DummyReportsPage;
EOL

    # Create a dummy layout that just passes through
    cat > "$REPORTS_PATH/layout.tsx" << EOL
import React from 'react';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
EOL
    echo "Dummy reports module created at $REPORTS_PATH"
fi

echo "--- Development environment setup complete! ---" 