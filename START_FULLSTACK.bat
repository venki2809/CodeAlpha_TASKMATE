@echo off
cd /d "%~dp0"
if not exist "package.json" (
 echo ERROR: Run this BAT from inside the extracted TASKMATE project folder.
 pause
 exit /b 1
)
if not exist node_modules (
  echo Installing full-stack dependencies...
  call npm install
  if errorlevel 1 (echo NPM install failed. & pause & exit /b 1)
)
echo Starting frontend and backend together...
echo Wait until the backend displays TASKMATE API ready.
echo Then open http://localhost:5173
call npm run dev
if errorlevel 1 (echo A server failed to start. & pause)
