#!/usr/bin/env bash
# Install the performance-enhance-journey skill into a Cursor skills directory.
#
#   ./scripts/install.sh                       # auto-detect the user Agent Store, else ~/.cursor/skills
#   ./scripts/install.sh --destination <path>
#   ./scripts/install.sh --force               # overwrite an existing install
#
# Copies the runtime files and the image helper; other repo tooling stays here.
set -euo pipefail

name='performance-enhance-journey'
repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
destination=''
force=0

while [ $# -gt 0 ]; do
    case "$1" in
        -d|--destination) destination="${2:-}"; shift 2 ;;
        -f|--force) force=1; shift ;;
        -h|--help) sed -n '2,10p' "${BASH_SOURCE[0]}"; exit 0 ;;
        *) echo "Unknown argument: $1" >&2; exit 2 ;;
    esac
done

if [ -z "$destination" ]; then
    for stores_root in \
        "$HOME/Library/Application Support/Cursor/AgentStores/cursor_agent_stores" \
        "${XDG_CONFIG_HOME:-$HOME/.config}/Cursor/AgentStores/cursor_agent_stores"; do
        if [ -d "$stores_root" ]; then
            stores=()
            for store in "$stores_root"/*/files/skills; do
                [ -d "$store" ] && stores+=("$store")
            done
            if [ "${#stores[@]}" -eq 1 ]; then
                destination="${stores[0]}/$name"
                break
            fi
        fi
    done
    [ -n "$destination" ] || destination="$HOME/.cursor/skills/$name"
fi

if [ -e "$destination" ] && [ "$force" -ne 1 ]; then
    echo "$destination already exists. Re-run with --force to overwrite." >&2
    exit 1
fi

mkdir -p "$destination/checkpoints"
for file in SKILL.md checkpoints.md routing.md verification.md README.md LICENSE; do
    cp -f "$repo/$file" "$destination/$file"
done

# Replace the checkpoint set wholesale so removed/renamed checkpoints do not linger.
find "$destination/checkpoints" -maxdepth 1 -name '*.md' -delete
cp -f "$repo"/checkpoints/*.md "$destination/checkpoints/"
mkdir -p "$destination/scripts"
cp -f "$repo/scripts/responsive-webp.py" "$destination/scripts/"

count="$(find "$destination/checkpoints" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')"
echo "Installed $name -> $destination ($count checkpoints)"
echo 'Start a new Cursor Agent chat to load the skill.'
