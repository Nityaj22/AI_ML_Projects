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
    # Generate daily random shocks
    Z = np.random.normal(0, 1, days)

    #GBM Formula: S_t+1 = S_t * exp((mu - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z)
    dt = 1  # Time step (1 day)
    price_path = np.zeros(days)
    price_path[0] = initial_investment

    for t in range(1, days):
        price_path[t] = price_path[t-1] * np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * Z[t])
    
    # Store final value
    final_values.append(price_path[-1])

    # Plot the first 10 price paths
    if i < 10:
        plt.plot(price_path, lw=1, alpha=0.6)
    
    
plt.title('Monte Carlo Simulation of Portfolio Using GBM')
plt.xlabel('Days')
plt.ylabel('Portfolio Value ($)')
plt.show()

#Results summary
final_values = np.array(final_values)
print(f"Expected portfolio value: ${np.mean(final_values):.2f}")
print(f"Max portfolio value: ${np.max(final_values):.2f}")
print(f"Min portfolio value: ${np.min(final_values):.2f}")