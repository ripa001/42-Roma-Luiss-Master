import numpy as np
from plotting import plot_precision
import os

from LinearRegression import estimate_price, read_dataset

def precision(y, y_hat):
	return 1 - (np.sum(np.abs(y - y_hat)) / np.sum(y))

def main():
	# calculate precision
	x, y = read_dataset('Dataset/data.csv')
	theta0 = 0
	theta1 = 0
	# if exist file thetas.csv
	if os.path.isfile('thetas.csv'):
		with open('thetas.csv', 'r') as f:
			theta0, theta1, x_min, x_max = f.read().split(',')
			theta0 = float(theta0)
			theta1 = float(theta1)

	y_hat = estimate_price(x, theta0, theta1)
	prec = precision(y, y_hat) * 100
	print(f"Precision: {prec:.2f}%")
	plot_precision(x, y, y_hat, prec)

if __name__ == '__main__':
	main()