import pandas as pd
import csv
import sys

def my_min(lst):
	m = lst[0]
	for item in lst:
		if item < m:
			m = item
	return m

def my_max(lst):
	m = lst[0]
	for item in lst:
		if item > m:
			m = item
	return m

def describe(file):
	try:
		df = pd.read_csv(file)
	except FileNotFoundError:
		print("File not found")
		return
	except Exception as e:
		print("Error: ", e)
		return
	numeric_cols = []
	for col in df.columns:
		if df[col].dtype == 'float64' or df[col].dtype == 'int64':
			numeric_cols.append(col)

	describe_df = pd.DataFrame(columns=numeric_cols)
	count, mean, std, _min, percentile_25, percentile_50, percentile_75, _max = {}, {}, {}, {}, {}, {}, {}, {}
	skewness, kurtosis = {}, {} #bonusses
	for col in numeric_cols:
		item_df = [item for item in df[col] if "nan" not in str(item)]
		count[col] = len(item_df)
		if count[col] == 0:
			count[col] = "NaN"
			mean[col] = "NaN"
			std[col] = "NaN"
			_min[col] = "NaN"
			percentile_25[col] = "NaN"
			percentile_50[col] = "NaN"
			percentile_75[col] = "NaN"
			_max[col] = "NaN"
			skewness[col] = "NaN"
			kurtosis[col] = "NaN"
			continue
		mean[col] = sum(item_df) / count[col]
		std[col] = ((sum([((item - mean[col]) ** 2) for item in item_df]) / count[col]) ** 0.5)
		_min[col] = my_min(item_df)
		sorted_df = sorted(item_df)
		percentile_25[col] = sorted_df[round(len(sorted_df)*0.25)]
		percentile_50[col] = sorted_df[round(len(sorted_df)*0.5)]
		percentile_75[col] = sorted_df[round(len(sorted_df)*0.7)]
		_max[col] = my_max(item_df)
		skewness[col] = sum([((item - mean[col]) ** 3) for item in item_df]) / ((count[col] - 1) * (std[col] ** 3)) # simmetria
		fourth_moment = sum([((item - mean[col]) ** 4) for item in item_df]) / count[col]
		second_moment = sum([((item - mean[col]) ** 2) for item in item_df]) / count[col]
		kurtosis[col] = fourth_moment / (second_moment ** 2) # piattezza
	describe_df.loc['Count'] = count
	describe_df.loc['Mean'] = mean
	describe_df.loc['Std'] = std
	describe_df.loc['Min'] = _min
	describe_df.loc['25%'] = percentile_25
	describe_df.loc['50%'] = percentile_50
	describe_df.loc['75%'] = percentile_75
	describe_df.loc['Max'] = _max
	describe_df.loc['Skewness'] = skewness
	describe_df.loc['Kurtosis'] = kurtosis

	print(describe_df)

if __name__ == '__main__':
	if len(sys.argv) == 2:
		describe(sys.argv[1])
		# df = pd.read_csv(sys.argv[1])
		# print(df.describe())

	else:
		print("Usage: python describe.py path/to/dataset.csv")

					

