#!/usr/bin/env python3
"""
Калькулятор с поддержкой:
- Вычислений по фото (OCR)
- Работы с дробями
- Базовых арифметических операций
- Геометрических вычислений (площадь, объем)
"""

import re
import math
import sys
from fractions import Fraction
from typing import Optional, Tuple, Union

# Пытаемся импортировать OpenCV и Tesseract (для OCR)
try:
    import cv2
    import numpy as np
    import pytesseract
    OCR_AVAILABLE = True
except ImportError as e:
    OCR_AVAILABLE = False
    cv2 = None
    np = None
    pytesseract = None


class GeometryCalculator:
    """Калькулятор для геометрических вычислений"""
    
    @staticmethod
    def calculate_area(shape: str, *args) -> Optional[Union[Fraction, float]]:
        """Вычисляет площадь геометрической фигуры"""
        try:
            shape = shape.lower().strip()
            
            # Если все аргументы - Fraction, возвращаем Fraction где возможно
            all_fractions = all(isinstance(x, Fraction) for x in args)
            
            if shape in ['круг', 'circle', 'окружность']:
                if len(args) == 1:
                    r = args[0]
                    # π * r^2 - возвращаем float, т.к. π иррационально
                    return float(r) ** 2 * math.pi
                
            elif shape in ['квадрат', 'square']:
                if len(args) == 1:
                    a = args[0]
                    if all_fractions:
                        return Fraction(a.numerator ** 2, a.denominator ** 2)
                    return float(a) ** 2
                
            elif shape in ['прямоугольник', 'rectangle']:
                if len(args) == 2:
                    a, b = args
                    if all_fractions:
                        return Fraction(a.numerator * b.numerator, a.denominator * b.denominator)
                    return float(a) * float(b)
                
            elif shape in ['треугольник', 'triangle']:
                if len(args) == 2:
                    # Прямоугольный треугольник: основание и высота
                    a, b = args
                    if all_fractions:
                        return Fraction(a.numerator * b.numerator, a.denominator * b.denominator * 2)
                    return (float(a) * float(b)) / 2
                elif len(args) == 3:
                    # Треугольник по формуле Герона (возвращаем float)
                    a, b, c = args
                    s = (float(a) + float(b) + float(c)) / 2
                    return math.sqrt(s * (s - float(a)) * (s - float(b)) * (s - float(c)))
                
            elif shape in ['трапеция', 'trapezoid']:
                if len(args) == 3:
                    a, b, h = args  # основания и высота
                    if all_fractions:
                        num = a.numerator * h.numerator + b.numerator * h.numerator
                        den = a.denominator * b.denominator * h.denominator * 2
                        return Fraction(num, den)
                    return ((float(a) + float(b)) / 2) * float(h)
                
            elif shape in ['ромб', 'rhombus']:
                if len(args) == 2:
                    d1, d2 = args  # диагонали
                    if all_fractions:
                        return Fraction(d1.numerator * d2.numerator, d1.denominator * d2.denominator * 2)
                    return (float(d1) * float(d2)) / 2
                
            elif shape in ['параллелограмм', 'parallelogram']:
                if len(args) == 2:
                    a, h = args  # основание и высота
                    if all_fractions:
                        return Fraction(a.numerator * h.numerator, a.denominator * h.denominator)
                    return float(a) * float(h)
                
            return None
            
        except Exception as e:
            print(f"Ошибка при вычислении площади: {e}")
            return None
    
    @staticmethod
    def calculate_volume(shape: str, *args) -> Optional[Union[Fraction, float]]:
        """Вычисляет объем геометрического тела"""
        try:
            shape = shape.lower().strip()
            
            # Если все аргументы - Fraction, возвращаем Fraction где возможно
            all_fractions = all(isinstance(x, Fraction) for x in args)
            
            if shape in ['куб', 'cube']:
                if len(args) == 1:
                    a = args[0]
                    if all_fractions:
                        return Fraction(a.numerator ** 3, a.denominator ** 3)
                    return float(a) ** 3
                
            elif shape in ['параллелепипед', 'parallelepiped', 'прямоугольник', 'rectangular prism']:
                if len(args) == 3:
                    a, b, c = args
                    if all_fractions:
                        num = a.numerator * b.numerator * c.numerator
                        den = a.denominator * b.denominator * c.denominator
                        return Fraction(num, den)
                    return float(a) * float(b) * float(c)
                
            elif shape in ['шар', 'sphere', 'сфера']:
                if len(args) == 1:
                    r = args[0]
                    # (4/3) * π * r^3 - возвращаем float
                    return (4/3) * math.pi * float(r) ** 3
                
            elif shape in ['цилиндр', 'cylinder']:
                if len(args) == 2:
                    r, h = args
                    # π * r^2 * h - возвращаем float
                    return math.pi * float(r) ** 2 * float(h)
                
            elif shape in ['конус', 'cone']:
                if len(args) == 2:
                    r, h = args
                    # (1/3) * π * r^2 * h - возвращаем float
                    return (1/3) * math.pi * float(r) ** 2 * float(h)
                
            elif shape in ['пирамида', 'pyramid']:
                if len(args) == 2:
                    # Площадь основания и высота
                    base_area, h = args
                    if all_fractions:
                        return Fraction(base_area.numerator * h.numerator, 3 * base_area.denominator * h.denominator)
                    return (float(base_area) * float(h)) / 3
                
            return None
            
        except Exception as e:
            print(f"Ошибка при вычислении объема: {e}")
            return None


