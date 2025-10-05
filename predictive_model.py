import pandas as pd
import geopandas as gpd
import rasterio
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import folium
from folium.plugins import HeatMap
from scipy.spatial.distance import cdist
# --- 1. Data Collection and Preparation ---
# Load synthetic shark tag data
shark_data = pd.read_csv('synthetic_shark_data.csv')

# Load eddy data from SWOT as a GeoJSON file
eddies = gpd.read_file('swot_eddies.geojson')

# Create a GeoDataFrame from the shark data using the correct column names
shark_gdf = gpd.GeoDataFrame(shark_data, geometry=gpd.points_from_xy(shark_data['Longitude (°E)'], shark_data['Latitude (°N)']))

# --- 2. Feature Engineering ---
# Create a 'distance to eddy' feature for each shark location
shark_coords = np.array(list(zip(shark_gdf.geometry.x, shark_gdf.geometry.y)))
eddy_coords = np.array(list(zip(eddies.geometry.x, eddies.geometry.y)))
distances = cdist(shark_coords, eddy_coords)
shark_gdf['min_distance_to_eddy'] = distances.min(axis=1)

# Encode 'feeding event' from the Hydra-Tag data
shark_gdf['feeding'] = shark_gdf['Hydra-Tag Data (Feeding Event/Prey)'].apply(lambda x: 1 if 'YES' in str(x) else 0)

# --- 3. Model Training ---
# Define features (X) and target (y)
X = shark_gdf[['Temperature (°C)', 'PACE Chlorophyll (μg/L)', 'min_distance_to_eddy']]
y = shark_gdf['feeding']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Create and train the model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Make predictions and evaluate the model
y_pred = model.predict(X_test)
print(f"Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# --- 4. Making Predictions and Visualization ---
# Create a grid of points for a specific area
lon_range = np.linspace(-80, -60, 50)
lat_range = np.linspace(30, 45, 50)
lon_grid, lat_grid = np.meshgrid(lon_range, lat_range)
prediction_points = pd.DataFrame({'Longitude': lon_grid.flatten(), 'Latitude': lat_grid.flatten()})

# Load the dummy GeoTIFFs to use in prediction
with rasterio.open('sst_data.tif') as src:
    sst_array = src.read(1)
    transform = src.transform
    
with rasterio.open('pace_chlorophyll.tif') as src:
    chlorophyll_array = src.read(1)

# A function to get raster value at a given coordinate
def get_raster_value(coords, raster_array, transform):
    row, col = rasterio.transform.rowcol(transform, coords[:, 0], coords[:, 1])
    # Handle out-of-bounds indices by returning a default value
    valid_indices = (row >= 0) & (row < raster_array.shape[0]) & (col >= 0) & (col < raster_array.shape[1])
    values = np.zeros(len(coords))
    values[valid_indices] = raster_array[row[valid_indices], col[valid_indices]]
    return values

# Get satellite data for each prediction point
coords = prediction_points[['Longitude', 'Latitude']].to_numpy()
prediction_points['Temperature (°C)'] = get_raster_value(coords, sst_array, transform)
prediction_points['PACE Chlorophyll (μg/L)'] = get_raster_value(coords, chlorophyll_array, transform)

# Calculate distance to nearest eddy for each prediction point
grid_coords = np.array(list(zip(prediction_points.Longitude, prediction_points.Latitude)))
grid_distances = cdist(grid_coords, eddy_coords)
prediction_points['min_distance_to_eddy'] = grid_distances.min(axis=1)

# Make predictions on the grid and get probabilities
prediction_probabilities = model.predict_proba(prediction_points[['Temperature (°C)', 'PACE Chlorophyll (μg/L)', 'min_distance_to_eddy']])[:, 1]
prediction_points['probability'] = prediction_probabilities

# Create a heat map of foraging probability using Folium
m = folium.Map(location=[37, -70], zoom_start=4, tiles='OpenStreetMap')
HeatMap(data=prediction_points[['Latitude', 'Longitude', 'probability']]).add_to(m)
m.save("shark_foraging_hotspots.html")

print("\nHTML map generated successfully: shark_foraging_hotspots.html")