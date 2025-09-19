#!/bin/bash

# ==============================================================================
# AWE e.V. Final Project Structure Migration Script
#
# This script refactors the project to a locale-first, group-based routing
# structure for the Next.js App Router.
#
# USAGE:
# 1. Save this file as `migrate-structure.sh` in the root of your project.
# 2. Open your terminal and run: `chmod +x migrate-structure.sh`
# 3. Run the script: `./migrate-structure.sh`
# ==============================================================================

# --- SAFETY FIRST ---
# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u
# The return value of a pipeline is the status of the last command to exit with a non-zero status.
set -o pipefail

# --- PRE-FLIGHT CHECKS ---
echo "🚀 Starting AWE e.V. project structure migration..."
echo ""
echo "⚠️  WARNING: This script will permanently modify your project's file structure."
echo "Please make sure you have committed your current changes to git or have a full backup."
echo ""
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 1
fi

if [ ! -d "app" ]; then
    echo "❌ ERROR: 'app' directory not found. Please run this script from your project root."
    exit 1
fi

# --- HELPER FUNCTION ---
# A safe function to move a file only if it exists.
move_file() {
    local src=$1
    local dest=$2
    if [ -f "$src" ]; then
        # Ensure the destination directory exists before moving the file.
        mkdir -p "$(dirname "$dest")"
        mv "$src" "$dest"
        echo "  ✅ Moved '$src' to '$dest'"
    else
        echo "  ⚪️ Skipping '$src' (file does not exist)."
    fi
}

# --- STEP 1: CREATE NEW DIRECTORY STRUCTURE ---
echo ""
echo "📁 Step 1: Creating new directory structure..."

# App structure (locale-first)
mkdir -p app/'[locale]'/{'(public)','(auth)',admin,members}

# Components structure
mkdir -p components/{ui,common}
mkdir -p components/layout/{public,auth,admin,members}
mkdir -p components/forms/{auth,contact,'program-application'}
mkdir -p components/features/{programs,donations,volunteers,impact}

# Lib structure
mkdir -p lib/{auth,programs,users,donations,notifications}/{hooks,utils}
mkdir -p lib/{i18n,database,storage,hooks,stores,types}

echo "Directory structure created successfully."


# --- STEP 2: MOVE EXISTING FILES ---
echo ""
echo "📦 Step 2: Moving existing files into the new structure..."

# Move top-level public files
# Note: This assumes your old structure was app/(public)/[locale]/...
# If it was different, you may need to adjust the source paths.
move_file "app/(public)/[locale]/layout.tsx" "app/[locale]/(public)/layout.tsx"
move_file "app/(public)/[locale]/page.tsx" "app/[locale]/(public)/page.tsx"
move_file "app/(public)/[locale]/loading.tsx" "app/[locale]/(public)/loading.tsx"
move_file "app/(public)/[locale]/error.tsx" "app/[locale]/(public)/error.tsx"
move_file "app/(public)/[locale]/not-found.tsx" "app/[locale]/not-found.tsx"

# Move component files
move_file "components/public/header.tsx" "components/layout/public/header.tsx"
move_file "components/public/footer.tsx" "components/layout/public/footer.tsx"
move_file "components/public/navigation.tsx" "components/layout/public/navigation.tsx"

# Move common components
move_file "components/brand-logo.tsx" "components/common/brand-logo.tsx"
move_file "components/language-switcher.tsx" "components/common/language-switcher.tsx"
move_file "components/theme-toggle.tsx" "components/common/theme-toggle.tsx"

echo "File migration process completed."


# --- STEP 3: GENERATE POST-MIGRATION CHECKLIST ---
echo ""
echo "✅ Script execution finished!"
echo ""
echo "📋 IMPORTANT: The automated part is done. Now you must complete these manual steps:"
echo ""

cat << 'EOF'
================================================================================
                       📝 POST-MIGRATION CHECKLIST 📝
================================================================================

### 1. Update Middleware (CRITICAL)

Your middleware logic needs to be updated. Since all pages are now localized,
the configuration is often simpler.

**Replace the content of `middleware.ts` with this:**
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'de'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The `localePrefix` option is used to control whether the default
  // locale is included in the URL.
  // 'always' - /en/about
  // 'as-needed' - /about (for default locale)
  localePrefix: 'always'
});

export const config = {
  // Match all pathnames except for assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};