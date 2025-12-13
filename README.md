# AI/ML Projects

A collection of data science and machine learning projects focusing on finance and Formula 1 analytics. This repository tracks my learning journey toward neural networks through hands-on, shippable projects.

---

## 📊 Projects Overview

### 1. Monte Carlo Portfolio Simulation Suite
**Type:** Financial Modeling | Stochastic Simulation  
**Tech Stack:** Python, NumPy, Matplotlib, yfinance

A comprehensive suite of Monte Carlo simulations for portfolio risk and return analysis using Geometric Brownian Motion (GBM).

**Features:**
- Basic portfolio simulation with configurable parameters
- Real stock data integration (NVDA, SPY, QQQ, DIA)
- Multi-asset probability analysis
- Risk metrics and probability calculations

**Files:**
- `Monte_Carlo_Models/montecarlo_trade1.py` - Basic portfolio simulation
- `Monte_Carlo_Models/Montecarlo_GBM_1.py` - GBM implementation
- `Monte_Carlo_Models/Montecarlo_GBM_RealStocks.py` - Real stock analysis
- `Monte_Carlo_Models/MonteCarlo_GBM_Stockprob.py` - Multi-asset comparison

---

### 2. F1 Undercut Strategy Analysis
**Type:** Sports Analytics | Data Science | Strategy Analysis  
**Tech Stack:** Python, FastF1 API, Pandas, Matplotlib, Seaborn

Analyzes Formula 1 undercut strategies using real race data. Identifies when drivers pit early to gain position and evaluates success rates.

**Deliverables:**
- **D1:** Exploratory Data Analysis (lap time distribution, gap analysis, pit timeline)
- **D2:** Tire degradation analysis with stint curves
- **D3:** Undercut success analysis with visualizations

**Key Features:**
- Real-time F1 data via FastF1 API
- Advanced data filtering (SC/VSC/Red Flag laps)
- Strategy pattern recognition
- Publication-ready visualizations

**Run locally:**
```powershell
# Activate environment
./f1_undercut/.venv/Scripts/Activate.ps1

# Generate EDA plots
python .\f1_undercut\quick_eda.py

# Run undercut analysis
python .\f1_undercut\undercut_analysis.py
```

**Change race:**
```python
# Edit defaults in quick_eda.py or undercut_analysis.py
# Example: main(2024, "Monaco Grand Prix")
```

---

### 3. F1 Race Replay System 🏎️
**Type:** Interactive Visualization | Real-time Data Processing  
**Tech Stack:** Python, FastF1, Arcade, NumPy, Pandas

An interactive F1 race replay system that visualizes race telemetry with real-time driver positions, leaderboard, weather data, and telemetry insights.

**Features:**
- **Race Replay:** Watch races unfold with real-time driver positions on rendered tracks
- **Interactive Controls:** Pause, rewind, fast-forward, speed adjustment (0.5x, 1x, 2x, 4x)
- **Live Leaderboard:** Real-time positions with tyre compound indicators
- **Driver Telemetry:** Speed, gear, DRS status, current lap for selected drivers
- **Weather Display:** Track temperature, air temperature, humidity, wind, rain state
- **Qualifying Support:** Q1/Q2/Q3 session replays with telemetry visualization

**Architecture:**
- **Data Processing:** Multiprocessing for parallel driver telemetry extraction
- **Resampling:** 25 FPS timeline with interpolation for smooth playback
- **Caching:** Precomputed telemetry data for fast subsequent runs
- **Component-based UI:** Modular, reusable UI components

**Run locally:**
```powershell
# Activate environment
./F1_Race_Replay/.venv/Scripts/Activate.ps1

# Run race replay (default: 2025, Round 12 - British GP)
python F1_Race_Replay/main.py

# Run specific race
python F1_Race_Replay/main.py --year 2024 --round 1

# Run qualifying session
python F1_Race_Replay/main.py --year 2024 --round 1 --qualifying

# Run sprint
python F1_Race_Replay/main.py --year 2024 --round 5 --sprint
```

**Controls:**
- `SPACE` - Pause/Resume
- `←/→` - Rewind/Fast Forward
- `↑/↓` - Speed adjustment
- `R` - Restart
- Click driver in leaderboard to view telemetry

**Folder Structure:**
```
F1_Race_Replay/
├── main.py                    # Entry point
├── src/
│   ├── f1_data.py            # Telemetry processing & frame generation
│   ├── arcade_replay.py      # Visualization entry point
│   ├── ui_components.py      # UI components (leaderboard, weather, etc.)
│   ├── interfaces/
│   │   ├── race_replay.py    # Race replay window
│   │   └── qualifying.py     # Qualifying replay window
│   └── lib/
│       ├── tyres.py          # Tyre compound utilities
│       └── time.py           # Time formatting utilities
├── images/tyres/             # Tyre compound icons
└── computed_data/            # Cached telemetry (gitignored)
```

---

## 🛠️ Tech Stack

**Core:**
- Python 3.8+
- Pandas, NumPy
- Matplotlib, Seaborn

**F1 Projects:**
- FastF1 API
- Arcade (for race replay visualization)
- Pyglet

**Finance Projects:**
- yfinance
- SciPy

---

## 📈 Project Statistics

- **Total Projects:** 3 major projects (7 sub-projects)
- **Data Sources:** Real market data (yfinance), Real F1 race data (FastF1 API)
- **ML Techniques:** Linear Regression, Monte Carlo Simulation, Feature Engineering
- **Visualizations:** 15+ publication-ready charts and interactive replays
- **Code Quality:** Modular, documented, production-ready structure

---

## 🎯 Learning Path

This repository follows a structured learning approach:

1. **Foundation Projects** (Monte Carlo, Basic ML)
   - Statistical modeling
   - Data visualization
   - Real-world data integration

2. **Intermediate Projects** (F1 Analytics)
   - Advanced data processing
   - Feature engineering
   - Strategy analysis
   - Interactive visualizations

3. **Future: Neural Networks**
   - EV demand forecasting → NN
   - F1 undercut prediction → Sequence models
   - Time series forecasting

---

## 📝 Notes

- All F1 projects filter out Safety Car, Virtual Safety Car, and Red Flag laps for accurate analysis
- Telemetry data is cached locally for faster subsequent runs
- Projects use virtual environments (`.venv/`) for dependency management

---

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

No copyright infringement intended. Formula 1 and related trademarks are the property of their respective owners. All data used is sourced from publicly available APIs and is used for educational and non-commercial purposes only.

