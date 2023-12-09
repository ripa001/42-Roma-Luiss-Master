import os

def estimate_price(mileage, theta0, theta1):
	return theta0 + (theta1 * mileage)


if __name__ == '__main__':
	theta0 = 0
	theta1 = 0
	mileage = 0
	# if exist file thetas.csv
	if os.path.isfile('thetas.csv'):
		with open('thetas.csv', 'r') as f:
			theta0, theta1, x_min, x_max = f.read().split(',')
			theta0 = float(theta0)
			theta1 = float(theta1)
	mileage = float(input("Enter mileage: "))
	print(estimate_price(mileage, theta0, theta1))