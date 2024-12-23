# src/parser.py
import re
from typing import Dict, Tuple
from .exceptions import ParseError, DegreeError


class PolynomialParser:
    """Class to handle parsing of polynomial expressions"""
    
    @staticmethod
    def normalize_input(expr: str) -> str:
        """Normalize input expression"""
        # Replace common variations
        expr = expr.replace('x', 'X')
        expr = expr.replace('−', '-')  # Handle different minus signs
        expr = expr.replace('²', '^2')
        expr = re.sub(r'(\d)X', r'\1*X', expr)  # Add * between number and X
        expr = re.sub(r'X(?!\^)', r'X^1', expr)  # Add ^1 where missing
        expr = re.sub(r'X\^$', r'X^1', expr)  # Handle X^ at end
        return expr

    @classmethod
    def parse_expression(cls, expr: str) -> Dict[int, float]:
        """Parse a full expression into coefficient dictionary"""
        expr = cls.normalize_input(expr)
        coefficients = {}
        
        # Split the expression into terms
        terms = []
        current_term = ""
        
        for char in expr:
            if char in ['+', '-'] and current_term:
                if current_term.strip():
                    terms.append(current_term.strip())
                current_term = char
            else:
                current_term += char
                
        if current_term.strip():
            terms.append(current_term.strip())
        
        # Parse each term
        for term in terms:
            if term.strip():
                try:
                    coef, deg = cls.parse_term(term)
                    coefficients[deg] = coefficients.get(deg, 0) + coef
                except ValueError as e:
                    raise ParseError(f"Invalid term: {term}. Error: {str(e)}")
                
        return coefficients

    @classmethod
    def parse_term(cls, term: str) -> Tuple[float, int]:
        """Parse a single term into coefficient and degree"""
        term = term.strip()
        if not term:
            return 0, 0
            
        # Handle standalone signs
        if term in ['+', '-']:
            return (1 if term == '+' else -1), 1
            
        # Extract parts
        parts = term.replace(' ', '').split('*')
        
        # Handle coefficient
        if not parts[0] or parts[0] in ['+', '-']:
            coefficient = 1 if not parts[0] or parts[0] == '+' else -1
        else:
            try:
                coefficient = float(parts[0])
            except ValueError:
                if parts[0].startswith("X") or parts[0].startswith("+X"): 
                    coefficient = 1
                elif parts[0] == '-X':
                    coefficient = -1
                else:
                    raise ParseError(f"Invalid coefficient: {parts[0]}")
        
        # Handle degree
        if len(parts) == 1:
            if 'X' not in parts[0]:
                return coefficient, 0
            if '^' not in parts[0]:
                return coefficient, 1
            degree = int(parts[0].split('^')[1])
        else:
            if 'X' not in parts[-1]:
                return coefficient, 0
            if '^' not in parts[-1]:
                return coefficient, 1
            degree = int(parts[-1].split('^')[1])
            
        return coefficient, degree
