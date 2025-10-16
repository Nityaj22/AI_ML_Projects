import numpy as np
import matplotlib.pyplot as plt

#Parameters
initial_investment = 10000  # Initial investment amount
days = 252  # Number of trading days in a year
mu = 0.0005  # Expected daily return
sigma = 0.01  # Daily volatility
simulations = 1000  # Number of simulations

#Store final portfolio values
final_values = []

plt.figure(figsize=(10,6))

for i in range(simulations):
    # Generate daily returns
    daily_returns = np.random.normal(mu, sigma, days)
    
    # Calculate price path
    price_path = initial_investment * np.cumprod(1 + daily_returns)
    
    # Store final value
    final_values.append(price_path[-1])
    
    # Plot the price path
    if i < 10:
        plt.plot(price_path, lw=1, alpha=0.6)

plt.title('Monte Carlo Simulation of Trading Portfolio')
plt.xlabel('Days')
plt.ylabel('Portfolio Value ($)')
plt.show()

#Results summary
final_values = np.array(final_values)
print(f"Expected portfolio value: ${np.mean(final_values):.2f}")
print(f"Max portfolio value: ${np.max(final_values):.2f}")
print(f"Min portfolio value: ${np.min(final_values):.2f}")