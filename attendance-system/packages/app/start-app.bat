@echo off
echo Setting up Android environment...
cd /d %~dp0
set PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools;%PATH%

echo Checking ADB devices...
adb devices

echo Starting Expo App...
npm start -- --android --port 8082
pause
