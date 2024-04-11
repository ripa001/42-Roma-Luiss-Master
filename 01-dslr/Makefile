
all: init train

init:
	tar -xf Dataset/datasets.tgz -C Dataset/ && mv Dataset/datasets/* Dataset/ && rm -rf Dataset/datasets
	pip install pipenv
	pipenv install
	pipenv shell

env:
	pipenv shell

describe:
	echo "Training set"
	python srcs/describe.py Dataset/dataset_train.csv
	@echo "\n\n"
	echo "Test set"
	python srcs/describe.py Dataset/dataset_test.csv

plot:
	echo "Plotting data..."
	python srcs/plot.py Dataset/dataset_train.csv

train:
	echo "Training model..."
	python srcs/logreg_train.py Dataset/dataset_train.csv

train_stochastic:
	echo "Training model..."
	python srcs/logreg_train.py Dataset/dataset_train.csv --stochastic --schedule_lr

predict:
	echo "Predicting..."
	python srcs/logreg_predict.py Dataset/dataset_test.csv

clean:
	rm -rf __pycache__/
	rm -rf srcs/plotting/plots/*.png
	rm -rf Dataset/*.csv
	rm -rf params.csv thetas.csv houses.csv

fclean: clean