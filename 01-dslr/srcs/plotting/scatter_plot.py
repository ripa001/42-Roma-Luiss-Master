
import pandas as pd
import matplotlib.pyplot as plt
import sys
import numpy as np

def scatter_plot(df):
	numeric_cols = df.select_dtypes(include='number').columns.tolist()
	plt.figure(figsize=(60, 60))
	for i, col1 in enumerate(numeric_cols):
		for j, col2 in enumerate(numeric_cols[i+1:]):
			plt.subplot(len(numeric_cols), len(numeric_cols), i*len(numeric_cols)+j+1)
			plt.title(f"{col1} vs {col2}")
			plt.scatter(df[col1], df[col2], alpha=0.5)
	plt.savefig(f"srcs/plotting/plots/scatter_plot.png")
	plt.show()
	plt.close()
	find_similar(df)

def find_similar(df):
	numeric_dataset = df.select_dtypes(include='number')
	correlation_matrix = numeric_dataset.corr().abs()
	correlation_matrix.loc[:, :] = np.tril(correlation_matrix, k=-1)
	most_similar = correlation_matrix.unstack().sort_values(ascending=False).drop_duplicates()
	print("Le due features più simili sono:",most_similar.index[0])

if __name__ == "__main__":
	if len(sys.argv) == 2:
		
		try:
			df = pd.read_csv(sys.argv[1])
		except FileNotFoundError:
			print("File not found")
			exit()
		except Exception as e:
			print("Error: ", e)
			exit()
		scatter_plot(df)

	else:
		print("Usage: python scatter_plot.py path/to/dataset.csv")
