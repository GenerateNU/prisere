#!/bin/bash
set -e

echo "Building Lambda function..."

cd "$(dirname "$0")"

# Clean
rm -rf dist function.zip

# Install dependencies
echo "Installing dependencies..."
bun install --production

# Create dist and build
mkdir -p dist
bun build lambda-src/index.ts \
  --target=node \
  --outfile=dist/index.mjs \
  --format=esm

# Create package.json
cat > dist/package.json << EOF
{
  "type": "module"
}
EOF

# Copy ALL node_modules (this will be large but will work, need to compile TS -> JS)
echo "Copying node_modules..."
cp -r node_modules dist/

# Create zip
echo "Creating function.zip..."
cd dist
zip -r ../function.zip . -x "*.map"
cd ..

echo "Build completed"
ls -lh function.zip