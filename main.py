#!/usr/bin/env python3
"""Super Calculator with OCR, fractions, geometry, trigonometry, equations, unit conversion, and combinatorics"""
import re
import math
import sys
from fractions import Fraction
from typing import Optional, Tuple, Union, List

try:
    import cv2
    import numpy as np
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    cv2 = None
    np = None
    pytesseract = None

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
            print(f"Ошибка площади: {e}")
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
            print(f"Ошибка объема: {e}")
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
                        result = parse_and_calculate_expression(arg)
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
            print(f"Ошибка: {e}")
            return None


class EquationSolver:
    @staticmethod
    def solve(expression: str) -> Optional[List[float]]:
        expression = expression.strip().replace(' ', '')
        if expression.endswith('=0'):
            expression = expression[:-2]
        elif expression.endswith('='):
            expression = expression[:-1]
        
        # Пробуем найти x^2
        match = re.search(r'([\-+]?\d*\.?\d*)x\^2([\-+]\d*\.?\d*)x([\-+]?\d*\.?\d*)', expression)
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
        match = re.search(r'([\-+]?\d*\.?\d*)x([\-+]\d*\.?\d*)', expression)
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
            print(f"Ошибка: {e}")
            return None


class ImageCalculator:
    @staticmethod
    def preprocess_image(image_path: str):
        if not OCR_AVAILABLE:
            print("OCR недоступен.")
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
            print("OCR недоступен.")
            return None
        text = ImageCalculator.extract_text(image_path)
        print(f"Извлеченный текст: {text}")
        if not text:
            return None
        return FractionCalculator.evaluate_expression(text)


