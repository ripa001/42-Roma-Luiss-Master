import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import sys
	
def pair_plot(dataset):
	#  change color palette
	sns.pairplot(dataset, kind='scatter', hue='Hogwarts House', palette='husl', markers=["o", "s", "D", "X"])
	plt.show()
	
	plt.savefig(f"srcs/plotting/plots/pair_plot.png")
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
		pair_plot(df)
	else:
		print("Usage: python pair_plot.py path/to/dataset.csv")