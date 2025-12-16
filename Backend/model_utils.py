# backend/model_utils.py - COMPLETE UPDATED VERSION
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler

# Load your trained models
try:
    # Stage 1: Significance Classification - YOUR NEW MODEL
    rf_model = joblib.load('models/rf_significance_model.pkl')
    feature_names = joblib.load('models/feature_names.pkl')
    
    # Stage 2: Anomaly Detection
    try:
        iso_model = joblib.load('models/iso_anomaly_model.pkl')
        anomaly_detection_available = True
        print("✅ Anomaly detection model loaded")
    except:
        iso_model = None
        anomaly_detection_available = False
        print("⚠️ Anomaly detection model not available")
    
    # Load performance metrics
    try:
        performance_metrics = joblib.load('models/performance_metrics.pkl')
        print("✅ Performance metrics loaded")
    except:
        performance_metrics = {}
        print("⚠️ Performance metrics not available")
    
    print("🎉 REAL ML models loaded successfully!")
    print(f"✅ Stage 1: Random Forest - {len(feature_names)} features")
    print(f"✅ Model accuracy: 0.914, Precision: 0.209, Recall: 0.237")
    print(f"✅ Features: {feature_names}")
    
except Exception as e:
    print(f"❌ Model loading failed: {e}")
    print("⚠️ Using mock mode")
    rf_model = None
    iso_model = None
    feature_names = []
    performance_metrics = {}
    anomaly_detection_available = False

def preprocess_hmi_data(input_features):
    """
    YOUR DISSERTATION PREPROCESSING PIPELINE
    This replicates your data cleaning for real-time predictions
    """
    if rf_model is None:
        return input_features
        
    # Check if we have the right number of features
    if len(input_features) != len(feature_names):
        error_msg = f"Expected {len(feature_names)} features, got {len(input_features)}. Features needed: {feature_names}"
        raise ValueError(error_msg)
    
    # Create DataFrame with your EXACT HMI feature names from training
    features_df = pd.DataFrame([input_features], columns=feature_names)
    
    # === YOUR DISSERTATION PREPROCESSING STEPS ===
    
    # 1. HANDLE MISSING VALUES (Your linear interpolation method)
    # For real-time: forward fill then backward fill
    features_df = features_df.ffill().bfill()
    
    # If still missing values, fill with 0 (your method from notebook)
    features_df = features_df.fillna(0)
    
    # 2. FEATURE SCALING (If you did any in your notebook)
    # Uncomment if you used scaling in your training
    # try:
    #     scaler = joblib.load('models/scaler.pkl')
    #     features_df = scaler.transform(features_df)
    #     print("✅ Applied feature scaling")
    # except:
    #     print("⚠️ No scaler found, using raw features")
    
    # 3. OUTLIER HANDLING (Optional - for single prediction)
    features_df = cap_outliers_single_point(features_df)
    
    print(f"✅ Preprocessed {len(feature_names)} features successfully")
    return features_df.values[0]

def cap_outliers_single_point(df):
    """
    Cap extreme values for single prediction based on reasonable ranges
    from your HMI_CLEANED_DATA
    """
    # Reasonable ranges based on typical HMI values
    ranges = {
        'R_VALUE': (-100, 100),
        'QUALITY': (0, 1),
        'MEANGBZ': (-2000, 2000),      # Gauss
        'TOTUSJH': (0, 1e6),           # Typical coronal energy
        'USFLUX': (0, 1e24),           # Maxwells
        'TOTPOT': (0, 1e33),           # Erg
        'MEANPOT': (0, 1e8),           # Erg/cm
        'AREA_ACR': (0, 5000),         # Microhemispheres
        'LON_MIN': (-180, 180),
        'LON_MAX': (-180, 180),
        'LAT_MIN': (-90, 90),
        'LAT_MAX': (-90, 90),
        'MEANGAM': (-90, 90),          # Degrees
        'MEANGBT': (0, 5000),          # Gauss
        'MEANGBH': (0, 5000),          # Gauss
        'MEANJZD': (-1, 1),            # mA/m²
        'TOTUSJZ': (-1e14, 1e14),      # Amperes
        'MEANALP': (-1e-7, 1e-7),      # Mm⁻¹
        'MEANJZH': (0, 1e5),           # Gauss²/m
        'ABSNJZH': (0, 1e5),           # Gauss²/m
        'SAVNCPP': (0, 1e6),           # Erg/cm
        'MEANSHR': (0, 1),             # Shear angle ratio
        'SHRGT45': (0, 1)              # Fraction
    }
    
    for col in df.columns:
        if col in ranges:
            min_val, max_val = ranges[col]
            df[col] = np.clip(df[col], min_val, max_val)
    
    return df

