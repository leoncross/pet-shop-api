#!/bin/bash

trap "echo 'Script interrupted'; exit" INT

ROOT_DIR=$(pwd)
TEMP_DIR_PREFIX="temp"
OUTPUT_DIR="zipped-lambdas"
IGNORED_PACKAGES=("webhook")

function print_separator() {
    echo "================== $1 =================="
}

function is_ignored_package {
    local pkg=$1
    for ignored in "${IGNORED_PACKAGES[@]}"; do
        if [[ "$pkg" == "$ignored" ]]; then
            return 0
        fi
    done
    return 1
}

function process_package {
  local package=$1
  local package_name=$(basename "$package")

  print_separator "Processing: $package"
  is_ignored_package "$package_name" && echo "$package_name is ignored." && return

  if [ -d "$package" ]; then
    echo "Building $package_name"
    cd "$package"

    local TEMP_DIR="$TEMP_DIR_PREFIX_$(date +%s)"
    mkdir $TEMP_DIR

    cp -L -R ./dist/* $TEMP_DIR
    cp -L -R ./node_modules $TEMP_DIR

    cd $TEMP_DIR
    echo "Zipping $package_name..."
    zip -r "$ROOT_DIR/$OUTPUT_DIR/$package_name.zip" * >/dev/null
    if [ $? -eq 0 ]; then
      echo "$package_name.zip created successfully."
    else
      echo "Failed to create $package_name.zip."
    fi

    cd ..
    rm -r $TEMP_DIR dist
    cd $ROOT_DIR
  fi
}

function setup_nohoist() {
    print_separator "Setup:"
    PACKAGE_JSON=$(cat package.json)
    MODIFIED_PACKAGE_JSON=$(echo ${PACKAGE_JSON} | jq '.workspaces += {nohoist: ["**"]}')
    echo "${MODIFIED_PACKAGE_JSON}" > package.json
}

function remove_nohoist() {
    print_separator "Cleanup:"
    PACKAGE_JSON=$(cat package.json)
    MODIFIED_PACKAGE_JSON=$(echo ${PACKAGE_JSON} | jq 'del(.workspaces.nohoist)')
    echo "${MODIFIED_PACKAGE_JSON}" > package.json
}

echo "Installing all packages..."
rm -rf node_modules
setup_nohoist

yarn install
yarn run build
echo "Preparing output directory..."
mkdir -p $OUTPUT_DIR

for package in packages/*; do
    process_package $package
done

remove_nohoist
rm -rf node_modules

yarn install
print_separator "Script completed."
