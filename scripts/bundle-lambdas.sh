#!/bin/bash

ROOT_DIR=$(pwd) # Variable: Root directory path
TEMP_DIR_PREFIX="temp" # Variable: Temporary directory prefix
OUTPUT_DIR="zipped-lambdas" # Variable: Output directory for zipped files

# Separator
SEPARATOR=$(printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -)

# Pre-loop tasks
echo $SEPARATOR
echo "Setup:"
echo $SEPARATOR

# Install all packages for the monorepo
echo "Installing all packages..."
npm install

# Build all packages using workspaces
echo "Building all packages..."
npx --workspaces --no-install npm run build

# Install dependencies with linked strategy
echo "Installing dependencies with linked strategy..."
npm install --install-strategy=linked

# Create the output directory if it doesn't exist
echo "Preparing output directory..."
mkdir -p $OUTPUT_DIR

# Loop through each package in the packages directory
for package in packages/*; do
  echo $SEPARATOR
  echo "Processing package: $package"
  echo $SEPARATOR

  # Ensure that $package is a directory
  if [ -d "$package" ]; then
    # Extract the package name
    package_name=$(basename "$package")
    echo "Building $package_name"

    # Move into the package directory
    cd "$package"

    # Create a temporary directory with a unique name
    TEMP_DIR="$TEMP_DIR_PREFIX_$(date +%s)"
    mkdir $TEMP_DIR

    # Copy the dist and node_modules directories, following symlinks
    cp -L -R ./dist/* $TEMP_DIR
    cp -L -R ./node_modules $TEMP_DIR

    # Move into the temporary directory
    cd $TEMP_DIR

    # Create a zip file and check if it succeeded
    echo "Zipping $package_name..."
    zip -r "$ROOT_DIR/$OUTPUT_DIR/$package_name.zip" * >/dev/null
    if [ $? -eq 0 ]; then
      echo "$package_name.zip created successfully."
    else
      echo "Failed to create $package_name.zip."
    fi

    # Move back to the package directory
    cd ..

    # Remove the temporary directory
    echo "Cleaning up Build and Temporary folders: $TEMP_DIR..."
    rm -r $TEMP_DIR dist

    # Move back to the root directory
    cd $ROOT_DIR
  fi
done

# Post-loop tasks
echo $SEPARATOR
echo "Cleanup:"
echo $SEPARATOR

# Install dependencies at the root directory again
echo "Reinstalling dependencies at the root..."
npm install

# Done
echo "Script completed."
