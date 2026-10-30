#!/usr/bin/env python3
"""
GUI версия СУПЕР КАЛЬКУЛЯТОРА
Создано с PyQt5
"""

import sys
import re
import math
from fractions import Fraction
from typing import Optional, Tuple, Union, List
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                            QTabWidget, QTextEdit, QLineEdit, QPushButton, QLabel,
                            QComboBox, QGroupBox, QFormLayout, QMessageBox)
from PyQt5.QtCore import Qt

# Пытаемся импортировать OpenCV и Tesseract (для OCR)
try:
    import cv2
    import numpy as np
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

PI = math.pi
E = math.e


class GeometryCalculator:
    @staticmethod
    def calculate_area(shape: str, *args) -> Optional[Union[Fraction, float]]:
        try:
            shape = shape.lower().strip()
            all_fractions = all(isinstance(x, Fraction) for x in args)
            if shape in ['круг', 'circle', 'окружность']:
                if len(args) == 1:
                    return float(args[0]) ** 2 * math.pi
            elif shape in ['квадрат', 'square']:
                if len(args) == 1:
                    a = args[0]
                    return Fraction(a.numerator ** 2, a.denominator ** 2) if all_fractions else float(a) ** 2
            elif shape in ['прямоугольник', 'rectangle']:
                if len(args) == 2:
                    a, b = args
                    return Fraction(a.numerator * b.numerator, a.denominator * b.denominator) if all_fractions else float(a) * float(b)
            elif shape in ['треугольник', 'triangle']:
                if len(args) == 2:
                    a, b = args
                    return Fraction(a.numerator * b.numerator, a.denominator * b.denominator * 2) if all_fractions else (float(a) * float(b)) / 2
                elif len(args) == 3:
                    a, b, c = [float(x) for x in args]
                    s = (a + b + c) / 2
                    return math.sqrt(s * (s - a) * (s - b) * (s - c))
            elif shape in ['трапеция', 'trapezoid']:
                if len(args) == 3:
                    a, b, h = args
                    if all_fractions:
                        num = a.numerator * h.numerator + b.numerator * h.numerator
                        den = a.denominator * b.denominator * h.denominator * 2
                        return Fraction(num, den)
                    return ((float(a) + float(b)) / 2) * float(h)
            elif shape in ['ромб', 'rhombus']:
                if len(args) == 2:
                    d1, d2 = args
                    return Fraction(d1.numerator * d2.numerator, d1.denominator * d2.denominator * 2) if all_fractions else (float(d1) * float(d2)) / 2
            elif shape in ['параллелограмм', 'parallelogram']:
                if len(args) == 2:
                    a, h = args
                    return Fraction(a.numerator * h.numerator, a.denominator * h.denominator) if all_fractions else float(a) * float(h)
            return None
        except Exception as e:
            return None

    @staticmethod
    def calculate_volume(shape: str, *args) -> Optional[Union[Fraction, float]]:
        try:
            shape = shape.lower().strip()
            all_fractions = all(isinstance(x, Fraction) for x in args)
            if shape in ['куб', 'cube']:
                if len(args) == 1:
                    a = args[0]
                    return Fraction(a.numerator ** 3, a.denominator ** 3) if all_fractions else float(a) ** 3
            elif shape in ['параллелепипед', 'parallelepiped', 'прямоугольник', 'rectangular prism']:
                if len(args) == 3:
                    a, b, c = args
                    if all_fractions:
                        return Fraction(a.numerator * b.numerator * c.numerator, a.denominator * b.denominator * c.denominator)
                    return float(a) * float(b) * float(c)
            elif shape in ['шар', 'sphere', 'сфера']:
                if len(args) == 1:
                    return (4/3) * math.pi * float(args[0]) ** 3
            elif shape in ['цилиндр', 'cylinder']:
                if len(args) == 2:
                    return math.pi * float(args[0]) ** 2 * float(args[1])
            elif shape in ['конус', 'cone']:
                if len(args) == 2:
                    return (1/3) * math.pi * float(args[0]) ** 2 * float(args[1])
            elif shape in ['пирамида', 'pyramid']:
                if len(args) == 2:
                    ba, h = args
                    return Fraction(ba.numerator * h.numerator, 3 * ba.denominator * h.denominator) if all_fractions else (float(ba) * float(h)) / 3
            return None
        except Exception as e:
            return None


