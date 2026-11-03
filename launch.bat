@echo off
rem One-click launcher for Windows: starts a local server for the presentation
rem and opens it in the default browser. Close this window (or press Ctrl+C)
rem to stop the server. Options are passed on, e.g.  launch.bat --port 9000
setlocal
title Guitar Journey - local presentation server
cd /d "%~dp0"

rem Find a working Python 3.8+ ("python" may be the Microsoft Store stub, so test it).
set "PY="
python -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)" >nul 2>&1 && set "PY=python"
if not defined PY py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)" >nul 2>&1 && set "PY=py -3"

if not defined PY (
  echo.
  echo  ERROR: Python 3.8 or newer was not found.
  echo.
  echo  Install it from https://www.python.org/downloads/ and tick
  echo  "Add python.exe to PATH" during installation, then run launch.bat again.
  echo.
  echo  No Python? Open dist\presentation.html instead ^(the standalone version,
  echo  created with "npm run build"^), or use the GitHub Pages link from the README.
  echo.
  pause
  exit /b 1
)

%PY% "%~dp0scripts\serve.py" %*
if errorlevel 1 (
  echo.
  echo  The server could not be started. See the message above.
  pause
  exit /b 1
)
endlocal
