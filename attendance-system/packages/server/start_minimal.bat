@echo off
cd /d "%~dp0"
echo Starting minimal test...
call .\node_modules\.bin\ts-node src/index.ts
echo Exited with code %errorlevel%
pause