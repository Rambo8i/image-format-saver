$ErrorActionPreference = 'Stop'
$repoDirectory = Split-Path -Parent $PSScriptRoot
$extensionDirectory = Join-Path $repoDirectory 'image-format-saver'
$manifest = Get-Content -LiteralPath (Join-Path $extensionDirectory 'manifest.json') -Raw | ConvertFrom-Json
$destinationDirectory = Join-Path $repoDirectory 'dist'
New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
$zipPath = Join-Path $destinationDirectory ('image-format-saver-{0}.zip' -f $manifest.version)

# Explicit allowlist keeps documentation, tests, source SVG metadata and secrets out of the upload.
$files = @('manifest.json', 'background.js', 'offscreen.html', 'offscreen.js', 'popup.html', 'popup.css', 'popup.js')
$files += $manifest.icons.PSObject.Properties.Value
$files += $manifest.action.default_icon.PSObject.Properties.Value
$files = @($files | Sort-Object -Unique)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$fileStream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
$archive = [System.IO.Compression.ZipArchive]::new($fileStream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($relativePath in $files) {
    $sourcePath = Join-Path $extensionDirectory $relativePath
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $sourcePath, $relativePath.Replace('\', '/'), [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally {
  $archive.Dispose()
  $fileStream.Dispose()
}

$verification = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  if ($null -eq $verification.GetEntry('manifest.json')) { throw 'manifest.json must be at the ZIP root.' }
  if ($verification.Entries.Count -ne $files.Count) { throw 'Unexpected ZIP entry count.' }
  foreach ($relativePath in $files) {
    if ($null -eq $verification.GetEntry($relativePath)) { throw "Missing ZIP entry: $relativePath" }
  }
} finally {
  $verification.Dispose()
}
Write-Output ('Created and verified: {0} ({1} files)' -f $zipPath, $files.Count)
$hashAlgorithm = [System.Security.Cryptography.SHA256]::Create()
$hashStream = [System.IO.File]::OpenRead($zipPath)
try {
  $checksum = [System.BitConverter]::ToString($hashAlgorithm.ComputeHash($hashStream)).Replace('-', '').ToLowerInvariant()
  Write-Output ('SHA256: {0}' -f $checksum)
} finally {
  $hashStream.Dispose()
  $hashAlgorithm.Dispose()
}
