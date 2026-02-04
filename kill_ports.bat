@echo off
echo Killing any processes running on ports 3000 and 5000...

REM Find and kill process on port 3000
for /f "tokens=5" %%t in ('netstat -ano ^| findstr :3000') do (
    if not "%%t"=="" (
        echo Killing process on port 3000 (PID: %%t)
        taskkill /f /pid %%t
    )
)

REM Find and kill process on port 5000
for /f "tokens=5" %%t in ('netstat -ano ^| findstr :5000') do (
    if not "%%t"=="" (
        echo Killing process on port 5000 (PID: %%t)
        taskkill /f /pid %%t
    )
)

REM Also kill any node processes as additional safety
tasklist | findstr node >nul
if %errorlevel%==0 (
    echo Killing all node processes...
    taskkill /f /im node.exe
)

echo.
echo Port cleanup completed!
echo Ports 3000 and 5000 should now be free.