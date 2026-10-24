@REM ----------------------------------------------------------------------------
@REM Maven Wrapper script for DocuRisk AI Backend
@REM ----------------------------------------------------------------------------
@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL EnableDelayedExpansion EnableExtensions

set MAVEN_CMD=%USERPROFILE%\.m2\apache-maven-3.9.6\bin\mvn.cmd

if exist "%MAVEN_CMD%" (
    call "%MAVEN_CMD%" %*
    exit /b %ERRORLEVEL%
)

where mvn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    mvn %*
    exit /b %ERRORLEVEL%
)

echo [ERROR] Maven not found at %MAVEN_CMD% and not in PATH. >&2
exit /b 1
