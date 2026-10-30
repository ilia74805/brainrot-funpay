#!/usr/bin/env python3
"""
Примеры использования калькулятора
"""

from fractions import Fraction
from main import FractionCalculator, GeometryCalculator, parse_and_calculate_expression


def run_examples():
    """Запускает примеры использования"""
    print("=" * 50)
    print("Примеры использования калькулятора")
    print("=" * 50)
    
    print("\n" + "=" * 50)
    print("АРИФМЕТИЧЕСКИЕ ВЫРАЖЕНИЯ С ДРОБЯМИ")
    print("=" * 50)
    
    examples = [
        "1/2 + 3/4",
        "5/6 - 1/3",
        "2 * (3 + 1/2)",
        "(1/2 + 3/4) * 2",
        "1/3 + 1/6",
        "10/2",
        "-3/4 + 1/2",
        "2/3 * 3/4",
        "1/2 / 1/4",
        "(1+2)*(3+4)",
    ]
    
    for expr in examples:
        result = parse_and_calculate_expression(expr)
        if result:
            decimal = float(result) if result.denominator != 1 else result.numerator
            print(f"\n{expr} = {result} (≈ {decimal:.4f})")
        else:
            print(f"\n{expr} → Ошибка вычисления")
    
    print("\n" + "=" * 50)
    print("ГЕОМЕТРИЧЕСКИЕ ВЫЧИСЛЕНИЯ (ПЛОЩАДЬ)")
    print("=" * 50)
    
    # Площади с целыми числами
    area_examples = [
        ("круг", 5, "радиус 5"),
        ("квадрат", 4, "сторона 4"),
        ("прямоугольник", [3, 4], "стороны 3 и 4"),
        ("треугольник", [3, 4], "основание 3, высота 4"),
        ("трапеция", [3, 5, 4], "основания 3 и 5, высота 4"),
        ("ромб", [6, 8], "диагонали 6 и 8"),
        ("параллелограмм", [5, 3], "основание 5, высота 3"),
    ]
    
    for shape, params, desc in area_examples:
        if isinstance(params, list):
            result = GeometryCalculator.calculate_area(shape, *params)
        else:
            result = GeometryCalculator.calculate_area(shape, params)
        
        if result:
            print(f"\nПлощадь {shape} ({desc}): {result:.4f}")
    
    # Площади с дробями
    print("\n\nПлощади с дробями:")
    frac_area_examples = [
        ("квадрат", Fraction(3, 2), "сторона 3/2"),
        ("прямоугольник", [Fraction(1, 2), Fraction(3, 4)], "стороны 1/2 и 3/4"),
        ("треугольник", [Fraction(1, 2), Fraction(1, 2)], "основание 1/2, высота 1/2"),
    ]
    
    for shape, params, desc in frac_area_examples:
        if isinstance(params, list):
            result = GeometryCalculator.calculate_area(shape, *params)
        else:
            result = GeometryCalculator.calculate_area(shape, params)
        
        if result:
            if isinstance(result, Fraction):
                print(f"\nПлощадь {shape} ({desc}): {result} (≈ {float(result):.4f})")
            else:
                print(f"\nПлощадь {shape} ({desc}): {result:.4f}")
    
    print("\n" + "=" * 50)
    print("ГЕОМЕТРИЧЕСКИЕ ВЫЧИСЛЕНИЯ (ОБЪЕМ)")
    print("=" * 50)
    
    # Объемы с целыми числами
    volume_examples = [
        ("куб", 3, "ребро 3"),
        ("параллелепипед", [2, 3, 4], "стороны 2, 3, 4"),
        ("шар", 5, "радиус 5"),
        ("цилиндр", [3, 5], "радиус 3, высота 5"),
        ("конус", [3, 5], "радиус 3, высота 5"),
        ("пирамида", [20, 6], "площадь основания 20, высота 6"),
    ]
    
    for shape, params, desc in volume_examples:
        if isinstance(params, list):
            result = GeometryCalculator.calculate_volume(shape, *params)
        else:
            result = GeometryCalculator.calculate_volume(shape, params)
        
        if result:
            print(f"\nОбъем {shape} ({desc}): {result:.4f}")
    
    # Объемы с дробями
    print("\n\nОбъемы с дробями:")
    frac_volume_examples = [
        ("куб", Fraction(2, 1), "ребро 2"),
        ("параллелепипед", [Fraction(1, 2), Fraction(1, 2), Fraction(1, 2)], "стороны 1/2, 1/2, 1/2"),
        ("пирамида", [Fraction(1, 2), Fraction(3, 1)], "площадь основания 1/2, высота 3"),
    ]
    
    for shape, params, desc in frac_volume_examples:
        if isinstance(params, list):
            result = GeometryCalculator.calculate_volume(shape, *params)
        else:
            result = GeometryCalculator.calculate_volume(shape, params)
        
        if result:
            if isinstance(result, Fraction):
                print(f"\nОбъем {shape} ({desc}): {result} (≈ {float(result):.4f})")
            else:
                print(f"\nОбъем {shape} ({desc}): {result:.4f}")
    
    print("\n" + "=" * 50)


if __name__ == "__main__":
    run_examples()
