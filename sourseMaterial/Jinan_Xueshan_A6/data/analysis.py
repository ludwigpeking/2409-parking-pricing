import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Model
from keras.layers import Input, Dense
from keras.optimizers import Adam

# Load your dataset
df = pd.read_excel('df.xlsx')

# Fill NaN values for numerical columns with 0 or appropriate value
df['monthly-repay'].fillna(0, inplace=True)

# For categorical columns with missing values, replace with 'unknown'
categorical_columns = ['reason-not-buying', 'occupation', 'loan', 'purpose-buying-home', 'commute-mean', 'lot-buying-style', 'expected-buying-time', 'situation-category']
df[categorical_columns] = df[categorical_columns].fillna('unknown')

# Selecting categorical columns (ensure this matches your dataset's structure)
categorical_data = df[categorical_columns]

encoder = OneHotEncoder(sparse=False)
categorical_encoded = encoder.fit_transform(categorical_data)
categorical_encoded_df = pd.DataFrame(categorical_encoded, columns=encoder.get_feature_names_out(categorical_columns))

# Combine encoded categorical data with the rest of the dataset (excluding original categorical columns)
df_numeric = df.drop(columns=categorical_columns)
df_preprocessed = pd.concat([df_numeric, categorical_encoded_df], axis=1)

df['opening-buying'] = df['opening-buying'].map({'yes': 1, 'no': 0})
df['opening-buying'].fillna(-1, inplace=True)  # Fill NaNs with -1 or an appropriate value before conversion
df_preprocessed['opening-buying'] = df['opening-buying'].astype(int)

# Assuming 'date-purchasing' is a timestamp column, and it's not needed
if 'date-purchasing' in df_preprocessed.columns:
    df_preprocessed = df_preprocessed.drop(columns=['date-purchasing'])

# Assuming df_preprocessed is your final DataFrame after all preprocessing
X = df_preprocessed  # Features

# Assuming df_preprocessed is your final DataFrame after all preprocessing
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(df_preprocessed)
X_train, X_test = train_test_split(X_scaled, test_size=0.1, random_state=42)

# Splitting the data
X_train, X_test = train_test_split(X, test_size=0.1, random_state=42)

# Define the autoencoder architecture
input_dim = X_train.shape[1]  # Adjust based on your preprocessed data

# Input layer
input_layer = Input(shape=(input_dim,))

# Encoder part
encoder_layer_1 = Dense(128, activation='relu')(input_layer)
encoder_layer_2 = Dense(64, activation='relu')(encoder_layer_1)

# Decoder part
decoder_layer_1 = Dense(128, activation='relu')(encoder_layer_2)
decoder_output = Dense(input_dim, activation='sigmoid')(decoder_layer_1)

# Autoencoder model
autoencoder = Model(inputs=input_layer, outputs=decoder_output)

# Compile the model
autoencoder.compile(optimizer=Adam(learning_rate=0.0001), loss='mean_squared_error')


# Train the autoencoder
history = autoencoder.fit(X_train, X_train,
                          epochs=50,
                          batch_size=32,
                          shuffle=True,
                          validation_data=(X_test, X_test),
                          verbose=2)
# Calculate the reconstruction loss on the test set
test_loss = autoencoder.evaluate(X_test, X_test, verbose=0)
print(f"Test Reconstruction Loss: {test_loss}")

# Check for NaN values in the dataset
if df_preprocessed.isnull().values.any():
    print("Dataset contains NaN values. Consider filling or removing them.")
else:
    print("No NaN values in the dataset.")

# Check for infinite values in the dataset
if np.isinf(df_preprocessed.values).any():
    print("Dataset contains infinite values. Consider replacing them.")
else:
    print("No infinite values in the dataset.")

