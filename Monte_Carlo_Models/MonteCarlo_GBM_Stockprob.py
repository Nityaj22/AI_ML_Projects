import yfinance as yf
import numpy as np
import pandas as pd
from tqdm import tqdm

# -------------------------------
# PARAMETERS
# -------------------------------
tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "XOM"]  # Example — can extend to 100
n_simulations = 10000
n_days = 252

results = []

# -------------------------------
# Monte Carlo Function
# -------------------------------
def monte_carlo_prob_up(ticker):
    try:
        data = yf.download(ticker, period="1y", interval="1d", progress=False)
        if data.empty:
            return None
        
        data['Return'] = data['Close'].pct_change()
        mu = data['Return'].mean()
        sigma = data['Return'].std()

        last_price = float(data['Close'].iloc[-1])
        drift = mu - (0.5 * sigma**2)
        Z = np.random.normal(0, 1, (n_days, n_simulations))
        price_paths = last_price * np.exp(np.cumsum(drift + sigma * Z, axis=0))
        final_prices = price_paths[-1]

        prob_up = np.mean(final_prices > last_price)
        expected_price = np.mean(final_prices)
        max_price = np.max(final_prices)
        min_price = np.min(final_prices)

        return (ticker, prob_up, expected_price, max_price, min_price)

    except Exception as e:
        return None

# -------------------------------
# Loop through tickers
# -------------------------------
for ticker in tqdm(tickers):
    res = monte_carlo_prob_up(ticker)
    if res:
        results.append(res)

# -------------------------------
# Sort by probability
# -------------------------------
df = pd.DataFrame(results, columns=["Ticker", "Prob_Up", "Expected_Price", "Max_Price", "Min_Price"])
df = df.sort_values(by="Prob_Up", ascending=False).reset_index(drop=True)

print(df.head(10))
