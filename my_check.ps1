Write-Output "Starting check..." | Out-File -FilePath debug.log -Encoding utf8
Get-Command git | Out-File -FilePath git_cmd.log -Encoding utf8
git status 2>&1 | Out-File -FilePath git_status.log -Encoding utf8
Write-Output "Done." | Out-File -FilePath done.log -Encoding utf8
