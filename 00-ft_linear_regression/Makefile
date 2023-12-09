
all: init

init:
	pip install pipenv
	pipenv install
	pipenv shell

train:
	python srcs/train.py

predict:
	python srcs/predict.py

precision:
	python srcs/precision.py

plot:
	python srcs/train.py --plot
clean:
	rm -rf __pycache__/
	rm -rf  thetas.csv
	rm -rf  srcs/*.png
	

fclean: clean
		rm -rf Pipfile.lock