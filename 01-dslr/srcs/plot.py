import sys
from plotting import histogram, scatter_plot, pair_plot
import pandas as pd


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
		histogram.histogram(df)
		scatter_plot.scatter_plot(df)
		pair_plot.pair_plot(df)

	else:
		print("Usage: python histogram.py path/to/dataset.csv")
