const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('Testing NASA Space Explorer Backend Endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing Health Endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   ✓ Health check passed:', health.data.status);
    
    // Test APOD endpoint
    console.log('\n2. Testing APOD Endpoint...');
    const apod = await axios.get(`${BASE_URL}/api/nasa/apod`);
    console.log('   ✓ APOD data retrieved successfully');
    console.log('   ✓ Title:', apod.data.data.title);
    
    // Test APOD with date
    console.log('\n3. Testing APOD with specific date...');
    const apodDate = await axios.get(`${BASE_URL}/api/nasa/apod?date=2024-01-01`);
    console.log('   ✓ APOD for 2024-01-01 retrieved successfully');
    
    // Test Mars Rover Photos
    console.log('\n4. Testing Mars Rover Photos...');
    const marsPhotos = await axios.get(`${BASE_URL}/api/nasa/mars-photos/curiosity?sol=1000`);
    console.log('   ✓ Mars rover photos retrieved successfully');
    console.log('   ✓ Photos count:', marsPhotos.data.data.photos?.length || 0);
    
    // Test Near Earth Objects
    console.log('\n5. Testing Near Earth Objects...');
    const neo = await axios.get(`${BASE_URL}/api/nasa/neo`);
    console.log('   ✓ Near Earth Objects data retrieved successfully');
    
    // Test EPIC Natural Images
    console.log('\n6. Testing EPIC Natural Images...');
    const epic = await axios.get(`${BASE_URL}/api/nasa/epic/natural`);
    console.log('   ✓ EPIC natural images retrieved successfully');
    console.log('   ✓ Images count:', Array.isArray(epic.data.data) ? epic.data.data.length : 0);
    
    // Test NASA Image Search
    console.log('\n7. Testing NASA Image Search...');
    const search = await axios.get(`${BASE_URL}/api/nasa/search?q=mars&media_type=image`);
    console.log('   ✓ NASA image search completed successfully');
    
    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEndpoints();
}

module.exports = testEndpoints;
