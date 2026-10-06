# Install the performance-enhance-journey skill into a Cursor skills directory.
#
#   pwsh -File scripts/install.ps1                 # auto-detect the user Agent Store
#   pwsh -File scripts/install.ps1 -Fallback       # use ~\.cursor\skills (machine-local)
#   pwsh -File scripts/install.ps1 -Destination <path>
#   pwsh -File scripts/install.ps1 -Force          # overwrite an existing install
#
# Copies the runtime files and the image helper; other repo tooling stays here.
[CmdletBinding()]
param(
    [string]$Destination,
    [switch]$Fallback,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

$name = 'performance-enhance-journey'
$repo = Split-Path -Parent $PSScriptRoot
$runtimeFiles = @('SKILL.md', 'checkpoints.md', 'routing.md', 'verification.md', 'README.md', 'LICENSE')

if (-not $Destination) {
    if ($Fallback) {
        $Destination = Join-Path $HOME ".cursor\skills\$name"
    }
    else {
        $storesRoot = Join-Path $env:LOCALAPPDATA 'Cursor\AgentStores\cursor_agent_stores'
        $stores = @(
            Get-ChildItem -Directory $storesRoot -ErrorAction SilentlyContinue |
                Where-Object { Test-Path (Join-Path $_.FullName 'files\skills') }
        )
        if ($stores.Count -eq 1) {
            $Destination = Join-Path $stores[0].FullName "files\skills\$name"
        }
        else {
            throw "Could not pick an Agent Store ($($stores.Count) candidates under $storesRoot). Pass -Destination <path>, or -Fallback for $HOME\.cursor\skills\$name."
        }
    }
}

if ((Test-Path $Destination) -and (-not $Force)) {
    throw "$Destination already exists. Re-run with -Force to overwrite."
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
foreach ($file in $runtimeFiles) {
    Copy-Item (Join-Path $repo $file) -Destination $Destination -Force
}

# Replace the checkpoint set wholesale so removed/renamed checkpoints do not linger.
$checkpointsDestination = Join-Path $Destination 'checkpoints'
New-Item -ItemType Directory -Force -Path $checkpointsDestination | Out-Null
Get-ChildItem -Path $checkpointsDestination -Filter *.md -ErrorAction SilentlyContinue | Remove-Item -Force
Copy-Item (Join-Path $repo 'checkpoints') -Destination $Destination -Recurse -Force

$scriptsDestination = Join-Path $Destination 'scripts'
New-Item -ItemType Directory -Force -Path $scriptsDestination | Out-Null
Copy-Item (Join-Path $repo 'scripts/responsive-webp.py') -Destination $scriptsDestination -Force

$count = (Get-ChildItem -Path $checkpointsDestination -Filter *.md).Count
Write-Host "Installed $name -> $Destination ($count checkpoints)"
Write-Host 'Start a new Cursor Agent chat to load the skill.'
