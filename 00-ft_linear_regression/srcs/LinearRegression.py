from plotting import plot_data
import pandas as pd

def estimate_price(mileage, theta0, theta1):
	return theta0 + (theta1 * mileage)

def normalize(x):
	return (x - x.min()) / (x.max() - x.min())

def cost_function(x, y, theta0, theta1):
	m = len(x)
	cost = 0
	for i in range(m):
		cost += (estimate_price(x[i], theta0, theta1) - y[i]) ** 2
	return cost / (2 * m)

def gradient_descent(x, y, theta0, theta1, lr):
	m = len(x)
	tmp0 = 0
	tmp1 = 0
	for i in range(m):
		tmp0 += (estimate_price(x[i], theta0, theta1) - y[i])
		tmp1 += (estimate_price(x[i], theta0, theta1) - y[i]) * x[i]

	theta0 -= (lr / m) * tmp0
	theta1 -= (lr / m) * tmp1
	return theta0, theta1

def train(x, y, theta0, theta1, lr, n_cycle, plot, convergence_threshold=1e-6):
	m = len(x)
	x_norm = normalize(x)
	y_norm = normalize(y)
	losses = []
	cost_prev = float('inf')

	for i in range(n_cycle):
		theta0, theta1 = gradient_descent(x_norm, y_norm, theta0, theta1, lr)

		cost = cost_function(x_norm, y_norm, theta0, theta1)
		print("{}: theta0: {}, theta1: {}, cost: {}".format(i, theta0, theta1, cost))
		if plot:
			plot_data(x, y, theta0 * (y.max() - y.min()) + y.min() - theta1 * x.min() * (y.max() - y.min()) / (x.max() - x.min()), theta1 * (y.max() - y.min()) / (x.max() - x.min()), "during_training")
		# Check for convergence
		if abs(cost_prev - cost) < convergence_threshold:
			print("Converged. Stopping training.")
			break

		cost_prev = cost
		losses.append(cost)

	theta0 = theta0 * (y.max() - y.min()) + y.min() - theta1 * x.min() * (y.max() - y.min()) / (x.max() - x.min())
	theta1 = theta1 * (y.max() - y.min()) / (x.max() - x.min())
	return theta0, theta1, losses

def read_dataset(path):
	df = pd.read_csv(path).astype(float)
	# get values without using comuns names
	return df.iloc[:, 0].values, df.iloc[:, 1].values