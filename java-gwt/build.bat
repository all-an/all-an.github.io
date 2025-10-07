@echo off
REM Build script for GWT particles project

echo Building Java GWT particles...
cd /d "%~dp0"

REM Clean and compile with Maven
call mvn clean package

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build successful!
    echo Generated JavaScript: ../pkg-gwt/particles/
    echo To test: Open index.html in browser
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Build failed! Check errors above.
    echo ========================================
)

pause
