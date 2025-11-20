#!/bin/bash
set -e
echo "Building Lambda function with layer..."
cd "$(dirname "$0")"

# Clean
rm -rf dist layer function.zip layer.zip

# Install dependencies
echo "Installing dependencies..."
bun install --production

bun install

# ===== BUILD LAYER (Only React - the largest dependency) =====
echo "Building minimal Lambda Layer..."
mkdir -p layer/nodejs/node_modules

cp -r node_modules layer/nodejs/


# Clean up layer
find layer/nodejs/node_modules -name "*.md" -type f -delete
find layer/nodejs/node_modules -name "*.map" -type f -delete
find layer/nodejs/node_modules -name "*.d.ts" -type f -delete
find layer/nodejs/node_modules -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true

cp package.json layer/nodejs/

# Create layer zip with maximum compression
echo "Creating layer.zip with maximum compression..."
cd layer
zip -9 -r ../layer.zip . -x "*.map" "**/.DS_Store" "**/README.md" "**/LICENSE" "**/CHANGELOG.md" "**/LICENSE.txt" "**/*.md" "**/test/**" "**/tests/**" "**/*.test.js" "**/*.spec.js" "**/examples/**" "**/.github/**" "**/docs/**" "**/*.d.ts" "**/*.ts"
cd ..
echo "Layer created:"
ls -lh layer.zip

# Create dist and build function
echo "Building function code..."
mkdir -p dist
bun build lambda-src/index.ts \
  --target=node \
  --outfile=dist/index.mjs \
  --format=esm \
  --packages=external

# Create package.json for function
cat > dist/package.json << EOF
{
  "type": "module"
}
EOF

# Create function zip (without node_modules since they're in the layer)
echo "Creating function.zip..."
cd dist
zip -r ../function.zip . -x "*.map"
cd ..

echo "Build completed successfully!"
echo "Function package:"
ls -lh function.zip
echo "Layer package:"
ls -lh layer.zip
echo ""
echo "Next steps:"
echo "1. Upload layer.zip as a Lambda layer"
echo "2. Note the layer ARN"
echo "3. Upload function.zip as your Lambda function code"
echo "4. Add the layer ARN to your Lambda function configuration"