@echo off
title Tuxemon 3D server - close this window to stop the game server
cd /d "%~dp0"
where py >nul 2>nul && (py -3 serve.py 8765 --open & goto :eof)
"%LOCALAPPDATA%\Programs\Python\Python312\python.exe" serve.py 8765 --open
