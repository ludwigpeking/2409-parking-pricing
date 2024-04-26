from pyautocad import Autocad, APoint
import pandas as pd

# Initialize AutoCAD application
acad = Autocad(create_if_not_exists=True)

# Load Excel data
excel_file = 'merge.xlsx'
df = pd.read_excel(excel_file, sheet_name='Sheet1')

# Function to find and update parking prices in the AutoCAD file
def update_parking_price(acad, df):
        for text in acad.iter_objects('Text'):
                if text.Layer == 'a_parking_number':
                        parking_number = text.TextString
                        # Find matching row in DataFrame
                        match = df[df['first-lot'] == parking_number]
                        if not match.empty:
                                parking_price = match['first-lot-price'].values[0]
                                formatted_price = round(parking_price / 10000, 2)
                                insertion_point = APoint(text.InsertionPoint[0], text.InsertionPoint[1]-600)  # Create APoint for insertion
                                try:
                                        price_text = acad.model.AddText(str(formatted_price), insertion_point, text.Height)
                                        price_text.Layer = 'a_parking_price'
                                        add_solid_background(acad, insertion_point,  'a_parking_sales_mark')
                                except Exception as e:
                                        print(f"Error adding text: {e}")
                        match = df[df['second-lot'] == parking_number]
                        if not match.empty:
                                parking_price = match['second-lot-price'].values[0]
                                formatted_price = round(parking_price / 10000, 2)
                                insertion_point = APoint(text.InsertionPoint[0], text.InsertionPoint[1]-600)  # Create APoint for insertion
                                try:
                                        price_text = acad.model.AddText(str(formatted_price), insertion_point, text.Height)
                                        price_text.Layer = 'a_parking_price'
                                        add_solid_background(acad, insertion_point, 'a_parking_sales_mark')
                                except Exception as e:
                                        print(f"Error adding text: {e}")
                        match = df[df['third-lot'] == parking_number]
                        if not match.empty:
                                parking_price = match['third-lot-price'].values[0]
                                formatted_price = round(parking_price / 10000, 2)
                                insertion_point = APoint(text.InsertionPoint[0], text.InsertionPoint[1]-600)  # Create APoint for insertion
                                try:
                                        price_text = acad.model.AddText(str(formatted_price), insertion_point, text.Height)
                                        price_text.Layer = 'a_parking_price'
                                        add_solid_background(acad, insertion_point, 'a_parking_sales_mark')

                                except Exception as e:
                                        print(f"Error adding text: {e}")
        
def add_solid_background(acad, insertion_point, layer_name):
    # Estimate the width based on character count (rough estimation)
    width = 2000
    # Calculate corner points for the solid
    p1 = APoint(insertion_point.x,  insertion_point.y)
    p2 = APoint(insertion_point.x +width, insertion_point.y )
    p3 = APoint(insertion_point.x , insertion_point.y +width)
    p4 = APoint(insertion_point.x+width, insertion_point.y +width)
    # Add solid to the drawing
    solid = acad.model.AddSolid(p1, p2, p3, p4)
    solid.Layer = layer_name
    return solid

# Execute the function
update_parking_price(acad, df)
