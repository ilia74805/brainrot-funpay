# 🚀 СУПЕР КАЛЬКУЛЯТОР

**Многофункциональный калькулятор** с поддержкой:
- ✅ Дробных выражений
- ✅ Геометрических вычислений (площадь, объем)
- ✅ Тригонометрии и трансцендентных функций
- ✅ Решения уравнений
- ✅ Перевода единиц измерения
- ✅ Комбинаторики
- ✅ OCR (распознавание по фото)

## 📦 Установка

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Для OCR (опционально)

Установите Tesseract OCR:

**Ubuntu/Debian:**
```bash
sudo apt install tesseract-ocr libtesseract-dev
```

**macOS:**
```bash
brew install tesseract
```

**Windows:** Скачайте с [tesseract-ocr.github.io](https://github.com/UB-Mannheim/tesseract/wiki)

## 🚀 Использование

### Консольная версия

```bash
python main.py
```

### GUI версия (PyQt5)

```bash
python app_gui.py
```

## 📱 Chrome Extension

Расширение для Chrome находится в папке `chrome_extension/`

### Как установить:

1. Откройте Chrome
2. Перейдите на `chrome://extensions/`
3. Включите **Режим разработчика** (в правом верхнем углу)
4. Нажмите **Загрузить распакованное расширение**
5. Выберите папку `chrome_extension/`

### Возможности расширения:

- 🔢 Дробные выражения
- 📐 Геометрия
- 🔺 Тригонометрия и функции
- 🔢 Решение уравнений
- ⚖️ Перевод единиц
- 🎲 Комбинаторика

## 🎯 Сборка EXE файла

### Windows

```bash
python build_exe.bat
```

Или вручную:
```bash
pyinstaller --onefile --windowed --name SuperCalculator app_gui.py
```

### Linux/macOS

```bash
chmod +x build_exe.sh
./build_exe.sh
```

EXE файл будет в папке `dist/SuperCalculator`

## 📚 Примеры

### Дробные выражения
```
1/2 + 3/4 = 5/4
2*(3+1/2) = 7
(1/2+3/4)*2 = 5/2
```

### Геометрия
```
площадь круг радиус 5 → 78.54
площадь квадрат сторона 4 → 16
объем куб ребро 3 → 27
объем шар радиус 5 → 523.60
```

### Тригонометрия
```
sin(pi/2) = 1.0
sind(90) = 1.0 (градусы)
sqrt(16) = 4.0
log(100, 10) = 2.0
factorial(5) = 120
```

### Уравнения
```
x^2 - 4 = 0 → x = 2.0, x = -2.0
2x + 3 = 7 → x = 2.0
```

### Единицы измерения
```
10 м в см = 1000 см
5 кг в г = 5000 г
100 °C в °F = 212 °F
```

### Комбинаторика
```
факториал 5 = 120
сочетания 5 3 = 10
перестановки 5 3 = 60
```

## 📁 Структура проекта

```
brainrot-funpay/
├── main.py              # Консольная версия
├── app_gui.py           # GUI версия (PyQt5)
├── requirements.txt     # Зависимости
├── build_exe.bat        # Скрипт сборки EXE (Windows)
├── build_exe.sh         # Скрипт сборки EXE (Linux/macOS)
├── README.md            # Документация
└── chrome_extension/    # Расширение для Chrome
    ├── manifest.json    # Манифест расширения
    ├── popup.html       # HTML интерфейс
    └── calculator.js    # Логика калькулятора
```

## 🔧 Технологии

- Python 3.x
- PyQt5 (для GUI)
- OpenCV + Tesseract (для OCR)
- PyInstaller (для сборки EXE)
- JavaScript (для Chrome Extension)

## 📜 Лицензия

MIT License

---

**Создано с любовью!** 💚
