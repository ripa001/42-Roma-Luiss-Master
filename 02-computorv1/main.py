import sys
from srcs.equation import Equation
from srcs.exceptions import ParseError, DegreeError


def main():
    import sys
    if len(sys.argv) != 2:
        print("Usage: python main.py \"equation\"")
        sys.exit(1)

    try:
        equation = Equation(sys.argv[1])
        print(f"Reduced form: {equation.polynomial} = 0")
        print(f"Polynomial degree: {equation.polynomial.degree}")
        
        solution, steps = equation.polynomial.solve()
        
        # Display steps if they exist
        if steps:
            print("\nSolution steps:")
            for step in steps:
                print(f"  • {step}")
            print()
            
        if isinstance(solution, list):
            if len(solution) == 1:
                print(f"The solution is: {solution[0]}")
            else:
                print(f"The two solutions are:")
                for sol in solution:
                    print(f"  {sol}")
        else:
            print(solution)
            
    except ParseError as e:
        print(f"Parse error: {str(e)}")
    except DegreeError as e:
        print(str(e))
    except Exception as e:
        print(f"Error Check your input: {str(e)}")

if __name__ == "__main__":
    main()