#!/usr/bin/env python3
"""
Примеры использования калькулятора
"""

from fractions import Fraction
from main import FractionCalculator, parse_and_calculate_expression


def run_examples():
    """Запускает примеры использования"""
    print("=" * 50)
    print("Примеры использования калькулятора")
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


if __name__ == "__main__":
    run_examples()