class AdvancedCalculator:
    FUNCTION_MAP = {
        'sin': math.sin, 'sind': lambda x: math.sin(math.radians(x)),
        'cos': math.cos, 'cosd': lambda x: math.cos(math.radians(x)),
        'tan': math.tan, 'tand': lambda x: math.tan(math.radians(x)),
        'cot': lambda x: 1/math.tan(x) if math.tan(x) != 0 else float('inf'),
        'cotd': lambda x: 1/math.tan(math.radians(x)) if math.tan(math.radians(x)) != 0 else float('inf'),
        'asin': math.asin, 'acos': math.acos, 'atan': math.atan,
        'asind': lambda x: math.degrees(math.asin(x)), 'acosd': lambda x: math.degrees(math.acos(x)),
        'atand': lambda x: math.degrees(math.atan(x)),
        'log': math.log10, 'ln': math.log, 'lg': math.log10,
        'sqrt': math.sqrt, 'cbrt': lambda x: x ** (1/3), 'sqr': lambda x: x ** 2,
        'abs': abs, 'floor': math.floor, 'ceil': math.ceil, 'round': round,
    }
    CONSTANTS = {'pi': PI, 'π': PI, 'e': E, 'phi': (1 + math.sqrt(5)) / 2}

    @staticmethod
    def evaluate(expression: str) -> Optional[float]:
        expression = expression.strip().replace(' ', '')
        while True:
            match = re.search(r'([a-zа-я]+)\(([^)]+)\)', expression)
            if not match:
                break
            func_name = match.group(1).lower()
            args_str = match.group(2)
            args = [a.strip() for a in args_str.split(',')]
            arg_values = []
            for arg in args:
                if arg.lower() in ['pi', 'π', 'e']:
                    arg_values.append(AdvancedCalculator.CONSTANTS.get(arg.lower(), 0))
                    continue
                frac = FractionCalculator.parse_fraction(arg)
                if frac:
                    arg_values.append(float(frac))
                else:
                    try:
                        arg_values.append(float(arg))
                    except:
                        result = FractionCalculator.evaluate_expression(arg)
                        arg_values.append(float(result) if result else 0)
            if func_name in ['log', 'lg'] and len(arg_values) == 2:
                result = math.log(arg_values[0], arg_values[1])
            elif func_name in AdvancedCalculator.FUNCTION_MAP and len(arg_values) == 1:
                result = AdvancedCalculator.FUNCTION_MAP[func_name](arg_values[0])
            elif func_name in ['factorial', 'факториал'] and len(arg_values) == 1:
                result = CombinatoricsCalculator.factorial(int(arg_values[0]))
            else:
                return None
            if result is None:
                return None
            expression = expression[:match.start()] + str(result) + expression[match.end():]
        try:
            for const, val in AdvancedCalculator.CONSTANTS.items():
                expression = expression.replace(const, str(val))
            return float(eval(expression))
        except Exception as e:
            return None


class EquationSolver:
    @staticmethod
    def solve(expression: str) -> Optional[List[float]]:
        expression = expression.strip().replace(' ', '')
        if expression.endswith('=0'):
            expression = expression[:-2]
        elif expression.endswith('='):
            expression = expression[:-1]
        
        match = re.search(r'([\-+]?\d*\.?\d*)x\^2([\-+]?\d*\.?\d*)x([\-+]?\d*\.?\d*)', expression)
        if match:
            a_str, b_str, c_str = match.groups()
            try:
                a = float(a_str) if a_str and a_str not in ['+', '-'] else (1 if a_str == '+' else -1 if a_str == '-' else 1)
                b = float(b_str) if b_str else 0
                c = float(c_str) if c_str else 0
                if a == 0:
                    return EquationSolver.solve_linear(b, c)
                discriminant = b**2 - 4*a*c
                if discriminant < 0:
                    return []
                elif discriminant == 0:
                    return [-b / (2*a)]
                else:
                    sqrt_d = math.sqrt(discriminant)
                    return [(-b + sqrt_d) / (2*a), (-b - sqrt_d) / (2*a)]
            except:
                pass
        match = re.search(r'([\-+]?\d*\.?\d*)x([\-+]?\d*\.?\d*)', expression)
        if match:
            a_str, b_str = match.groups()
            try:
                a = float(a_str) if a_str and a_str not in ['+', '-'] else (1 if a_str == '+' else -1 if a_str == '-' else 1)
                b = float(b_str) if b_str else 0
                return EquationSolver.solve_linear(a, b)
            except:
                pass
        return None

    @staticmethod
    def solve_linear(a: float, b: float) -> List[float]:
        if a == 0:
            return [float('inf')] if b == 0 else []
        return [-b / a]


