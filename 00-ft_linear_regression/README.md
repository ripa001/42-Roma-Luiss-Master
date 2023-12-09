# Ft_linear_regression
This project is an introduction to the linear regression. The goal is to use the linear regression with a given formula: ```price = θ0 + (θ1 * mileage)```. to estimate the price of a car. With thetas being the parameters of the linear function, calculated with the gradient descent algorithm: ```θ0 = θ0 - α * (1/m) * ∑(h(x) - y)``` and ```θ1 = θ1 - α * (1/m) * ∑((h(x) - y) * x)```.

In the data.csv file, you will find the data points used for the training. The first column is the mileage (km) and the second column is the price (euros). The goal is to find the linear function that fits these data points.

I achieved a precision score of 91.23% on the linear dataset.

## Usage
#### First activate the virtual environment
```make init```
#### Then train the model
```make train```
#### Finally, predict the price of a car with a given mileage
```make predict```

### Bonus
#### Plot the data points and the linear function
```make plot```
#### Program to calculate precision score
```make precision```


