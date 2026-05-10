@echo off
setlocal
cd /d "%~dp0"

set "READY=%~dp0_ready"
set "CHECK_ONLY=0"
set "HAS_REMOTE=0"
if /I "%~1"=="--check" set "CHECK_ONLY=1"

echo ===== 1. Check _ready folder =====
if not exist "%READY%\" (
  echo ERROR: _ready folder not found.
  echo Put the finished website files in:
  echo %READY%
  pause
  exit /b 1
)

call :require "index.html" || exit /b 1
call :require "works.html" || exit /b 1
call :require "release.html" || exit /b 1
call :require "guidelines.html" || exit /b 1
call :require "about.html" || exit /b 1
call :require "css\style.css" || exit /b 1
call :require "js\main.js" || exit /b 1
call :require "js\data.js" || exit /b 1
call :requireDir "images" || exit /b 1

if "%CHECK_ONLY%"=="1" (
  echo Check passed. No files copied, no git commands run.
  exit /b 0
)

echo.
echo ===== 2. Check git repository =====
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
  git init -b main >nul 2>&1
  if %errorlevel% neq 0 git init >nul 2>&1
)

git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 set "HAS_REMOTE=1"

if "%HAS_REMOTE%"=="1" (
  echo.
  echo ===== 3. Git pull =====
  git pull --rebase
  if %errorlevel% neq 0 (
    echo Git pull failed!
    pause
    exit /b %errorlevel%
  )
) else (
  echo No origin remote configured. Skipping git pull.
)

echo.
echo ===== 4. Copy _ready files to repository =====
copy /y "%READY%\index.html" "index.html"
copy /y "%READY%\works.html" "works.html"
copy /y "%READY%\release.html" "release.html"
copy /y "%READY%\guidelines.html" "guidelines.html"
copy /y "%READY%\about.html" "about.html"

if exist "css" rmdir /s /q "css"
if exist "js" rmdir /s /q "js"
if exist "images" rmdir /s /q "images"
mkdir "css"
mkdir "js"
mkdir "images"

copy /y "%READY%\css\style.css" "css\style.css"
copy /y "%READY%\js\main.js" "js\main.js"
copy /y "%READY%\js\data.js" "js\data.js"
xcopy "%READY%\images" "images\" /E /I /Y

echo.
echo ===== 5. Git commit =====
git add index.html works.html release.html guidelines.html about.html css js images .gitignore update.bat
git diff --cached --quiet
if %errorlevel% equ 0 (
  echo No changes to commit.
  goto done
)

git commit -m "Update site files"
if %errorlevel% neq 0 (
  echo Git commit failed!
  pause
  exit /b %errorlevel%
)

if "%HAS_REMOTE%"=="1" (
  echo.
  echo ===== 6. Git push =====
  git rev-parse --abbrev-ref --symbolic-full-name @{u} >nul 2>&1
  if %errorlevel% neq 0 (
    git push -u origin HEAD
  ) else (
    git push
  )
  if %errorlevel% neq 0 (
    echo Git push failed!
    pause
    exit /b %errorlevel%
  )
) else (
  echo.
  echo ===== 6. Git push =====
  echo No origin remote configured. Local commit only.
)

:done
echo.
echo ===== Done =====
if "%HAS_REMOTE%"=="1" (
  echo Site files from _ready are now uploaded to git.
) else (
  echo Site files from _ready are now committed locally.
)
pause
exit /b 0

:require
if not exist "%READY%\%~1" (
  echo ERROR: Missing %READY%\%~1
  pause
  exit /b 1
)
exit /b 0

:requireDir
if not exist "%READY%\%~1\" (
  echo ERROR: Missing folder %READY%\%~1
  pause
  exit /b 1
)
exit /b 0
