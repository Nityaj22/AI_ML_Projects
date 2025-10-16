# Step 1: Import libraries
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# Step 2: Prepare the data
data = {
    'Hours_Studied': [1,2,3,4,5,6,7,8,9,10],
    'Sleep_Hours': [8,7,7,6,6,6,5,5,4,4],
    'Lectures_Attended': [2,3,3,4,5,5,6,6,7,8],
    'Score': [12,25,32,40,50,55,65,72,80,90]
}

df = pd.DataFrame(data)

# Step 3: Features and target
x = df[['Hours_Studied', 'Sleep_Hours', 'Lectures_Attended']]
y = df['Score']

# Step 4: Train-test split
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.28, random_state=42)

# Step 5: Scale the features
scaler = StandardScaler()
x_train_scaled = scaler.fit_transform(x_train)
x_test_scaled = scaler.transform(x_test)

# Step 6: Train the model
model = LinearRegression()
model.fit(x_train_scaled, y_train)

# Step 7: Predictions and evaluation
y_pred = model.predict(x_test_scaled)
print("Predictions:", y_pred)
print("MSE:", mean_squared_error(y_test, y_pred))
print("R2:", r2_score(y_test, y_pred))
print("MAE:", mean_absolute_error(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))

# Step 8: Visualize actual vs predicted
y_pred_full = model.predict(scaler.transform(x))
plt.scatter(y, y_pred_full, color='blue')
plt.xlabel('Actual Score')
plt.ylabel('Predicted Score')
plt.title('Actual vs Predicted Scores')
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r-')
plt.show()
