all: test

main:
	@echo "Executing main.py with python3"
	python3 main.py $(ARGS)


test:
	@echo "Executing test.py with python3"
	@echo "Any real number equation"
	python3 main.py "5 * X^0 = 5 * X^0"
	@echo "\n\nImpossible equation"
	python3 main.py "4 * X^0 = 8 * X^0"
	@echo "\n\nFirst Degree"
	python3 main.py "5 * X^0 = 4 * X^0 + 7 * X^1"
	@echo "\n\nSecond Degree Positive Discriminant"
	python3 main.py "5 * X^0 + 13 * X^1 + 3 * X^2 = 1 * X^0 + 1 * X^1"
	@echo "\n\nSecond Degree Zero Discriminant"
	python3 main.py "6 * X^0 + 11 * X^1 + 5 * X^2 = 1 * X^0 + 1 * X^1"	
	@echo "\n\nSecond Degree Negative Discriminant"
	python3 main.py "5 * X^0 + 3 * X^1 + 3 * X^2 = 1 * X^0 + 0 * X^1"
	@echo "\n\nThird Degree"
	python3 main.py "5 * X^0 + 13 * X^1 + 3 * X^2 + 3 * X^3 = 1 * X^0 + 1 * X^1"
	@echo "\n\nThird Degree Valid"
	python3 main.py "5 * X^0 + 13 * X^1 + 3 * X^2 + 3 * X^3 = 1 * X^0 + 1 * X^1 + 3 * X^3"
	

	@echo "\n\nRunning test"
	python3 main.py "5 * X^0 + 4 * X^1 - 9.3 * X^2 = 1 * X^0"
	python3 main.py "5 * X^0 + 4 * X^1 = 4 * X^0"
	python3 main.py "5 * X^0 + 4 * X^1 = 4 * X^0 + 7 * X^1"
	python3 main.py "5 * X^0 + 13 * X^1 + 3 * X^2 = 1 * X^0 + 1 * X^1"
	python3 main.py "6 * X^0 + 11 * X^1 + 5 * X^2 = 1 * X^0 + 1 * X^1"

	@echo "\n\nBonus test"

	python3 main.py "5.0 + X + 5.0 = 0"
	python3 main.py "5.0x² + 10.0 * X + 5.0 = 0"
	python3 main.py "5.0x² + 10.0 * X + X^2 = 0"

	python3 main.py "5.0x² + 10.0 * X"

clean:
	rm -rf srcs/__pycache__/


fclean: clean
