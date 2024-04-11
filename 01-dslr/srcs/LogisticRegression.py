import numpy as np
import matplotlib.pyplot as plt
import sys
from os import path
from tqdm import tqdm

class LogisticRegression:
	def __init__(self, mapping=None, lr=0.01, num_iter=100000, selected_features=None):
		self.lr = lr
		self.num_iter = num_iter
		self.selected_features = selected_features
		self.tetha_values = None
		self.unique_labels = np.array(list(mapping.keys())) if mapping else None
		self.cost_history = None
		self.precision_history = None
		self.mapping : dict = mapping
		if not mapping and path.exists('thetas.csv') and path.exists('params.csv'):
			print("model already trained, loading thetas and params...")
			self.load_thetas_and_params()
		elif not mapping:
			print("model not trained yet, please train it first.")
			sys.exit(1)

	def load_thetas_and_params(self):
		with open('thetas.csv', 'r') as f:
			self.tetha_values = [np.array(eval(line)) for line in f]

		with open('params.csv', 'r') as f:
			self.lr = float(f.readline())
			self.num_iter = int(f.readline())
			self.mapping = eval(f.readline())
			self.selected_features = eval(f.readline())
			self.unique_labels = np.array(list(self.mapping.keys()))
		
	def save_thetas(self):
		with open('thetas.csv', 'w') as f:
			for i in range(len(self.unique_labels)):
				f.write(f"{self.tetha_values[i].tolist()}\n")

	def save_params(self):
		with open('params.csv', 'w') as f:
			f.write(f"{self.lr}\n")
			f.write(f"{self.num_iter}\n")
			f.write(f"{self.mapping}\n")
			f.write(f"{self.selected_features}\n")


	# g(z) = 1/1 + e−z
	def sigmoid(self, X):
		return 1 / (1 + np.exp(-X.astype(float)))
	
	# hθ(x) = g(θT x)
	def h0(self, X, tetha):
		return self.sigmoid(X @ tetha)
	
	# J(θ) = 1/m∑yi log(hθ(xi)) + (1 −yi) log(1 −hθ(xi))
	def cost_function(self, X, y, tetha):
		return np.sum(-y * np.log(self.h0(X, tetha)) - (1 - y) * np.log(1 - self.h0(X, tetha))) / len(y)
	
	# ∂/∂θj J(θ) = 1/m∑(hθ(xi) −yi)xi
	def gradient_descent(self, X, y):
		m, n = X.shape
		theta = np.zeros(n, dtype=float)
		cost_history = []
		precision_history = []
		for i in tqdm(range(self.num_iter)):
			h = self.h0(X, theta)
			gd = X.T @ (h - y) / m
			theta -= self.lr * gd.astype(float)
			cost = self.cost_function(X, y, theta)
			cost_history.append(cost)
			precision_history.append(self.precision(y, h))
		return theta, cost_history, precision_history
	
	def stochastic_gradient_descent(self, X, y, schedule_lr=False):
		m, n = X.shape
		theta = np.zeros(n, dtype=float)
		cost_history = []
		precision_history = []
		lr_tmp = self.lr
		for i in tqdm(range(self.num_iter)):
			if schedule_lr:
				# self.lr_tmp = 1 / (i + 1)
				lr_tmp = lr_tmp * (1 - 0.005 * i)
				# self.lr_tmp = self.lr_tmp * (1 - 0.0001 * i)
			for j in range(m):
				rand_index = np.random.randint(0, m)
				X_i = X[rand_index, :].reshape(1, n)
				y_i = y[rand_index].reshape(1)
				h = self.h0(X_i, theta)
				gd = X_i.T @ (h - y_i)
				theta -= lr_tmp * gd.astype(float)
				# cost = self.cost_function(X_i, y_i, theta)
				# cost_history.append(cost)
				# precision_history.append(self.precision(y_i, h))
			cost = self.cost_function(X, y, theta)
			cost_history.append(cost)
			precision_history.append(self.precision(y, self.h0(X, theta)))
			
		return theta, cost_history, precision_history
	
	
	def fit(self, X, y, stochastic=False, schedule_lr=False):
		self.unique_labels = np.unique(y)
		num_labels = len(self.unique_labels)
		self.tetha_values = []
		self.cost_history = []
		self.precision_history = []
		for i in range(num_labels):
			y_i = np.where(y == self.unique_labels[i], 1, 0)
			tetha, cost_history, precision_history = self.stochastic_gradient_descent(X, y_i, schedule_lr) \
				if stochastic else self.gradient_descent(X, y_i)
			self.tetha_values.append(tetha)
			self.cost_history.append(cost_history)
			self.precision_history.append(precision_history)
		self.plot_cost()
		self.plot_precision()
		self.save_thetas()
		self.save_params()

	def predict(self, X):
		if self.tetha_values is None or self.unique_labels is None:
			print("You need to train the model first.")
			sys.exit(1)
		predictions = []
		for i in range(len(self.unique_labels)):
			probabilities = self.h0(X, self.tetha_values[i])
			predictions.append(probabilities)
		predictions = np.array(predictions)
		return self.unique_labels[np.argmax(predictions, axis=0)]
	
	
	def precision(self, y, h):
		return np.mean(y == np.round(h))
	
	def plot_precision(self):
		plt.figure(figsize=(10, 6))
		for i in range(len(self.unique_labels)):
			plt.plot(self.precision_history[i], label=f"precision {self.mapping[self.unique_labels[i]]}")
		plt.legend()
		plt.show()
		plt.savefig("srcs/plotting/plots/precision.png")

	def plot_cost(self):
		plt.figure(figsize=(10, 6))
		for i in range(len(self.unique_labels)):
			plt.plot(self.cost_history[i], label=f"cost {self.mapping[self.unique_labels[i]]}")
		plt.legend()
		plt.show()
		plt.savefig("srcs/plotting/plots/cost.png")