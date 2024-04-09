# Make a script called histogram.[extension] which displays a histogram answering the
# next question :
# Which Hogwarts course has a homogeneous score distribution between all four houses?

# Care of magical creatures looks to be the most homogeneous course between all four houses.

import pandas as pd
import matplotlib.pyplot as plt
import sys

def histogram(df):

	numeric_cols = []
	for col in df.columns:
		if df[col].dtype == 'float64' or df[col].dtype == 'int64':
			numeric_cols.append(col)
	
	houses = df['Hogwarts House'].unique()
	plt.figure(figsize=(20, 20))
	for col in numeric_cols:
		plt.subplot(len(numeric_cols)//2, 2, numeric_cols.index(col)+1)
		plt.subplots_adjust(hspace=1)
		plt.title(col)
		for house in houses:
			plt.hist(df[df['Hogwarts House'] == house][col], alpha=0.5, label=house, bins=20)
		plt.legend()
	plt.savefig(f"srcs/plotting/plots/histogram.png")
	plt.close()
	

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
		histogram(df)

	else:
		print("Usage: python histogram.py path/to/dataset.csv")

					

