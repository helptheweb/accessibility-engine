#!/bin/bash

# Simple test script to verify the CLI works
echo "Testing HelpTheWeb Engine CLI..."
echo "================================"

# Create a simple test HTML file
cat > test-simple.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <h1>Test Page</h1>
    <img src="test.jpg">
    <form>
        <input type="text" placeholder="Name">
        <button>Submit</button>
    </form>
</body>
</html>
EOF

echo "Running accessibility test on simple HTML file..."
bun run src/cli/index.js test test-simple.html --verbose

# Clean up
rm -f test-simple.html

echo ""
echo "Test complete!"
