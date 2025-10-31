import yfinance as yf
import numpy as np
import matplotlib.pyplot as plt

# Fetch historical data for Apple (AAPL)
ticker = "NVDA"
data = yf.download(ticker, period="1y", interval="1d")

# Calculate daily returns
data['Daily Return'] = data['Close'].pct_change()
data = data.dropna()

# Estimate daily return (mu) and daily volatility (sigma)
mu = data['Daily Return'].mean()
sigma = data['Daily Return'].std()

print(f"Estimated daily return (mu): {mu:.5f}")
print(f"Estimated daily volatility (sigma): {sigma:.5f}")

# Parameters
initial_investment = 10000  # Initial investment
days = 252  # Number of trading days
simulations = 1000  # Number of simulations

# Store final portfolio values
final_values = []

plt.figure(figsize=(10,6))

for i in range(simulations):
    # Generate daily random shocks
    Z = np.random.normal(0, 1, days)
    
    # GBM formula: S_t+1 = S_t * exp((mu - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z)
    dt = 1/252  # 1 day
    price_path = np.zeros(days)
    last_price = float(data['Close'].iloc[-1])  # Convert to float
    price_path[0] = last_price  # Start from the last observed price

    for t in range(1, days):
        price_path[t] = price_path[t-1] * np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * Z[t])
    
    final_values.append(price_path[-1])
    
    # Plot first 10 paths
    if i < 10:
        plt.plot(price_path, lw=1, alpha=0.6)

plt.title(f'Monte Carlo Simulation of {ticker} Portfolio Using GBM')
plt.xlabel('Days')
plt.ylabel('Portfolio Value ($)')
plt.show()

# Results summary
final_values = np.array(final_values)
print(f"Expected portfolio value: ${np.mean(final_values):.2f}")
print(f"Max portfolio value: ${np.max(final_values):.2f}")
print(f"Min portfolio value: ${np.min(final_values):.2f}")

# Calculate probability of going up or down
num_up = np.sum(final_values > last_price)
num_down = np.sum(final_values <= last_price)


prob_up = num_up / simulations
prob_down = num_down / simulations

print(f"Probability that portfolio goes UP: {prob_up:.2%}")
print(f"Probability that portfolio goes DOWN: {prob_down:.2%}")