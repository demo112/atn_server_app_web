Write-Host "--- ROOT STATUS ---"
git -C D:\atn_server\atn_server_app_web status
git -C D:\atn_server\atn_server_app_web branch -vv
Write-Host "--- SUBMODULE STATUS ---"
git -C D:\atn_server\atn_server_app_web\attendance-system status
git -C D:\atn_server\atn_server_app_web\attendance-system branch -vv
