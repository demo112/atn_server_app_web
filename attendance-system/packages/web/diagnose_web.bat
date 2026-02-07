@echo off
echo Starting Vite Diagnosis... > web_debug.log
echo Time: %TIME% >> web_debug.log
call npx vite --debug >> web_debug.log 2>&1
echo Vite exited with code %ERRORLEVEL% >> web_debug.log