class UnitConverter:
    UNITS = {
        'м': 1.0, 'm': 1.0, 'см': 0.01, 'cm': 0.01, 'мм': 0.001, 'mm': 0.001,
        'км': 1000.0, 'km': 1000.0, 'дм': 0.1, 'dm': 0.1,
        'кг': 1.0, 'kg': 1.0, 'г': 0.001, 'g': 0.001, 'мг': 0.000001, 'mg': 0.000001,
        'т': 1000.0, 'ton': 1000.0, 'фунт': 0.453592, 'lb': 0.453592,
        'с': 1.0, 'мин': 60.0, 'ч': 3600.0, 'д': 86400.0, 'нед': 604800.0,
        'л': 0.001, 'мл': 0.000001, 'м³': 1.0, 'см³': 0.000001, 'км²': 1000000.0,
        'м²': 1.0, 'га': 10000.0, 'м/с': 1.0, 'км/ч': 0.277778, 'Па': 1.0, 'атм': 101325.0,
    }

    @staticmethod
    def convert(value: float, from_unit: str, to_unit: str) -> Optional[float]:
        from_unit = from_unit.lower().strip()
        to_unit = to_unit.lower().strip()
        if from_unit in ['°c', '°f', 'k'] or to_unit in ['°c', '°f', 'k']:
            from_type = 'c' if from_unit in ['°c', 'цел'] else 'f' if from_unit in ['°f', 'фар'] else 'k'
            to_type = 'c' if to_unit in ['°c', 'цел'] else 'f' if to_unit in ['°f', 'фар'] else 'k'
            if from_type == to_type:
                return value
            kelvin = value + 273.15 if from_type == 'c' else (value - 32) * 5/9 + 273.15 if from_type == 'f' else value
            if to_type == 'c':
                return kelvin - 273.15
            elif to_type == 'f':
                return (kelvin - 273.15) * 9/5 + 32
            return kelvin
        if from_unit in UnitConverter.UNITS and to_unit in UnitConverter.UNITS:
            return value * UnitConverter.UNITS[from_unit] / UnitConverter.UNITS[to_unit]
        return None


class CombinatoricsCalculator:
    @staticmethod
    def factorial(n: int) -> Optional[int]:
        try:
            if n < 0:
                return None
            result = 1
            for i in range(1, int(n) + 1):
                result *= i
            return result
        except:
            return None

    @staticmethod
    def permutations(n: int, k: int) -> Optional[int]:
        try:
            if k > n or k < 0:
                return None
            result = 1
            for i in range(n - k + 1, n + 1):
                result *= i
            return result
        except:
            return None

    @staticmethod
    def combinations(n: int, k: int) -> Optional[int]:
        try:
            if k > n or k < 0:
                return None
            if k > n - k:
                k = n - k
            result = 1
            for i in range(1, k + 1):
                result = result * (n - k + i) // i
            return result
        except:
            return None