def parse_geometry_expression(expr: str) -> Tuple[Optional[str], Optional[list]]:
    expr = expr.lower().strip()
    patterns = [
        (r'площадь\s+(круг|circle|окружность)\s+радиус\s+([\d\s/\-]+)', 'круг'),
        (r'площадь\s+(квадрат|square)\s+сторона\s+([\d\s/\-]+)', 'квадрат'),
        (r'площадь\s+(прямоугольник|rectangle)\s+стороны\s+([\d\s/\-]+)\s+и\s+([\d\s/\-]+)', 'прямоугольник'),
        (r'площадь\s+(треугольник|triangle)\s+основание\s+([\d\s/\-]+)\s+и\s+высота\s+([\d\s/\-]+)', 'треугольник'),
        (r'площадь\s+(трапеция|trapezoid)\s+основания\s+([\d\s/\-]+)\s+и\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'трапеция'),
        (r'площадь\s+(ромб|rhombus)\s+диагонали\s+([\d\s/\-]+)\s+и\s+([\d\s/\-]+)', 'ромб'),
        (r'площадь\s+(параллелограмм|parallelogram)\s+основание\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'параллелограмм'),
        (r'объем\s+(куб|cube)\s+ребро\s+([\d\s/\-]+)', 'куб'),
        (r'объем\s+(параллелепипед|parallelepiped|прямоугольник)\s+стороны\s+([\d\s/\-]+)\s*,\s*([\d\s/\-]+)\s*,\s*([\d\s/\-]+)', 'параллелепипед'),
        (r'объем\s+(шар|sphere|сфера)\s+радиус\s+([\d\s/\-]+)', 'шар'),
        (r'объем\s+(цилиндр|cylinder)\s+радиус\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'цилиндр'),
        (r'объем\s+(конус|cone)\s+радиус\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'конус'),
        (r'объем\s+(пирамида|pyramid)\s+площадь\s+основания\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'пирамида'),
    ]
    for pattern, shape in patterns:
        match = re.search(pattern, expr, re.IGNORECASE)
        if match:
            values = [m.strip() for m in match.groups()[1:] if m.strip()]
            parsed = []
            for v in values:
                frac = FractionCalculator.parse_fraction(v)
                parsed.append(frac if frac else float(v))
            return shape, parsed
    return None, None


def parse_and_calculate_expression(expression: str) -> Optional[Fraction]:
    expression = expression.replace(' ', '')
    if not expression:
        return None
    return FractionCalculator.evaluate_expression(expression)


def main():
    print("=" * 60)
    print("СУПЕР КАЛЬКУЛЯТОР")
    print("=" * 60)
    print("\nВыберите режим:")
    print("1. Вычислить выражение (дробные числа)")
    print("2. Вычислить по фото (OCR)")
    print("3. Геометрия (площадь, объем)")
    print("4. Тригонометрия и функции")
    print("5. Решение уравнений")
    print("6. Перевод единиц")
    print("7. Комбинаторика")
    print("8. Выйти")

    while True:
        try:
            choice = input("\nВаш выбор (1-8): ").strip()
            if choice == '1':
                expr = input("Введите выражение: ")
                result = parse_and_calculate_expression(expr)
                if result:
                    print(f"Результат: {result}", f"(≈ {float(result):.6f})" if result.denominator != 1 else "")
                else:
                    print("Ошибка.")
            elif choice == '2':
                if not OCR_AVAILABLE:
                    print("OCR недоступен. Установите opencv-python, pytesseract и Tesseract.")
                    continue
                path = input("Введите путь к изображению: ").strip()
                try:
                    result = ImageCalculator.calculate_from_image(path)
                    if result:
                        print(f"Результат: {result}", f"(≈ {float(result):.6f})" if result.denominator != 1 else "")
                    else:
                        print("Не удалось извлечь выражение.")
                except Exception as e:
                    print(f"Ошибка: {e}")
            elif choice == '3':
                print("\nПримеры: площадь круг радиус 5, объем куб ребро 3")
                expr = input("Введите выражение: ").strip()
                shape, values = parse_geometry_expression(expr)
                if shape and values:
                    func = GeometryCalculator.calculate_area if expr.lower().startswith('площадь') else GeometryCalculator.calculate_volume
                    result = func(shape, *values)
                    if result:
                        print(f"Результат: {result}", f"(≈ {float(result):.6f})" if isinstance(result, Fraction) else "")
                    else:
                        print("Ошибка.")
                else:
                    print("Не распознано.")
            elif choice == '4':
                print("\nФункции: sin, cos, tan, sqrt, log, ln, factorial и др.")
                print("Константы: pi, e")
                expr = input("Введите выражение: ").strip()
                result = AdvancedCalculator.evaluate(expr)
                print(f"Результат: {result:.6f}" if result is not None else "Ошибка.")
            elif choice == '5':
                print("\nПримеры: x^2-4=0, 2x+3=7")
                expr = input("Введите уравнение: ").strip()
                solutions = EquationSolver.solve(expr)
                if solutions is not None:
                    if not solutions:
                        print("Нет решений.")
                    elif solutions == [float('inf')]:
                        print("Бесконечно много решений.")
                    else:
                        print("Решения:", ", ".join(f"x = {s:.6f}" for s in solutions))
                else:
                    print("Ошибка.")
            elif choice == '6':
                print("\nПримеры: 10 м в см, 100 °C в °F")
                expr = input("Введите выражение: ").strip()
                match = re.search(r'([\d\.]+)\s+([а-яa-z°]+)\s+в\s+([а-яa-z°]+)', expr, re.IGNORECASE)
                if match:
                    value, from_u, to_u = float(match.group(1)), match.group(2), match.group(3)
                    result = UnitConverter.convert(value, from_u, to_u)
                    print(f"{value} {from_u} = {result:.6f} {to_u}" if result is not None else "Ошибка.")
                else:
                    print("Неверный формат.")
            elif choice == '7':
                print("\nКоманды: факториал n, перестановки n k, сочетания n k")
                expr = input("Введите команду: ").strip().lower()
                parts = expr.split()
                if parts[0] in ['факториал', 'factorial'] and len(parts) == 2:
                    result = CombinatoricsCalculator.factorial(int(parts[1]))
                    print(f"{parts[1]}! = {result}" if result else "Ошибка.")
                elif parts[0] in ['перестановки', 'permutations'] and len(parts) == 3:
                    result = CombinatoricsCalculator.permutations(int(parts[1]), int(parts[2]))
                    print(f"A({parts[1]},{parts[2]}) = {result}" if result else "Ошибка.")
                elif parts[0] in ['сочетания', 'combinations'] and len(parts) == 3:
                    result = CombinatoricsCalculator.combinations(int(parts[1]), int(parts[2]))
                    print(f"C({parts[1]},{parts[2]}) = {result}" if result else "Ошибка.")
                else:
                    print("Неверная команда.")
            elif choice == '8':
                print("Выход...")
                break
            else:
                print("Неверный выбор.")
        except KeyboardInterrupt:
            print("\nВыход...")
            break
        except Exception as e:
            print(f"Ошибка: {e}")


if __name__ == "__main__":
    main()
