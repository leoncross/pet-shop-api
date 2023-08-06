#!/bin/bash

ROOT_DIR=$(pwd) # Variable: Root directory path
TEMP_DIR_PREFIX="temp" # Variable: Temporary directory prefix
OUTPUT_DIR="zipped-lambdas" # Variable: Output directory for zipped files
NOHOIST_VALUE='"nohoist": ["**"]'

function print_separator() {
    echo "================== $1 =================="
}

function process_package {
  local package=$1

  print_separator "Processing: $package"

  # Ensure that $package is a directory
  if [ -d "$package" ]; then
    # Extract the package name
    local package_name=$(basename "$package")
    echo "Building $package_name"

    # Move into the package directory
    cd "$package"

    # Create a temporary directory with a unique name
    local TEMP_DIR="$TEMP_DIR_PREFIX_$(date +%s)"
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
    rm -r $TEMP_DIR dist

    # Move back to the root directory
    cd $ROOT_DIR
  fi
}

function setup_nohoist() {
    print_separator "Setup:"
    # Read the package.json file
    PACKAGE_JSON=$(cat package.json)
    # Add the nohoist key to the workspaces object
    MODIFIED_PACKAGE_JSON=$(echo ${PACKAGE_JSON} | jq '.workspaces += {nohoist: ["**"]}')
    # Write the result back to the package.json file
    echo "${MODIFIED_PACKAGE_JSON}" > package.json
}

function remove_nohoist() {
    print_separator "Cleanup:"
    # Read the package.json file
    PACKAGE_JSON=$(cat package.json)
    # Remove the nohoist key from the workspaces object
    MODIFIED_PACKAGE_JSON=$(echo ${PACKAGE_JSON} | jq 'del(.workspaces.nohoist)')
    # Write the result back to the package.json file
    echo "${MODIFIED_PACKAGE_JSON}" > package.json
}

# Install all packages for the monorepo
echo "Installing all packages..."
rm -rf node_modules
setup_nohoist

yarn install
yarn run build
# Create the output directory if it doesn't exist
echo "Preparing output directory..."
mkdir -p $OUTPUT_DIR

# Loop through each package in the packages directory
for package in packages/*; do
    process_package $package
done

remove_nohoist
rm -rf node_modules

yarn install
print_separator "Script completed."
