@echo off
cd /d "%~dp0"
echo ===============================================
echo      TASKMATE BACKEND - EXPRESS SERVER
 echo ===============================================
if not exist node_modules (
  echo Installing backend dependencies...
  call npm install
  if errorlevel 1 (echo Backend install failed. & pause & exit /b 1)
)
echo Starting local demo database and REST API...
call npm run dev
if errorlevel 1 (echo Backend server failed. & pause)
