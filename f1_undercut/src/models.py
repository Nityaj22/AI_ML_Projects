"""Baseline models for undercut success prediction."""

import pandas as pd
import numpy as np
import json
from typing import Tuple, Dict, Optional
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    roc_auc_score,
    confusion_matrix
)
import matplotlib.pyplot as plt


def train_logistic_baseline(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: Optional[pd.DataFrame] = None,
    y_val: Optional[pd.Series] = None
) -> Tuple[LogisticRegression, Dict]:
    """Train logistic regression baseline model.
    
    Args:
        X_train: Training features
        y_train: Training labels
        X_val: Validation features (optional)
        y_val: Validation labels (optional)
        
    Returns:
        Tuple of (trained model, metrics dictionary)
    """
    # Check if we have at least 2 classes
    unique_classes = y_train.unique()
    if len(unique_classes) < 2:
        # Only one class - can't train logistic regression
        # Return dummy model and metrics
        print(f"Warning: Only one class in training data ({unique_classes[0]}). Cannot train model.")
        model = None
        metrics = {
            "accuracy": 1.0 if len(unique_classes) == 1 else 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "roc_auc": 0.5
        }
        return model, metrics
    
    # Create and train model
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)
    
    # Predict on training set
    y_train_pred = model.predict(X_train)
    y_train_proba = model.predict_proba(X_train)[:, 1]
    
    # Compute metrics
    metrics = {
        "accuracy": accuracy_score(y_train, y_train_pred),
        "precision": precision_score(y_train, y_train_pred, zero_division=0),
        "recall": recall_score(y_train, y_train_pred, zero_division=0),
        "roc_auc": roc_auc_score(y_train, y_train_proba) if len(np.unique(y_train)) > 1 else 0.5
    }
    
    # If validation set provided, evaluate on it too
    if X_val is not None and y_val is not None:
        y_val_pred = model.predict(X_val)
        y_val_proba = model.predict_proba(X_val)[:, 1]
        
        metrics.update({
            "val_accuracy": accuracy_score(y_val, y_val_pred),
            "val_precision": precision_score(y_val, y_val_pred, zero_division=0),
            "val_recall": recall_score(y_val, y_val_pred, zero_division=0),
            "val_roc_auc": roc_auc_score(y_val, y_val_proba) if len(np.unique(y_val)) > 1 else 0.5
        })
    
    return model, metrics


def evaluate_model(
    model: LogisticRegression,
    X: pd.DataFrame,
    y: pd.Series,
    split_name: str = "test"
) -> Dict:
    """Evaluate model and return metrics.
    
    Metrics:
        - accuracy
        - precision
        - recall
        - roc_auc
        - confusion_matrix (as dict)
        
    Args:
        model: Trained model
        X: Features
        y: True labels
        split_name: Name of split (for metrics dict keys)
        
    Returns:
        Dictionary of metrics
    """
    # Predict
    y_pred = model.predict(X)
    y_proba = model.predict_proba(X)[:, 1]
    
    # Compute metrics
    metrics = {
        "accuracy": accuracy_score(y, y_pred),
        "precision": precision_score(y, y_pred, zero_division=0),
        "recall": recall_score(y, y_pred, zero_division=0),
        "roc_auc": roc_auc_score(y, y_proba) if len(np.unique(y)) > 1 else 0.5
    }
    
    # Confusion matrix
    cm = confusion_matrix(y, y_pred)
    metrics["confusion_matrix"] = {
        "tn": int(cm[0, 0]),
        "fp": int(cm[0, 1]),
        "fn": int(cm[1, 0]),
        "tp": int(cm[1, 1])
    }
    
    # Add split name prefix if provided
    if split_name:
        return {f"{split_name}_{k}": v for k, v in metrics.items()}
    
    return metrics


def plot_calibration_curve(
    model: LogisticRegression,
    X: pd.DataFrame,
    y: pd.Series,
    save_path: Optional[str] = None
) -> None:
    """Plot calibration curve (predicted vs actual probability).
    
    Shows if model is well-calibrated (predicted prob ≈ actual prob).
    
    Args:
        model: Trained model
        X: Features
        y: True labels
        save_path: Path to save plot (optional)
    """
    from sklearn.calibration import calibration_curve
    
    y_proba = model.predict_proba(X)[:, 1]
    fraction_of_positives, mean_predicted_value = calibration_curve(
        y, y_proba, n_bins=10
    )
    
    plt.figure(figsize=(8, 6))
    plt.plot(mean_predicted_value, fraction_of_positives, "s-", label="Model")
    plt.plot([0, 1], [0, 1], "k--", label="Perfect calibration")
    plt.xlabel("Mean Predicted Probability")
    plt.ylabel("Fraction of Positives")
    plt.title("Calibration Curve")
    plt.legend()
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=150)
        plt.close()
    else:
        plt.show()


def save_metrics(metrics: Dict, filepath: str) -> None:
    """Save metrics dictionary to JSON file.
    
    Args:
        metrics: Dictionary of metrics
        filepath: Path to save JSON file
    """
    # Convert numpy types to native Python types for JSON serialization
    metrics_serializable = {}
    for k, v in metrics.items():
        if isinstance(v, (np.integer, np.floating)):
            metrics_serializable[k] = float(v)
        elif isinstance(v, dict):
            metrics_serializable[k] = {k2: float(v2) if isinstance(v2, (np.integer, np.floating)) else v2 
                                      for k2, v2 in v.items()}
        else:
            metrics_serializable[k] = v
    
    with open(filepath, 'w') as f:
        json.dump(metrics_serializable, f, indent=2)