class FractionCalculator:
    @staticmethod
    def parse_fraction(text: str) -> Optional[Fraction]:
        text = text.strip().replace(' ', '')
        if '/' in text:
            try:
                num, den = text.split('/', 1)
                return Fraction(int(num) if num else 0, int(den) if den else 1)
            except:
                return None
        try:
            return Fraction(int(text))
        except:
            return None

    @staticmethod
    def tokenize(expression: str) -> list:
        expression = expression.replace(' ', '')
        tokens = re.findall(r'(\d+/\d+|\d+|\+|\-|\*|/|\(|\)|\^)', expression)
        processed = []
        for i, token in enumerate(tokens):
            if token == '-' and (i == 0 or tokens[i-1] in '+-*/^('):
                if i + 1 < len(tokens) and re.match(r'\d+', tokens[i+1]):
                    processed.append('-' + tokens[i+1])
                    tokens[i+1] = ''
                elif i + 1 < len(tokens) and re.match(r'\d+/\d+', tokens[i+1]):
                    processed.append('-' + tokens[i+1])
                    tokens[i+1] = ''
                else:
                    processed.append(token)
            elif token:
                processed.append(token)
        return processed

    @staticmethod
    def parse_tokens(tokens: list) -> Optional[Fraction]:
        parsed = []
        for token in tokens:
            if token in '+-*/()^':
                parsed.append(token)
            else:
                frac = FractionCalculator.parse_fraction(token)
                if frac:
                    parsed.append(frac)
                else:
                    return None
        return FractionCalculator._evaluate_parsed(parsed)

    @staticmethod
    def _evaluate_parsed(parsed: list) -> Optional[Fraction]:
        return FractionCalculator._evaluate_parentheses(parsed)

    @staticmethod
    def _evaluate_parentheses(parsed: list) -> Optional[Fraction]:
        stack = []
        for i, token in enumerate(parsed):
            if token == '(':
                stack.append(i)
            elif token == ')':
                if stack:
                    start = stack.pop()
                    inner = FractionCalculator._evaluate_expression(parsed[start+1:i])
                    if inner is None:
                        return None
                    new_parsed = parsed[:start] + [inner] + parsed[i+1:]
                    return FractionCalculator._evaluate_parentheses(new_parsed)
        return FractionCalculator._evaluate_expression(parsed)

    @staticmethod
    def _evaluate_expression(parsed: list) -> Optional[Fraction]:
        return FractionCalculator._evaluate_power(parsed)

    @staticmethod
    def _evaluate_power(parsed: list) -> Optional[Fraction]:
        if not parsed or not isinstance(parsed[0], Fraction):
            return None
        result = parsed[0]
        i = 1
        while i < len(parsed):
            if i >= len(parsed):
                break
            if parsed[i] == '^':
                if i + 1 >= len(parsed) or not isinstance(parsed[i+1], Fraction):
                    return None
                result = Fraction(int(result ** (parsed[i+1].numerator / parsed[i+1].denominator)))
                i += 2
            else:
                break
        remaining = parsed[i:]
        return FractionCalculator._evaluate_mult_div([result] + remaining)

    @staticmethod
    def _evaluate_mult_div(parsed: list) -> Optional[Fraction]:
        if not parsed or not isinstance(parsed[0], Fraction):
            return None
        result = parsed[0]
        i = 1
        while i < len(parsed):
            if i >= len(parsed):
                break
            op = parsed[i]
            if op in '*/':
                if i + 1 >= len(parsed) or not isinstance(parsed[i+1], Fraction):
                    return None
                if op == '*':
                    result *= parsed[i+1]
                else:
                    result /= parsed[i+1]
                i += 2
            else:
                break
        remaining = parsed[i:]
        for j in range(0, len(remaining), 2):
            if j + 1 >= len(remaining):
                break
            op = remaining[j]
            val = remaining[j+1]
            if not isinstance(val, Fraction):
                return None
            if op == '+':
                result += val
            elif op == '-':
                result -= val
        return result

    @staticmethod
    def evaluate_expression(expression: str) -> Optional[Fraction]:
        try:
            tokens = FractionCalculator.tokenize(expression)
            if not tokens:
                return None
            return FractionCalculator.parse_tokens(tokens)
        except Exception as e:
            return None