class FractionCalculator:
    """Калькулятор для работы с дробями и десятичными числами"""
    
    @staticmethod
    def parse_fraction(text: str) -> Optional[Fraction]:
        """Парсит строку в дробь (поддерживает форматы: 1/2, -3/4, 5, -7)"""
        text = text.strip().replace(' ', '')
        
        # Проверяем формат дроби
        if '/' in text:
            try:
                numerator, denominator = text.split('/', 1)
                num = int(numerator) if numerator else 0
                den = int(denominator) if denominator else 1
                return Fraction(num, den)
            except (ValueError, ZeroDivisionError):
                return None
        
        # Проверяем целое число
        try:
            return Fraction(int(text))
        except ValueError:
            return None
    
    @staticmethod
    def tokenize(expression: str) -> list:
        """Разбивает выражение на токены"""
        # Удаляем пробелы
        expression = expression.replace(' ', '')
        
        # Паттерн для токенов: числа (включая дроби), операторы, скобки
        token_pattern = r'(\d+/\d+|\d+|\+|\-|\*|/|\(|\))'
        tokens = re.findall(token_pattern, expression)
        
        # Обрабатываем унарный минус
        processed_tokens = []
        for i, token in enumerate(tokens):
            if token == '-' and (i == 0 or tokens[i-1] in '+-*/('):
                # Это унарный минус, объединяем с следующим числом
                if i + 1 < len(tokens) and re.match(r'\d+', tokens[i+1]):
                    processed_tokens.append('-' + tokens[i+1])
                    tokens[i+1] = ''  # Помечаем как обработанный
                elif i + 1 < len(tokens) and re.match(r'\d+/\d+', tokens[i+1]):
                    processed_tokens.append('-' + tokens[i+1])
                    tokens[i+1] = ''
                else:
                    processed_tokens.append(token)
            elif token:
                processed_tokens.append(token)
        
        return processed_tokens
    
    @staticmethod
    def parse_tokens(tokens: list) -> Optional[Fraction]:
        """Парсит токены в выражение Fraction"""
        # Преобразуем токены в объекты
        parsed = []
        for token in tokens:
            if token in '+-*/()':
                parsed.append(token)
            else:
                # Это число
                frac = FractionCalculator.parse_fraction(token)
                if frac:
                    parsed.append(frac)
                else:
                    return None
        
        # Вычисляем выражение
        return FractionCalculator._evaluate_parsed(parsed)
    
    @staticmethod
    def _evaluate_parsed(parsed: list) -> Optional[Fraction]:
        """Рекурсивно вычисляет выражение"""
        # Сначала обрабатываем скобки
        result = FractionCalculator._evaluate_parentheses(parsed)
        return result
    
    @staticmethod
    def _evaluate_parentheses(parsed: list) -> Optional[Fraction]:
        """Обрабатывает выражения в скобках"""
        # Ищем самую внутреннюю скобку
        stack = []
        for i, token in enumerate(parsed):
            if token == '(':
                stack.append(i)
            elif token == ')':
                if stack:
                    start = stack.pop()
                    # Вычисляем выражение внутри скобок
                    inner_result = FractionCalculator._evaluate_expression(parsed[start+1:i])
                    if inner_result is None:
                        return None
                    # Заменяем (выражение) на результат
                    new_parsed = parsed[:start] + [inner_result] + parsed[i+1:]
                    return FractionCalculator._evaluate_parentheses(new_parsed)
        
        # Если скобок нет, вычисляем выражение
        return FractionCalculator._evaluate_expression(parsed)
    
    @staticmethod
    def _evaluate_expression(parsed: list) -> Optional[Fraction]:
        """Вычисляет выражение без скобок (учитывая приоритеты операций)"""
        # Сначала умножение и деление
        result = FractionCalculator._evaluate_mult_div(parsed)
        return result
    
    @staticmethod
    def _evaluate_mult_div(parsed: list) -> Optional[Fraction]:
        """Вычисляет умножение и деление слева направо"""
        if not parsed:
            return None
        
        # Начинаем с первого числа
        result = parsed[0]
        if not isinstance(result, Fraction):
            return None
        
        i = 1
        while i < len(parsed):
            if i >= len(parsed):
                break
            
            operator = parsed[i]
            if operator in '*/':
                # Это умножение или деление
                if i + 1 >= len(parsed):
                    return None
                next_val = parsed[i+1]
                if not isinstance(next_val, Fraction):
                    return None
                
                if operator == '*':
                    result = result * next_val
                elif operator == '/':
                    result = result / next_val
                
                i += 2
            else:
                break
        
        # Теперь обрабатываем сложение и вычитание
        # Остаток списка: [operator, value, operator, value, ...]
        remaining = parsed[i:]
        
        for j in range(0, len(remaining), 2):
            if j + 1 >= len(remaining):
                break
            operator = remaining[j]
            next_val = remaining[j+1]
            
            if not isinstance(next_val, Fraction):
                return None
            
            if operator == '+':
                result = result + next_val
            elif operator == '-':
                result = result - next_val
        
        return result
    
    @staticmethod
    def evaluate_expression(expression: str) -> Optional[Fraction]:
        """Вычисляет математическое выражение с дробями"""
        try:
            # Токенизируем
            tokens = FractionCalculator.tokenize(expression)
            if not tokens:
                return None
            
            # Парсим и вычисляем
            return FractionCalculator.parse_tokens(tokens)
            
        except Exception as e:
            print(f"Ошибка при вычислении: {e}")
            return None


