# backend/train_models.py
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import warnings
warnings.filterwarnings('ignore')


def train_flare_models():
    """
    TRAIN THE ACTUAL MODELS USING YOUR HMI DATASET
    This replicates your dissertation model training
    """
    print("🚀 STARTING MODEL TRAINING...")
    
    try:
        # Load your cleaned HMI data
        # Replace this with your actual HMI_CLEANED_DATA.csv path
        df = pd.read_csv('HMI_CLEANED_DATA.csv')
        print(f"✅ Loaded dataset with {len(df)} samples and {len(df.columns)} features")
        
        # Prepare features and target
        # Assuming your target column is 'flare_category' or similar
        feature_columns = [
            'R_VALUE', 'QUALITY', 'MEANGBZ', 'TOTUSJH', 'USFLUX', 'TOTPOT', 'MEANPOT', 
            'AREA_ACR', 'LON_MIN', 'LON_MAX', 'LAT_MIN', 'LAT_MAX', 'MEANGAM', 'MEANGBT', 
            'MEANGBH', 'MEANJZD', 'TOTUSJZ', 'MEANALP', 'MEANJZH', 'ABSNJZH', 'SAVNCPP', 
            'MEANSHR', 'SHRGT45'
        ]
        
        # Check which features exist in your data
        available_features = [col for col in feature_columns if col in df.columns]
        print(f"✅ Using {len(available_features)} available features")
        
        X = df[available_features]
        
        # Create target variable: 1 for significant flares (M/X class), 0 for insignificant
        # Adjust this based on your actual target column
        if 'flare_category' in df.columns:
            y_significant = (df['flare_category'].isin(['M', 'X'])).astype(int)
        else:
            # Fallback: create dummy target for demonstration
            print("⚠️ No flare_category column found, creating dummy target")
            y_significant = (np.random.random(len(df)) > 0.8).astype(int)
        
        print(f"✅ Target distribution: {y_significant.value_counts().to_dict()}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_significant, test_size=0.2, random_state=42, stratify=y_significant
        )
        
        # Train Stage 1: Random Forest for Significance Classification
        print("🔧 Training Random Forest (Significance Classification)...")
        rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced'
        )
        
        rf_model.fit(X_train, y_train)
        
        # Evaluate Stage 1
        y_pred = rf_model.predict(X_test)
        y_prob = rf_model.predict_proba(X_test)[:, 1]
        
        rf_accuracy = accuracy_score(y_test, y_pred)
        rf_precision = precision_score(y_test, y_pred)
        rf_recall = recall_score(y_test, y_pred)
        rf_f1 = f1_score(y_test, y_pred)
        rf_auc = roc_auc_score(y_test, y_prob)
        
        print(f"✅ Random Forest Performance:")
        print(f"   Accuracy:  {rf_accuracy:.3f}")
        print(f"   Precision: {rf_precision:.3f}")
        print(f"   Recall:    {rf_recall:.3f}")
        print(f"   F1-Score:  {rf_f1:.3f}")
        print(f"   AUC-ROC:   {rf_auc:.3f}")
        
        # Train Stage 2: Isolation Forest for X-Class Anomaly Detection
        print("🔧 Training Isolation Forest (X-Class Anomaly Detection)...")
        
        # Use only significant flares for anomaly detection
        X_significant = X_train[y_train == 1]
        
        if len(X_significant) > 0:
            iso_forest = IsolationForest(
                contamination=0.1,  # Expect 10% anomalies among significant flares
                random_state=42
            )
            iso_forest.fit(X_significant)
            print(f"✅ Isolation Forest trained on {len(X_significant)} significant flares")
        else:
            print("⚠️ No significant flares for anomaly detection training")
            iso_forest = None
        
        # Save models and metadata
        print("💾 Saving models and metadata...")
        
        # Create models directory if it doesn't exist
        import os
        os.makedirs('models', exist_ok=True)
        
        # Save Stage 1 model
        joblib.dump(rf_model, 'models/rf_significance_model.pkl')
        
        # Save Stage 2 model if trained
        if iso_forest:
            joblib.dump(iso_forest, 'models/iso_anomaly_model.pkl')
        
        # Save feature names and scaler
        joblib.dump(available_features, 'models/feature_names.pkl')
        
        # Save performance metrics
        metrics = {
            'accuracy': rf_accuracy,
            'precision': rf_precision,
            'recall': rf_recall,
            'f1_score': rf_f1,
            'auc_roc': rf_auc,
            'model_type': 'Random Forest + Isolation Forest Ensemble',
            'training_date': pd.Timestamp.now().strftime('%Y-%m-%d'),
            'features_used': len(available_features),
            'significant_flares': len(X_significant)
        }
        
        joblib.dump(metrics, 'models/performance_metrics.pkl')
        
        print("🎉 MODEL TRAINING COMPLETED SUCCESSFULLY!")
        print(f"📊 Final Model Performance:")
        for metric, value in metrics.items():
            if isinstance(value, float):
                print(f"   {metric}: {value:.3f}")
            else:
                print(f"   {metric}: {value}")
                
        return metrics
        
    except Exception as e:
        print(f"❌ Model training failed: {e}")
        return None

if __name__ == "__main__":
    train_flare_models()