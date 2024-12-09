from math import gcd
from typing import Union
import math

class Fraction:
    def __init__(self, numerator: int, denominator: int = 1):
        if denominator == 0:
            raise ValueError("Denominator cannot be zero")
        self.numerator = numerator
        self.denominator = denominator
        self._reduce()

    def _reduce(self):
        """Reduce fraction to lowest terms"""
        if self.numerator == 0:
            self.denominator = 1
            return
            
        # Handle signs
        if self.denominator < 0:
            self.numerator = -self.numerator
            self.denominator = -self.denominator
            
        # Reduce
        d = gcd(abs(self.numerator), abs(self.denominator))
        self.numerator //= d
        self.denominator //= d

    @staticmethod
    def from_float(value: float, tolerance: float = 1.0E-10) -> 'Fraction':
        """Convert a float to a fraction"""
        if not isinstance(value, (int, float)):
            raise TypeError(f"Expected int or float, got {type(value)}")
            
        if math.isnan(value) or math.isinf(value):
            raise ValueError("Cannot convert NaN or infinity to fraction")

        sign = 1 if value >= 0 else -1
        value = abs(value)
            
        # Handle simple cases
        if abs(value - round(value)) < tolerance:
            return Fraction(int(sign * round(value)), 1)
            
        # Continued fraction algorithm
        h = [0, 1]
        k = [1, 0]
        a = math.floor(value)
        value = value - a
        h.append(a)
        k.append(1)
        
        for i in range(100):  # Limit iterations
            if value == 0 or abs(h[-1]/k[-1] - (value + a)) < tolerance:
                return Fraction(sign * h[-1], k[-1])
                
            value = 1.0 / value
            a = math.floor(value)
            value = value - a
            h.append(a * h[-1] + h[-2])
            k.append(a * k[-1] + k[-2])
        
        # If no good fraction found, return closest
        return Fraction(sign * h[-1], k[-1])

    def __float__(self) -> float:
        """Convert fraction to float"""
        return self.numerator / self.denominator

    def __str__(self) -> str:
        """Convert fraction to string"""
        if self.denominator == 1:
            return str(self.numerator)
        return f"{self.numerator}/{self.denominator}"

    def __repr__(self) -> str:
        return str(self)