class ImageCalculator:
    """Калькулятор для вычислений по фото"""
    
    @staticmethod
    def preprocess_image(image_path: str):
        """Предобработка изображения для OCR"""
        if not OCR_AVAILABLE:
            print("OCR недоступен. Установите необходимые пакеты.")
            return None
            
        # Читаем изображение
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Не удалось загрузить изображение: {image_path}")
        
        # Конвертируем в оттенки серого
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Применяем адаптивный порог
        thresh = cv2.adaptiveThreshold(
            gray, 255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 11, 2
        )
        
        # Удаляем шум
        kernel = np.ones((2, 2), np.uint8)
        processed = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        
        return processed
    
    @staticmethod
    def extract_text(image_path: str) -> str:
        """Извлекает текст из изображения"""
        if not OCR_AVAILABLE:
            return ""
        
        try:
            # Предобработка
            processed_img = ImageCalculator.preprocess_image(image_path)
            if processed_img is None:
                return ""
            
            # Используем Tesseract для извлечения текста
            custom_config = r'--oem 3 --psm 6 outputbase digits'
            text = pytesseract.image_to_string(
                processed_img, 
                config=custom_config
            )
            
            # Очищаем текст
            text = text.strip()
            text = re.sub(r'\s+', ' ', text)
            
            return text
            
        except Exception as e:
            print(f"Ошибка при извлечении текста: {e}")
            return ""
    
    @staticmethod
    def calculate_from_image(image_path: str) -> Optional[Fraction]:
        """Вычисляет выражение из изображения"""
        if not OCR_AVAILABLE:
            print("OCR недоступен.")
            return None
        
        # Извлекаем текст
        text = ImageCalculator.extract_text(image_path)
        print(f"Извлеченный текст: {text}")
        
        if not text:
            return None
        
        # Вычисляем выражение
        result = FractionCalculator.evaluate_expression(text)
        return result


