$log = "D:\atn_server\atn_server_app_web\git_fix.log"
"Starting check at $(Get-Date)" | Out-File $log -Encoding utf8
try {
    Write-Output "Current Dir: $(Get-Location)" | Out-File -Append $log -Encoding utf8
    
    Write-Output "--- Git Status Before ---" | Out-File -Append $log -Encoding utf8
    git status 2>&1 | Out-File -Append $log -Encoding utf8
    
    if (Test-Path ".git/REBASE_HEAD") {
        Write-Output "--- Aborting Rebase ---" | Out-File -Append $log -Encoding utf8
        git rebase --abort 2>&1 | Out-File -Append $log -Encoding utf8
    } else {
        Write-Output "No rebase in progress." | Out-File -Append $log -Encoding utf8
    }

    Write-Output "--- Git Status After ---" | Out-File -Append $log -Encoding utf8
    git status 2>&1 | Out-File -Append $log -Encoding utf8
    
} catch {
    Write-Output "Error: $_" | Out-File -Append $log -Encoding utf8
}
"Done." | Out-File -Append $log -Encoding utf8
