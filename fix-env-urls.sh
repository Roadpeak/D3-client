#!/bin/bash
# Fix all string literals to actual production URLs
find src -type f \( -name "*.js" -o -name "*.jsx" \) -print0 | while IFS= read -r -d '' file; do
    sed -i '' "s/'\${process\.env\.REACT_APP_API_BASE_URL}'/'https:\/\/api.discoun3ree.com\/api\/v1'/g" "$file"
done
echo "Fixed all files"
