from LogisticRegression import LogisticRegression
from Dataset import Dataset
import sys
import numpy as np
import random
import pandas as pd

def confusion_matrix(y_true, y_pred, mapping, unique_labels):
	matrix = np.zeros((len(unique_labels), len(unique_labels)))
	reverse_mapping = {v: k for k, v in mapping.items()}
	for i in range(len(y_true)):
		matrix[reverse_mapping[y_true[i]], y_pred[i]] += 1
	print("Confusion matrix x-axis: Actual, y-axis: Predicted")
	print(matrix)
	print("The samples are as follows:")
	for i in range(len(unique_labels)):
		print(f"Samples for {mapping[unique_labels[i]]}: {np.sum(matrix[i])}")

		print(f"Precision for {mapping[unique_labels[i]]}: {matrix[i, i] / np.sum(matrix[i])}")

def compare_results(y_pred, ds_name, mapping):
	ds = pd.read_csv(ds_name)
	y_true = ds.iloc[:, 1].values
	unique_labels = list(mapping.keys())
	count = 0
	for i in range(len(y_pred)):
		print(f"Predicted: {y_pred[i]} Actual: {y_true[i]}")
		if mapping[unique_labels[y_pred[i]]] != y_true[i]:
			count += 1
	print(f"Total wrong predictions: {count} out of {len(y_pred)}")
	print("Precision: ", 1 - count / len(y_pred))

	confusion_matrix(y_true, y_pred, mapping, unique_labels)
	

def main():
	np.random.seed(42)
	random.seed(42)
	if len(sys.argv) == 2:
		lr = LogisticRegression()
		dataset = Dataset(sys.argv[1], predict=True)
		dataset.select_features(lr.selected_features)
		dataset.prepare_data()
		X, _ = dataset.get_data()
		preds = lr.predict(X)
		with open("houses.csv", "w") as f:
			f.write("Index,Hogwarts House\n")
			for i, pred in enumerate(preds):
				f.write(f"{i},{lr.mapping[lr.unique_labels[pred]]}\n")
		print("Predictions saved in houses.csv")
		if "train" in sys.argv[1]:
			compare_results(preds, sys.argv[1], lr.mapping,)

	else:
		print("Usage: python logreg_predict.py path/to/dataset.csv")

if __name__ == "__main__":
	main()