
from LogisticRegression import LogisticRegression
from Dataset import Dataset
import sys
import numpy as np
import random

def confusion_matrix(y_true, y_pred, lr):
	unique_labels = np.unique(y_true)
	matrix = np.zeros((len(unique_labels), len(unique_labels)))
	for i in range(len(y_true)):
		matrix[y_true[i], y_pred[i]] += 1
	print("Confusion matrix x-axis: Actual, y-axis: Predicted")
	print(matrix)
	print("The samples are as follows:")
	for i in range(len(unique_labels)):
		print(f"Samples for {lr.mapping[unique_labels[i]]}: {np.sum(matrix[i])}")

def main():
	np.random.seed(42)
	random.seed(42)
	if len(sys.argv) >= 2:
		# selected_features = [7,10,12,15,13]
		# selected_features = [6, 7, 8, 5, 9, 10, 11, 12, 15] #Precision: 0.9839285714285714
		selected_features = [6, 7, 8, 5, 9, 10, 11, 12, 15, 13] #Precision: Precision: Precision: 0.98125
		# selected_features = [5, 6, 7, 8, 5, 9, 10, 11, 12] #Precision: Precision: 0.9777777777777777
		dataset = Dataset(sys.argv[1])
		dataset.select_features(selected_features)
		mapping = dataset.prepare_data()
		X_train, X_test, y_train, y_test= dataset.get_train_test_data(test_size=0.3)
		stochastic = True if len(sys.argv) == 3 and sys.argv[2] == "--stochastic" else False
		num_iter = 100 if stochastic else 1000
		lr = LogisticRegression(mapping=mapping, lr=0.1, num_iter=num_iter, selected_features=selected_features)
		if stochastic:
			lr.fit(X_train, y_train, stochastic=True)
		else:
			lr.fit(X_train, y_train)
		preds = lr.predict(X_test)
		confusion_matrix(y_test, preds, lr)
		count = 0
		for i in range(len(preds)):
			if lr.unique_labels[preds[i]] != lr.unique_labels[y_test[i]]:
				count += 1
				print(f"Predicted: {lr.mapping[lr.unique_labels[preds[i]]]} Actual: {lr.mapping[lr.unique_labels[y_test[i]]]}")
			
		print(f"Total wrong predictions: {count} out of {len(preds)}")
		print(f"Precision: {lr.precision(y_test, preds)}")

		print("Training done! The thetas are saved in the thetas.csv file.")
		lr.save_thetas()
	else:
		print("Usage: python logreg_train.py path/to/dataset.csv --stochastic(optional)")

if __name__ == "__main__":
	main()


	