# create a dataset class for the dataset
import pandas as pd
import numpy as np
import os

class Dataset:
	def __init__(self, path, predict=False):
		self.path = path
		if not os.path.exists(path):
			raise FileNotFoundError("File not found")

		self.x = None
		self.y = None
		self.predict = predict
		self.read_dataset()

	def read_dataset(self):

		data = pd.read_csv(self.path)
		self.x = data.iloc[:, 2:].values
		if not self.predict:
			self.y = data.iloc[:, 1].values
		

	# min-max normalization
	def normalize(self):
		self.x = (self.x - self.x.min(axis=0)) / (self.x.max(axis=0) - self.x.min(axis=0))


	def get_train_test_data(self, test_size=0.2):
		indices = np.random.permutation(self.x.shape[0])
		
		#print(self.x)
		test_size = int(self.x.shape[0] * test_size)
		train_indices, test_indices = indices[test_size:], indices[:test_size]
		return self.x[train_indices], self.x[test_indices], self.y[train_indices], self.y[test_indices]

	def get_data(self):
		return self.x, self.y

	def get_data_shape(self):
		return self.x.shape, self.y.shape
	
	def select_features(self, features, use_hands=False):
		if use_hands:
			features.append(3) # add the hand feature
			
		self.x = self.x[:, features]
		if 3 in features:
			self.x[:, -1] = (self.x[:, -1] == "Right").astype(int)

	def prepare_data(self):
		#fill nan values with the mean of the column
		self.x = pd.DataFrame(self.x)
		self.x = self.x.fillna(self.x.mean())
		self.x = self.x.values
		#normalize the data
		self.normalize()
		if self.predict:
			return 
		#manually encode the labels
		unique_labels = np.unique(self.y)
		for i, label in enumerate(unique_labels):
			self.y[self.y == label] = i
		self.y = self.y.astype(int)
		return {i: label for i, label in enumerate(unique_labels)}

		
		