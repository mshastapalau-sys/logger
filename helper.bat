@echo off
rem Eco-Lesorub helper: opens start-game.html in an app window (no address bar).
setlocal
set "URL=file:///%~dp0start-game.html"
set "URL=%URL:\=/%"

set "BROWSER="
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

if defined BROWSER (
  start "" "%BROWSER%" --app="%URL%"
) else (
  start "" "%~dp0start-game.html"
)

powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%~dp0Eco-Lesorub.lnk');$s.TargetPath='%ComSpec%';$s.Arguments='/c helper.bat';$s.IconLocation='%~dp0icon.ico';$s.Description='Eco-Lesorub';$s.WindowStyle=7;$s.Save()" >nul 2>nul
