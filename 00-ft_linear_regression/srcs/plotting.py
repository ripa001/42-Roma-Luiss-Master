from matplotlib import pyplot as plt

def plot_data(x, y, theta0, theta1, name):
	plt.plot(x, y, 'ro', markersize=4)
	plt.plot(x, theta0 + theta1 * x, 'b')
	plt.xlabel('Mileage')
	plt.ylabel('Price')
	print("Close the plot window to continue.")
	if name == "during_training":
		pass
	else:
		plt.savefig(f'srcs/plot_{name}.png')
		# plt.figure()
	# 	plt.plot(x, y, 'ro', markersize=4)
	# 	plt.plot(x, theta0 + theta1 * x, 'b')
	# 	plt.xlabel('Mileage')
	# 	plt.ylabel('Price')
	# 	plt.savefig(f'srcs/plot_final.png')
	try:
		plt.show()
	except:
		print("Plot window closed. Continuing.")

def plot_loss(losses):
	plt.figure()
	plt.plot(losses)
	plt.xlabel('Iteration')
	plt.ylabel('Loss')
	print("Close the plot window to continue.")
	plt.savefig(f'srcs/plot_loss.png')
	try:
		plt.show()
	except:
		print("Plot window closed. Continuing.")

def plot_precision(x, y, y_hat, prec):
	# plot precision
	plt.figure()
	plt.plot(x, y, 'ro', markersize=4)
	plt.plot(x, y_hat, 'b')
	# add legend
	plt.legend(['Data', 'Prediction'])
	# add axis lines between prediction and data
	for i in range(len(x)):
		plt.plot([x[i], x[i]], [y[i], y_hat[i]], 'g')
	plt.xlabel('Mileage')
	plt.ylabel('Price')
	plt.title(f"Precision: {prec:.2f}%")
	plt.savefig(f'srcs/plot_precision.png')
	try:
		plt.show()
	except:
		print("Plot window closed. Continuing.")