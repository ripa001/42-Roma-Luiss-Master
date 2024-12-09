from .parser import PolynomialParser
from .polynomial import Polynomial

class Equation:
    def __init__(self, equation_str: str):
        self.equation_str = equation_str
        self.polynomial = self._parse_equation()

    def _parse_equation(self) -> Polynomial:
        """Parse equation string into a Polynomial"""
        left, right = self.equation_str.split('=')
        
        # Parse both sides
        left_coeffs = PolynomialParser.parse_expression(left)
        right_coeffs = PolynomialParser.parse_expression(right)
        
        # Subtract right side coefficients from left side
        coefficients = {}
        for deg, coef in left_coeffs.items():
            coefficients[deg] = coefficients.get(deg, 0) + coef
        for deg, coef in right_coeffs.items():
            coefficients[deg] = coefficients.get(deg, 0) - coef
            
        return Polynomial(coefficients)