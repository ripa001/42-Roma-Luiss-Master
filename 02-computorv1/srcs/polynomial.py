from typing import Dict, Union, List, Tuple
import math
from .fraction import Fraction
from .exceptions import DegreeError

class Polynomial:
    def __init__(self, coefficients: Dict[int, float]):
        self.coefficients = {k: v for k, v in coefficients.items() if abs(v) > 1e-10}
        if not self.coefficients:
            self.coefficients[0] = 0
        self.degree = max(self.coefficients.keys()) if self.coefficients else 0
        self.steps = []  # Store solution steps

    def __str__(self) -> str:
        """Convert polynomial to string representation"""
        if not self.coefficients:
            return "0"
            
        terms = []
        for degree in sorted(self.coefficients.keys()):
            coef = self.coefficients[degree]
            if abs(coef) < 1e-10:
                continue
            
            # Add plus sign for positive coefficients after first term
            if coef > 0 and terms:
                terms.append("+ ")
            elif coef < 0:
                terms.append("- ")
                coef = abs(coef)
            
            # Format coefficient
            if abs(abs(coef) - 1.0) < 1e-10 and degree != 0:
                coef_str = ""
            else:
                coef_str = f"{coef:.1f}"
                
            # Format term
            if degree == 0:
                term = f"{coef_str}"
            elif degree == 1:
                term = f"{coef_str}X" if coef_str else "X"
            else:
                term = f"{coef_str}X^{degree}" if coef_str else f"X^{degree}"
            
            terms.append(term)
            
        return " ".join(terms).strip()

    def solve(self) -> Tuple[Union[str, List[Union[float, Fraction]]], List[str]]:
        """Solve the polynomial equation and return both solution and steps"""
        self.steps = []  # Reset steps
        
        if self.degree > 2:
            raise DegreeError("The polynomial degree is strictly greater than 2, I can't solve.")
            
        if self.degree == 0:
            if abs(self.coefficients.get(0, 0)) < 1e-10:
                self.steps.append("All coefficients are zero")
                return "All real numbers are solutions.", self.steps
            self.steps.append(f"Constant equation: {self.coefficients[0]} = 0")
            return "No solution exists.", self.steps
            
        if self.degree == 1:
            return self._solve_linear()
            
        return self._solve_quadratic()

    def _solve_linear(self) -> Tuple[List[Union[float, Fraction]], List[str]]:
        """Solve linear equation ax + b = 0"""
        a = self.coefficients.get(1, 0)
        b = self.coefficients.get(0, 0)
        
        self.steps.append(f"Linear equation: {a}x + {b} = 0")
        self.steps.append(f"x = -{b} / {a}")
        
        solution = -b / a
        fraction = Fraction.from_float(solution)
        
        if abs(float(fraction) - solution) < 1e-10:
            self.steps.append(f"x = {fraction}")
            return [fraction], self.steps
        else:
            self.steps.append(f"x ≈ {solution:.6f}")
            return [solution], self.steps

    def _solve_quadratic(self) -> Tuple[Union[List[Union[float, Fraction]], str], List[str]]:
        """Solve quadratic equation ax² + bx + c = 0"""
        a = self.coefficients.get(2, 0)
        b = self.coefficients.get(1, 0)
        c = self.coefficients.get(0, 0)
        
        self.steps.append(f"Quadratic equation: {a}x² + {b}x + {c} = 0")
        
        discriminant = b*b - 4*a*c
        self.steps.append(f"Discriminant = b² - 4ac = {b}² - 4({a})({c}) = {discriminant}")
        
        if abs(discriminant) < 1e-10:
            solution = -b/(2*a)
            self.steps.append("Discriminant is zero - one double root")
            self.steps.append(f"x = -b/(2a) = -{b}/(2*{a})")
            
            fraction = Fraction.from_float(solution)
            if abs(float(fraction) - solution) < 1e-10:
                self.steps.append(f"x = {fraction}")
                return [fraction], self.steps
            else:
                self.steps.append(f"x ≈ {solution:.6f}")
                return [solution], self.steps
                
        elif discriminant > 0:
            self.steps.append("Discriminant is positive - two real roots")
            sqrt_disc = math.sqrt(discriminant)
            
            sol1 = (-b + sqrt_disc)/(2*a)
            sol2 = (-b - sqrt_disc)/(2*a)
            
            frac1 = Fraction.from_float(sol1)
            frac2 = Fraction.from_float(sol2)
            
            solutions = []
            if abs(float(frac1) - sol1) < 1e-10:
                self.steps.append(f"x₁ = {frac1}")
                solutions.append(frac1)
            else:
                self.steps.append(f"x₁ ≈ {sol1:.6f}")
                solutions.append(sol1)
                
            if abs(float(frac2) - sol2) < 1e-10:
                self.steps.append(f"x₂ = {frac2}")
                solutions.append(frac2)
            else:
                self.steps.append(f"x₂ ≈ {sol2:.6f}")
                solutions.append(sol2)
                
            return solutions, self.steps
        else:
            self.steps.append("Discriminant is negative - no real solutions")
            return "No real solutions exist (discriminant is negative).", self.steps
