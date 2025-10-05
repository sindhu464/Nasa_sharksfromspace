import rasterio
import numpy as np

# Define a simple raster profile
profile = {
    'driver': 'GTiff',
    'dtype': 'float32',
    'nodata': -9999,
    'width': 100,
    'height': 100,
    'count': 1,
    'crs': 'EPSG:4326',
    'transform': rasterio.transform.from_bounds(-120, 10, -60, 50, 100, 100)
}

# Create dummy chlorophyll data (higher values in the Gulf of Mexico region)
chlorophyll_array = np.zeros((100, 100), dtype=np.float32)
chlorophyll_array[70:80, 20:30] = 3.5  # Simulate high chlorophyll
with rasterio.open('pace_chlorophyll.tif', 'w', **profile) as dst:
    dst.write(chlorophyll_array, 1)

# Create dummy SST data (warmer towards the equator)
sst_array = np.zeros((100, 100), dtype=np.float32)
for i in range(100):
    sst_array[i, :] = 10 + i * 0.2
with rasterio.open('sst_data.tif', 'w', **profile) as dst:
    dst.write(sst_array, 1)