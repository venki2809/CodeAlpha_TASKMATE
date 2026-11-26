@echo off
cd /d "%~dp0"
echo ===============================================
echo      TASKMATE FRONTEND - REACT / VITE
 echo ===============================================
if not exist node_modules (
  echo Installing frontend dependencies...
  call npm install
  if errorlevel 1 (echo Frontend install failed. & pause & exit /b 1)
)
echo Starting frontend...
call npm run dev
if errorlevel 1 (echo Frontend failed. & pause)