class ImageCalculator:
    @staticmethod
    def preprocess_image(image_path: str):
        if not OCR_AVAILABLE:
            return None
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Не удалось загрузить изображение: {image_path}")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
        kernel = np.ones((2, 2), np.uint8)
        return cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    @staticmethod
    def extract_text(image_path: str) -> str:
        if not OCR_AVAILABLE:
            return ""
        try:
            processed = ImageCalculator.preprocess_image(image_path)
            if processed is None:
                return ""
            text = pytesseract.image_to_string(processed, config=r'--oem 3 --psm 6 outputbase digits')
            return re.sub(r'\s+', ' ', text.strip())
        except:
            return ""

    @staticmethod
    def calculate_from_image(image_path: str) -> Optional[Fraction]:
        if not OCR_AVAILABLE:
            return None
        text = ImageCalculator.extract_text(image_path)
        if not text:
            return None
        return FractionCalculator.evaluate_expression(text)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("СУПЕР КАЛЬКУЛЯТОР")
        self.setGeometry(100, 100, 800, 600)
        
        # Создаем центральный виджет и layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        
        # Создаем вкладки
        self.tabs = QTabWidget()
        main_layout.addWidget(self.tabs)
        
        # Вкладка 1: Дробные выражения
        self.create_fractions_tab()
        
        # Вкладка 2: Геометрия
        self.create_geometry_tab()
        
        # Вкладка 3: Тригонометрия
        self.create_trigonometry_tab()
        
        # Вкладка 4: Уравнения
        self.create_equations_tab()
        
        # Вкладка 5: Единицы
        self.create_units_tab()
        
        # Вкладка 6: Комбинаторика
        self.create_combinatorics_tab()
        
        # Вкладка 7: OCR
        self.create_ocr_tab()
        
        # Статус-бар
        self.status_bar = QLabel("Готово")
        main_layout.addWidget(self.status_bar)
    
    def create_fractions_tab(self):
        """Вкладка для дробных выражений"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # Поле ввода
        self.fraction_input = QLineEdit()
        self.fraction_input.setPlaceholderText("Введите выражение, например: 1/2 + 3/4")
        layout.addWidget(QLabel("Выражение:"))
        layout.addWidget(self.fraction_input)
        
        # Кнопка вычисления
        calc_btn = QPushButton("Вычислить")
        calc_btn.clicked.connect(self.calculate_fraction)
        layout.addWidget(calc_btn)
        
        # Поле результата
        self.fraction_result = QTextEdit()
        self.fraction_result.setReadOnly(True)
        layout.addWidget(self.fraction_result)
        
        # Примеры
        examples = QGroupBox("Примеры:")
        examples_layout = QVBoxLayout()
        for expr in ["1/2 + 3/4", "5/6 - 1/3", "2*(3+1/2)", "(1/2+3/4)*2"]:
            btn = QPushButton(expr)
            btn.clicked.connect(lambda _, e=expr: self.fraction_input.setText(e))
            examples_layout.addWidget(btn)
        examples.setLayout(examples_layout)
        layout.addWidget(examples)
        
        self.tabs.addTab(tab, "🔢 Дробные выражения")
    
    def create_geometry_tab(self):
        """Вкладка для геометрии"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # Выбор типа
        self.geometry_type = QComboBox()
        self.geometry_type.addItems(["Площадь", "Объем"])
        layout.addWidget(QLabel("Тип:"))
        layout.addWidget(self.geometry_type)
        
        # Выбор фигуры
        self.geometry_shape = QComboBox()
        self.geometry_shape.addItems(["Круг", "Квадрат", "Прямоугольник", "Треугольник", 
                                       "Трапеция", "Ромб", "Параллелограмм"])
        self.geometry_type.currentTextChanged.connect(self.update_geometry_shapes)
        layout.addWidget(QLabel("Фигура:"))
        layout.addWidget(self.geometry_shape)
        
        # Поле параметров
        self.geometry_params = QLineEdit()
        self.geometry_params.setPlaceholderText("Введите параметры через запятую")
        layout.addWidget(QLabel("Параметры:"))
        layout.addWidget(self.geometry_params)
        
        # Кнопка вычисления
        calc_btn = QPushButton("Вычислить")
        calc_btn.clicked.connect(self.calculate_geometry)
        layout.addWidget(calc_btn)
        
        # Результат
        self.geometry_result = QTextEdit()
        self.geometry_result.setReadOnly(True)
        layout.addWidget(self.geometry_result)
        
        self.tabs.addTab(tab, "📐 Геометрия")
    
    def update_geometry_shapes(self, text):
        """Обновляет список фигур в зависимости от типа"""
        if text == "Площадь":
            self.geometry_shape.clear()
            self.geometry_shape.addItems(["Круг", "Квадрат", "Прямоугольник", "Треугольник", 
                                           "Трапеция", "Ромб", "Параллелограмм"])
        else:  # Объем
            self.geometry_shape.clear()
            self.geometry_shape.addItems(["Куб", "Параллелепипед", "Шар", "Цилиндр", 
                                           "Конус", "Пирамида"])
    
    def create_trigonometry_tab(self):
        """Вкладка для тригонометрии"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        self.trig_input = QLineEdit()
        self.trig_input.setPlaceholderText("Введите выражение, например: sin(pi/2), sqrt(16)")
        layout.addWidget(QLabel("Выражение:"))
        layout.addWidget(self.trig_input)
        
        calc_btn = QPushButton("Вычислить")
        calc_btn.clicked.connect(self.calculate_trigonometry)
        layout.addWidget(calc_btn)
        
        self.trig_result = QTextEdit()
        self.trig_result.setReadOnly(True)
        layout.addWidget(self.trig_result)
        
        # Примеры
        examples = QGroupBox("Функции:")
        examples_layout = QVBoxLayout()
        funcs = ["sin(x), cos(x), tan(x)", "sind(x), cosd(x), tand(x) - градусы", 
                 "sqrt(x), cbrt(x)", "log(x, base), ln(x)", "factorial(x)"]
        for f in funcs:
            examples_layout.addWidget(QLabel(f))
        examples.setLayout(examples_layout)
        layout.addWidget(examples)
        
        self.tabs.addTab(tab, "🔺 Тригонометрия")
    
    def create_equations_tab(self):
        """Вкладка для уравнений"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        self.equation_input = QLineEdit()
        self.equation_input.setPlaceholderText("Введите уравнение, например: x^2 - 4 = 0")
        layout.addWidget(QLabel("Уравнение:"))
        layout.addWidget(self.equation_input)
        
        calc_btn = QPushButton("Решить")
        calc_btn.clicked.connect(self.solve_equation)
        layout.addWidget(calc_btn)
        
        self.equation_result = QTextEdit()
        self.equation_result.setReadOnly(True)
        layout.addWidget(self.equation_result)
        
        info = QLabel("Поддерживаются линейные и квадратные уравнения")
        layout.addWidget(info)
        
        self.tabs.addTab(tab, "🔢 Уравнения")
    
    def create_units_tab(self):
        """Вкладка для перевода единиц"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        form = QFormLayout()
        
        self.unit_value = QLineEdit()
        self.unit_value.setPlaceholderText("Значение")
        form.addRow("Значение:", self.unit_value)
        
        self.unit_from = QComboBox()
        self.unit_from.setEditable(True)
        self.unit_from.addItems(["м", "см", "км", "кг", "г", "с", "мин", "ч", "°C", "°F", "л", "мл"])
        form.addRow("Из:", self.unit_from)
        
        self.unit_to = QComboBox()
        self.unit_to.setEditable(True)
        self.unit_to.addItems(["м", "см", "км", "кг", "г", "с", "мин", "ч", "°C", "°F", "л", "мл"])
        form.addRow("В:", self.unit_to)
        
        layout.addLayout(form)
        
        calc_btn = QPushButton("Конвертировать")
        calc_btn.clicked.connect(self.convert_units)
        layout.addWidget(calc_btn)
        
        self.unit_result = QTextEdit()
        self.unit_result.setReadOnly(True)
        layout.addWidget(self.unit_result)
        
        self.tabs.addTab(tab, "⚖️ Единицы измерения")
    
    def create_combinatorics_tab(self):
        """Вкладка для комбинаторики"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        self.comb_type = QComboBox()
        self.comb_type.addItems(["Факториал", "Перестановки", "Сочетания"])
        layout.addWidget(QLabel("Тип:"))
        layout.addWidget(self.comb_type)
        
        self.comb_n = QLineEdit()
        self.comb_n.setPlaceholderText("n")
        layout.addWidget(QLabel("n:"))
        layout.addWidget(self.comb_n)
        
        self.comb_k = QLineEdit()
        self.comb_k.setPlaceholderText("k (для перестановок и сочетаний)")
        layout.addWidget(QLabel("k:"))
        layout.addWidget(self.comb_k)
        
        calc_btn = QPushButton("Вычислить")
        calc_btn.clicked.connect(self.calculate_combinatorics)
        layout.addWidget(calc_btn)
        
        self.comb_result = QTextEdit()
        self.comb_result.setReadOnly(True)
        layout.addWidget(self.comb_result)
        
        self.tabs.addTab(tab, "🎲 Комбинаторика")
    
    def create_ocr_tab(self):
        """Вкладка для OCR"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        if not OCR_AVAILABLE:
            layout.addWidget(QLabel("OCR недоступен. Установите opencv-python, pytesseract и Tesseract OCR."))
        else:
            self.ocr_path = QLineEdit()
            self.ocr_path.setPlaceholderText("Путь к изображению")
            layout.addWidget(QLabel("Путь к изображению:"))
            layout.addWidget(self.ocr_path)
            
            calc_btn = QPushButton("Распознать и вычислить")
            calc_btn.clicked.connect(self.calculate_ocr)
            layout.addWidget(calc_btn)
            
            self.ocr_result = QTextEdit()
            self.ocr_result.setReadOnly(True)
            layout.addWidget(self.ocr_result)
        
        self.tabs.addTab(tab, "📸 OCR (по фото)")
    
    # Методы вычислений
    def calculate_fraction(self):
        """Вычисляет дробное выражение"""
        expr = self.fraction_input.text()
        result = FractionCalculator.evaluate_expression(expr)
        if result:
            msg = f"Результат: {result}"
            if result.denominator != 1:
                msg += f"\nДесятичное значение: {float(result):.6f}"
            self.fraction_result.setText(msg)
            self.status_bar.setText("Готово")
        else:
            self.fraction_result.setText("Ошибка: неверное выражение")
            self.status_bar.setText("Ошибка")
    
    def calculate_geometry(self):
        """Вычисляет геометрическое выражение"""
        shape = self.geometry_shape.currentText().lower()
        params_str = self.geometry_params.text()
        
        try:
            params = [float(p.strip()) for p in params_str.split(',')]
        except:
            self.geometry_result.setText("Ошибка: неверные параметры")
            return
        
        if self.geometry_type.currentText() == "Площадь":
            result = GeometryCalculator.calculate_area(shape, *params)
        else:
            result = GeometryCalculator.calculate_volume(shape, *params)
        
        if result is not None:
            if isinstance(result, Fraction):
                msg = f"Результат: {result}\nДесятичное: {float(result):.6f}"
            else:
                msg = f"Результат: {result:.6f}"
            self.geometry_result.setText(msg)
        else:
            self.geometry_result.setText("Ошибка: неверные параметры")
    
    def calculate_trigonometry(self):
        """Вычисляет тригонометрическое выражение"""
        expr = self.trig_input.text()
        result = AdvancedCalculator.evaluate(expr)
        if result is not None:
            self.trig_result.setText(f"Результат: {result:.6f}")
        else:
            self.trig_result.setText("Ошибка: неверное выражение")
    
    def solve_equation(self):
        """Решает уравнение"""
        expr = self.equation_input.text()
        solutions = EquationSolver.solve(expr)
        if solutions is not None:
            if not solutions:
                self.equation_result.setText("Нет действительных решений")
            elif solutions == [float('inf')]:
                self.equation_result.setText("Бесконечно много решений")
            else:
                self.equation_result.setText("Решения:\n" + "\n".join(f"x = {s:.6f}" for s in solutions))
        else:
            self.equation_result.setText("Ошибка: неверное уравнение")
    
    def convert_units(self):
        """Конвертирует единицы"""
        try:
            value = float(self.unit_value.text())
            from_unit = self.unit_from.currentText()
            to_unit = self.unit_to.currentText()
            
            result = UnitConverter.convert(value, from_unit, to_unit)
            if result is not None:
                self.unit_result.setText(f"{value} {from_unit} = {result:.6f} {to_unit}")
            else:
                self.unit_result.setText("Ошибка: неверные единицы")
        except:
            self.unit_result.setText("Ошибка: неверное значение")
    
    def calculate_combinatorics(self):
        """Вычисляет комбинаторику"""
        try:
            n = int(self.comb_n.text())
            k = int(self.comb_k.text()) if self.comb_k.text() else 0
            
            comb_type = self.comb_type.currentText()
            if comb_type == "Факториал":
                result = CombinatoricsCalculator.factorial(n)
                self.comb_result.setText(f"{n}! = {result}")
            elif comb_type == "Перестановки":
                result = CombinatoricsCalculator.permutations(n, k)
                self.comb_result.setText(f"A({n},{k}) = {result}")
            elif comb_type == "Сочетания":
                result = CombinatoricsCalculator.combinations(n, k)
                self.comb_result.setText(f"C({n},{k}) = {result}")
        except Exception as e:
            self.comb_result.setText(f"Ошибка: {str(e)}")
    
    def calculate_ocr(self):
        """Распознает и вычисляет по фото"""
        if not OCR_AVAILABLE:
            self.ocr_result.setText("OCR недоступен")
            return
        
        path = self.ocr_path.text()
        try:
            result = ImageCalculator.calculate_from_image(path)
            if result:
                msg = f"Результат: {result}"
                if result.denominator != 1:
                    msg += f"\nДесятичное значение: {float(result):.6f}"
                self.ocr_result.setText(msg)
            else:
                self.ocr_result.setText("Не удалось распознать выражение")
        except Exception as e:
            self.ocr_result.setText(f"Ошибка: {str(e)}")


def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
