@echo off
echo ===============================================================
echo  Starting TollTrack System (React Frontend + Python AI Backend)
echo ===============================================================
cd /d "%~dp0"
echo [1/2] Launching Python Flask AI Backend on http://127.0.0.1:5000...
start "TollTrack AI Backend" cmd /c "python backend/app.py"

echo [2/2] Launching React Vite Frontend on http://localhost:5173...
start "TollTrack Frontend" cmd /c "npm run dev"

echo.
echo Both servers have been launched in separate terminal windows!
echo Open http://localhost:5173 in your browser to start.
echo.
pause

