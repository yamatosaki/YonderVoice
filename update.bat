@echo off
setlocal
cd /d "%~dp0"

set "READY=%~dp0_ready"
set "CHECK_ONLY=0"
set "HAS_REMOTE=0"
set "HAS_READY=0"
if /I "%~1"=="--check" set "CHECK_ONLY=1"

echo ===== 1. Check website files =====
if exist "%READY%\" (
  set "HAS_READY=1"
  echo _ready folder found. It will be copied before commit.
  call :requireReady "index.html" || exit /b 1
  call :requireReady "works.html" || exit /b 1
  call :requireReady "release.html" || exit /b 1
  call :requireReady "guidelines.html" || exit /b 1
  call :requireReady "about.html" || exit /b 1
  call :requireReady "css\style.css" || exit /b 1
  call :requireReady "js\main.js" || exit /b 1
  call :requireReady "js\data.js" || exit /b 1
  call :requireReadyDir "images" || exit /b 1
) else (
  echo _ready folder not found. Uploading current folder directly.
  call :requireLocal "index.html" || exit /b 1
  call :requireLocal "works.html" || exit /b 1
  call :requireLocal "release.html" || exit /b 1
  call :requireLocal "guidelines.html" || exit /b 1
  call :requireLocal "about.html" || exit /b 1
  call :requireLocal "css\style.css" || exit /b 1
  call :requireLocal "js\main.js" || exit /b 1
  call :requireLocal "js\data.js" || exit /b 1
  call :requireLocalDir "images" || exit /b 1
)

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

if "%HAS_READY%"=="1" (
  echo.
  echo ===== 3. Copy _ready files to repository =====
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
) else (
  echo.
  echo ===== 3. Use current folder files =====
  echo No copy needed.
)

echo.
echo ===== 4. Git commit =====
git add index.html works.html release.html guidelines.html about.html css js images .gitignore update.bat
git diff --cached --quiet
if %errorlevel% equ 0 (
  echo No changes to commit.
) else (
  git -c user.name="yamatosaki" -c user.email="yamatosaki@users.noreply.github.com" commit -m "Update site files"
  if %errorlevel% neq 0 (
    echo Git commit failed!
    pause
    exit /b %errorlevel%
  )
)

if "%HAS_REMOTE%"=="1" (
  echo.
  echo ===== 5. Git pull =====
  git pull --rebase
  if %errorlevel% neq 0 (
    echo Git pull failed!
    pause
    exit /b %errorlevel%
  )

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
  echo ===== 5. Git push =====
  echo No origin remote configured. Local commit only.
)

echo.
echo ===== Done =====
if "%HAS_REMOTE%"=="1" (
  echo Site files are now uploaded to git.
) else (
  echo Site files are now committed locally.
)
pause
exit /b 0

:requireReady
if not exist "%READY%\%~1" (
  echo ERROR: Missing %READY%\%~1
  pause
  exit /b 1
)
exit /b 0

:requireReadyDir
if not exist "%READY%\%~1\" (
  echo ERROR: Missing folder %READY%\%~1
  pause
  exit /b 1
)
exit /b 0

:requireLocal
if not exist "%~1" (
  echo ERROR: Missing %~1
  pause
  exit /b 1
)
exit /b 0

:requireLocalDir
if not exist "%~1\" (
  echo ERROR: Missing folder %~1
  pause
  exit /b 1
)
exit /b 0
