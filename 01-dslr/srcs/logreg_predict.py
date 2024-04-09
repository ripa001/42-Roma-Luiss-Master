from LogisticRegression import LogisticRegression
from Dataset import Dataset
import sys
import numpy as np
import random

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

	else:
		print("Usage: python logreg_predict.py path/to/dataset.csv")

if __name__ == "__main__":
	main()