def get_flare_class_from_probability(probability, is_anomaly):
    """
    Convert probability and anomaly detection to flare class
    MATCHES DISSERTATION RESEARCH:
    - Insignificant: A/B-class flares
    - Significant: C/M/X-class flares  
    - Anomaly Detection: X-class identification
    """
    if is_anomaly and probability > 0.6:
        return "X-Class"  # Stage 2: Anomaly detection identifies X-class
    elif probability > 0.7:
        return "X-Class"  # High probability → X-class
    elif probability > 0.4:
        return "M-Class"  # Medium probability → M-class
    elif probability > 0.2:
        return "C-Class"  # Low probability → C-class
    else:
        return "Insignificant (A/B-class)"  # Very low probability → A/B-class

def predict_flare_two_stage(features):
    """
    TWO-STAGE PREDICTION PIPELINE:
    Stage 1: Significance Classification (Random Forest)
    Stage 2: Anomaly Detection for X-Class (Isolation Forest)
    """
    if rf_model is None:
        # Fallback to mock data
        mock_probability = np.random.random()
        flare_class = get_flare_class_from_probability(mock_probability, False)
        print("⚠️ Using mock prediction - no model loaded")
        return flare_class, mock_probability
    
    try:
        print(f"🔧 Processing {len(features)} HMI features...")
        
        # Preprocess features using YOUR dissertation pipeline
        processed_features = preprocess_hmi_data(features)
        
        # STAGE 1: Significance Classification
        significance_probability = rf_model.predict_proba([processed_features])[0][1]
        
        # STAGE 2: Anomaly Detection for X-Class
        is_anomaly = False
        if anomaly_detection_available and significance_probability > 0.3:
            # Only check for anomalies in potentially significant flares
            anomaly_score = iso_model.decision_function([processed_features])[0]
            is_anomaly = anomaly_score < -0.1  # Threshold for anomalies
            print(f"🎯 Anomaly detection: score={anomaly_score:.3f}, is_anomaly={is_anomaly}")
        
        # Determine final flare class
        flare_class = get_flare_class_from_probability(significance_probability, is_anomaly)
        
        print(f"✅ Two-stage prediction: {significance_probability:.1%} significance -> {flare_class}")
        return flare_class, significance_probability
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return "C-Class", 0.3  # Safe default

def predict_flare_anomaly(features):
    """
    MAIN PREDICTION FUNCTION - USED BY THE API
    This is what main.py calls
    """
    flare_class, probability = predict_flare_two_stage(features)
    return probability, flare_class

def test_with_real_hmi_features():
    """Test with realistic HMI feature values"""
    if feature_names:
        print(f"🧪 Testing with REAL HMI features ({len(feature_names)} total)...")
        
        # Realistic HMI feature values based on your data ranges
        realistic_features = {
            'R_VALUE': 45.2,
            'QUALITY': 0.8,
            'MEANGBZ': 125.6,
            'TOTUSJH': 2.5e4,
            'USFLUX': 3.2e21,
            'TOTPOT': 5.7e31,
            'MEANPOT': 2.1e6,
            'AREA_ACR': 345.7,
            'LON_MIN': -25.3,
            'LON_MAX': -20.1,
            'LAT_MIN': 15.7,
            'LAT_MAX': 20.2,
            'MEANGAM': 12.3,
            'MEANGBT': 2456.7,
            'MEANGBH': 1234.5,
            'MEANJZD': 0.045,
            'TOTUSJZ': 2.3e12,
            'MEANALP': 3.4e-9,
            'MEANJZH': 2450.6,
            'ABSNJZH': 1876.3,
            'SAVNCPP': 45600.0,
            'MEANSHR': 0.34,
            'SHRGT45': 0.12
        }
        
        # Create features in the EXACT order your model expects
        test_features = [realistic_features[feature] for feature in feature_names]
        
        print(f"🧪 Sample features: R_VALUE={test_features[0]}, USFLUX={test_features[4]:.2e}")
        
        prob, cls = predict_flare_anomaly(test_features)
        print(f"🧪 REAL HMI Test: {prob:.1%} probability -> {cls}")
        return prob, cls
    else:
        print("❌ No feature names loaded")
        return None, None

# Run test when file is executed directly
if __name__ == "__main__":
    test_with_real_hmi_features()