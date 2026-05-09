@echo off
cd /d "c:\Users\User\Desktop\AAAplikacje\TOOL only"

echo Zatrzymuję poprzedni serwer (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Uruchamiam serwer...
start "Next.js Dev Server" cmd /k "cd /d "c:\Users\User\Desktop\AAAplikacje\TOOL only" && npm run dev"

echo Czekam na uruchomienie serwera...
timeout /t 6 /nobreak >nul

echo Otwieram przeglądarkę...
start "" http://localhost:3000
