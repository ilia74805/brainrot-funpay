#!/usr/bin/env python3
"""
Калькулятор с поддержкой:
- Вычислений по фото (OCR)
- Работы с дробями
- Базовых арифметических операций
"""

import re
import cv2
import numpy as np
import pytesseract
from fractions import Fraction
from typing import Optional, Tuple


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
    def parse_expression(expression: str) -> Optional[str]:
        """Парсит математическое выражение, заменяя дроби на десятичные значения"""
        # Паттерн для дробей: -?\d+/\d+
        fraction_pattern = r'-?\d+/\d+'
        
        def replace_fraction(match):
            frac_str = match.group(0)
            frac = FractionCalculator.parse_fraction(frac_str)
            if frac:
                return f"({frac.numerator}/{frac.denominator})"
            return frac_str
        
        # Заменяем дроби на формат, понятный eval
        result = re.sub(fraction_pattern, replace_fraction, expression)
        return result
    
    @staticmethod
    def evaluate_expression(expression: str) -> Optional[Fraction]:
        """Вычисляет математическое выражение с дробями"""
        try:
            # Заменяем дроби на операции деления
            expr = expression.replace('/', ' / ')
            
            # Добавляем явное умножение для случаев типа 2(3+4)
            expr = re.sub(r'(\d+)(\()', r'\1*\2', expr)
            
            # Используем Fraction для точных вычислений
            # Разбиваем на токены и вычисляем
            tokens = re.findall(r'\d+|/|\+|\-|\*|\(|\)|\.|\s+', expr)
            
            # Упрощенный подход: используем eval с Fraction
            # Заменяем все числа на Fraction
            def replace_numbers(match):
                num_str = match.group(0)
                if '.' in num_str:
                    return f"Fraction('{num_str}')"
                return f"Fraction({num_str}, 1)"
            
            expr_for_eval = re.sub(r'\d+(\.\d+)?', replace_numbers, expr)
            
            # Добавляем импорт
            expr_for_eval = f"from fractions import Fraction\n{expr_for_eval}"
            
            result = eval(expr_for_eval)
            return result
            
        except Exception as e:
            print(f"Ошибка при вычислении: {e}")
            return None


class ImageCalculator:
    """Калькулятор для вычислений по фото"""
    
    @staticmethod
    def preprocess_image(image_path: str) -> np.ndarray:
        """Предобработка изображения для OCR"""
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
        try:
            # Предобработка
            processed_img = ImageCalculator.preprocess_image(image_path)
            
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
        # Извлекаем текст
        text = ImageCalculator.extract_text(image_path)
        print(f"Извлеченный текст: {text}")
        
        if not text:
            return None
        
        # Вычисляем выражение
        result = FractionCalculator.evaluate_expression(text)
        return result


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
    print("Калькулятор с поддержкой дробей и OCR")
    print("=" * 50)
    print("\nВыберите режим:")
    print("1. Вычислить выражение вручную")
    print("2. Вычислить выражение по фото")
    print("3. Выйти")
    
    while True:
        try:
            choice = input("\nВаш выбор (1/2/3): ").strip()
            
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
                print("Выход...")
                break
            
            else:
                print("Неверный выбор. Пожалуйста, введите 1, 2 или 3.")
                
        except KeyboardInterrupt:
            print("\nВыход...")
            break
        except Exception as e:
            print(f"Произошла ошибка: {e}")


if __name__ == "__main__":
    main()
