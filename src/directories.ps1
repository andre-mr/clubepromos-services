function Show-Tree {
    param (
        [string]$path = (Get-Location).Path,
        [string]$indent = "|",
        [string]$outputFile = "tree.txt",
        [switch]$isFirstRun
    )

    if ($isFirstRun) {
        if (Test-Path $outputFile) {
            Remove-Item $outputFile -Force
        }
    }

    $items = Get-ChildItem -Path $path
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            "`n$indent$($item.Name.ToUpper())" | Out-File -FilePath $outputFile -Append -Force
            Show-Tree -path $item.FullName -indent ("$indent  ") -outputFile $outputFile
        } else {
            "$indent$($item.Name)" | Out-File -FilePath $outputFile -Append -Force
        }
    }
}

Show-Tree -isFirstRun
