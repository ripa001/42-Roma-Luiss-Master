import sys
from plotting import plot_data, plot_loss, plot_precision
from precision import precision
from LinearRegression import train, read_dataset





def save_model(theta0, theta1):
	
	with open('thetas.csv', 'w') as f:
		f.write("{},{}".format(theta0, theta1))



def main():
	x, y = read_dataset('Dataset/data.csv')
	# Optionally normalize input features here
	theta0 = 0
	theta1 = 0
	lr = 0.01
	n_cycle = 10000
	plot = True if len(sys.argv) == 2 and sys.argv[1] == '--plot' else False
	if plot:
		plot_data(x, y, theta0, theta1, "before_training")
	theta0, theta1, losses = train(x, y, theta0, theta1, lr, n_cycle, plot, convergence_threshold=1e-7)
	save_model(theta0, theta1)
	print("theta0: ", theta0)
	print("theta1: ", theta1)
	y_hat = theta0 + theta1 * x
	if plot:
		# Optionally plot data here
		plot_data(x, y, theta0, theta1, "training")
		plot_precision(x, y, y_hat, precision(y, y_hat) * 100)
		plot_loss(losses)
		prec = precision(y, y_hat) * 100
		print(f"Precision: {prec:.2f}%")

if __name__ == '__main__':
	main()
