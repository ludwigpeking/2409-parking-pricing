import pandas as pd

# Load the original and cleaned datasets
original_df = pd.read_excel('survey_cn.xlsx')
cleaned_df = pd.read_excel('df.xlsx')

# Identify new columns to merge from the original dataset
new_columns = [col for col in original_df.columns if col not in cleaned_df.columns]

# Merge the new columns into the cleaned dataset based on alignment features
cleaned_df = cleaned_df.merge(original_df[['room-number', 'total-price', 'occupation'] + new_columns],
                               on=['room-number', 'total-price', 'occupation'],
                               how='left')

# Save the updated cleaned DataFrame to a new Excel file
cleaned_df.to_excel('merge.xlsx', index=False)