def parse_geometry_expression(expr: str) -> Tuple[Optional[str], Optional[list]]:
    """Парсит геометрическое выражение"""
    expr = expr.lower().strip()
    
    # Паттерны для площадей
    area_patterns = [
        (r'площадь\s+(круг|circle|окружность)\s+радиус\s+([\d\s/\-]+)', 'круг'),
        (r'площадь\s+(квадрат|square)\s+сторона\s+([\d\s/\-]+)', 'квадрат'),
        (r'площадь\s+(прямоугольник|rectangle)\s+стороны\s+([\d\s/\-]+)\s+и\s+([\d\s/\-]+)', 'прямоугольник'),
        (r'площадь\s+(треугольник|triangle)\s+основание\s+([\d\s/\-]+)\s+и\s+высота\s+([\d\s/\-]+)', 'треугольник'),
        (r'площадь\s+(трапеция|trapezoid)\s+основания\s+([\d\s/\-]+)\s+и\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'трапеция'),
        (r'площадь\s+(ромб|rhombus)\s+диагонали\s+([\d\s/\-]+)\s+и\s+([\d\s/\-]+)', 'ромб'),
        (r'площадь\s+(параллелограмм|parallelogram)\s+основание\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'параллелограмм'),
    ]
    
    # Паттерны для объемов
    volume_patterns = [
        (r'объем\s+(куб|cube)\s+ребро\s+([\d\s/\-]+)', 'куб'),
        (r'объем\s+(параллелепипед|parallelepiped|прямоугольник)\s+стороны\s+([\d\s/\-]+)\s*,\s*([\d\s/\-]+)\s*,\s*([\d\s/\-]+)', 'параллелепипед'),
        (r'объем\s+(шар|sphere|сфера)\s+радиус\s+([\d\s/\-]+)', 'шар'),
        (r'объем\s+(цилиндр|cylinder)\s+радиус\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'цилиндр'),
        (r'объем\s+(конус|cone)\s+радиус\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'конус'),
        (r'объем\s+(пирамида|pyramid)\s+площадь\s+основания\s+([\d\s/\-]+)\s+высота\s+([\d\s/\-]+)', 'пирамида'),
    ]
    
    # Проверяем площади
    for pattern, shape in area_patterns:
        match = re.search(pattern, expr, re.IGNORECASE)
        if match:
            values = [m.strip() for m in match.groups()[1:] if m.strip()]
            parsed_values = []
            for v in values:
                frac = FractionCalculator.parse_fraction(v)
                if frac:
                    parsed_values.append(frac)
                else:
                    try:
                        parsed_values.append(float(v))
                    except:
                        return None, None
            return shape, parsed_values
    
    # Проверяем объемы
    for pattern, shape in volume_patterns:
        match = re.search(pattern, expr, re.IGNORECASE)
        if match:
            values = [m.strip() for m in match.groups()[1:] if m.strip()]
            parsed_values = []
            for v in values:
                frac = FractionCalculator.parse_fraction(v)
                if frac:
                    parsed_values.append(frac)
                else:
                    try:
                        parsed_values.append(float(v))
                    except:
                        return None, None
            return shape, parsed_values
    
    return None, None


def parse_and_calculate_expression(expression: str) -> Optional[Fraction]:
    """Парсит и вычисляет математическое выражение"""
    # Удаляем пробелы
    expression = expression.replace(' ', '')
    
    # Проверяем на пустую строку
    if not expression:
        return None
    
    # Пытаемся вычислить
    return FractionCalculator.evaluate_expression(expression)


def main():
    """Главная функция"""
    print("=" * 50)
    print("Калькулятор с поддержкой дробей, OCR и геометрии")
    print("=" * 50)
    print("\nВыберите режим:")
    print("1. Вычислить выражение вручную")
    print("2. Вычислить выражение по фото")
    print("3. Геометрические вычисления")
    print("4. Выйти")
    
    while True:
        try:
            choice = input("\nВаш выбор (1/2/3/4): ").strip()
            
            if choice == '1':
                # Ручной ввод
                expression = input("Введите выражение (например: 1/2+3/4 или 2*(3+4)): ")
                result = parse_and_calculate_expression(expression)
                
                if result:
                    print(f"Результат: {result}")
                    if result.denominator != 1:
                        print(f"Десятичное значение: {float(result):.4f}")
                else:
                    print("Не удалось вычислить выражение. Проверьте формат.")
            
            elif choice == '2':
                # OCR из изображения
                if not OCR_AVAILABLE:
                    print("OCR недоступен. Установите opencv-python, pytesseract и Tesseract OCR.")
                    continue
                    
                image_path = input("Введите путь к изображению: ").strip()
                
                try:
                    result = ImageCalculator.calculate_from_image(image_path)
                    
                    if result:
                        print(f"Результат: {result}")
                        if result.denominator != 1:
                            print(f"Десятичное значение: {float(result):.4f}")
                    else:
                        print("Не удалось извлечь или вычислить выражение из изображения.")
                except Exception as e:
                    print(f"Ошибка: {e}")
            
            elif choice == '3':
                # Геометрические вычисления
                print("\nГеометрические вычисления:")
                print("Примеры:")
                print("  - площадь круг радиус 5")
                print("  - площадь прямоугольник стороны 3 и 4")
                print("  - объем куб ребро 2")
                print("  - объем цилиндр радиус 3 высота 5")
                
                expr = input("\nВведите геометрическое выражение: ").strip()
                
                shape, values = parse_geometry_expression(expr)
                
                if shape and values:
                    # Проверяем площадь или объем
                    if expr.lower().startswith('площадь'):
                        result = GeometryCalculator.calculate_area(shape, *values)
                        if result:
                            if isinstance(result, Fraction):
                                print(f"Площадь {shape}: {result}")
                                print(f"Десятичное значение: {float(result):.4f}")
                            else:
                                print(f"Площадь {shape}: {result:.4f}")
                        else:
                            print("Не удалось вычислить площадь. Проверьте формат.")
                    
                    elif expr.lower().startswith('объем'):
                        result = GeometryCalculator.calculate_volume(shape, *values)
                        if result:
                            if isinstance(result, Fraction):
                                print(f"Объем {shape}: {result}")
                                print(f"Десятичное значение: {float(result):.4f}")
                            else:
                                print(f"Объем {shape}: {result:.4f}")
                        else:
                            print("Не удалось вычислить объем. Проверьте формат.")
                    else:
                        print("Неизвестный тип вычисления. Используйте 'площадь' или 'объем'.")
                else:
                    print("Не удалось распознать геометрическое выражение. Проверьте формат.")
            
            elif choice == '4':
                print("Выход...")
                break
            
            else:
                print("Неверный выбор. Пожалуйста, введите 1, 2, 3 или 4.")
                
        except KeyboardInterrupt:
            print("\nВыход...")
            break
        except Exception as e:
            print(f"Произошла ошибка: {e}")


if __name__ == "__main__":
    main()
