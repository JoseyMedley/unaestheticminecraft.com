@echo off

set cwd=%cd%
cd /D "%~dp0"

rem check modules
if not exist "node_modules" call update.bat
if %errorlevel% neq 0 exit /b %errorlevel%

if not exist "bedrock_server\bedrock_server.exe" call update.bat
if %errorlevel% neq 0 exit /b %errorlevel%

rem remove junk
del /f bedrock_server\bdsx_shell_data.ini >nul 2>nul

rem backup map
for /F "tokens=2" %%i in ('date /t') do set mydate=%%i
set foldername = %mydate%-%time%
robocopy .\bedrock_server\worlds\Unaesthetic .\backups\%foldername%\ /e /copyall

rem loop begin
:_loop

rem shellprepare
call npm run -s shellprepare
if %errorlevel% neq 1 goto _end

rem launch
cd bedrock_server
bedrock_server.exe ..
echo exit=%errorlevel% >>bdsx_shell_data.ini
cd ..

rem loop end
goto _loop
:_end

cd /D "%cwd%"
exit /b
