@echo off
chcp 65001 >nul
echo Сборка EXE файла...
python -m PyInstaller --onefile --windowed --name SuperCalculator --icon=NONE app_gui.py
pause
