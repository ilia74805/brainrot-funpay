#!/bin/bash
echo "Сборка EXE файла..."
python3 -m PyInstaller --onefile --windowed --name SuperCalculator app_gui.py
echo "Готово! EXE файл в папке dist/"
