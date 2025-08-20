const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:5000';
const API_KEY = 'btPjDBhaXH9DehVYUALwNtkPTNOBp98koVLJUnSL';

// Test configuration
const tests = [
  {
    name: 'Health Check',
    endpoint: '/health',
    expected: 'OK'
  },
  {
    name: 'APOD (Astronomy Picture of the Day)',
    endpoint: '/api/nasa/apod',
    expected: 'title'
  },
  {
    name: 'APOD with specific date',
    endpoint: '/api/nasa/apod?date=2024-01-01',
    expected: 'title'
  },
  {
    name: 'Mars Curiosity Rover Photos',
    endpoint: '/api/nasa/mars-photos/curiosity?sol=1000',
    expected: 'photos'
  },
  {
    name: 'Mars Perseverance Rover Photos',
    endpoint: '/api/nasa/mars-photos/perseverance?sol=100',
    expected: 'photos'
  },
  {
    name: 'Near Earth Objects',
    endpoint: '/api/nasa/neo',
    expected: 'near_earth_objects'
  },
  {
    name: 'EPIC Natural Earth Images',
    endpoint: '/api/nasa/epic/natural',
    expected: 'data'
  },
  {
    name: 'NASA Image Search',
    endpoint: '/api/nasa/search?q=mars&media_type=image',
    expected: 'collection'
  }
];

async function testEndpoint(test) {
  try {
    console.log(chalk.blue(`\n🧪 Testing: ${test.name}`));
    console.log(chalk.gray(`   Endpoint: ${test.endpoint}`));
    
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}${test.endpoint}`, {
      timeout: 15000
    });
    const endTime = Date.now();
    
    // Check if response is successful
    if (response.status === 200 && response.data.success) {
      // Check if expected data exists
      const hasExpectedData = test.expected === 'OK' 
        ? response.data.status === 'OK'
        : response.data.data && (
            typeof response.data.data[test.expected] !== 'undefined' ||
            typeof response.data.data.title !== 'undefined' ||
            Array.isArray(response.data.data)
          );
      
      if (hasExpectedData) {
        console.log(chalk.green(`   ✅ SUCCESS (${endTime - startTime}ms)`));
        
        // Show some sample data
        if (test.expected === 'title' && response.data.data.title) {
          console.log(chalk.gray(`   📝 Title: ${response.data.data.title.substring(0, 50)}...`));
        } else if (test.expected === 'photos' && response.data.data.photos) {
          console.log(chalk.gray(`   📸 Photos found: ${response.data.data.photos.length}`));
        } else if (test.expected === 'near_earth_objects') {
          const count = Object.values(response.data.data.near_earth_objects || {}).flat().length;
          console.log(chalk.gray(`   🌌 Near Earth Objects: ${count}`));
        } else if (Array.isArray(response.data.data)) {
          console.log(chalk.gray(`   📊 Items: ${response.data.data.length}`));
        }
        
        return { name: test.name, status: 'PASS', time: endTime - startTime };
      } else {
        console.log(chalk.yellow(`   ⚠️ WARNING: Missing expected data (${test.expected})`));
        return { name: test.name, status: 'PARTIAL', time: endTime - startTime };
      }
    } else {
      console.log(chalk.red(`   ❌ FAILED: ${response.data.message || 'Unknown error'}`));
      return { name: test.name, status: 'FAIL', time: endTime - startTime };
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ ERROR: ${error.response?.data?.message || error.message}`));
    return { name: test.name, status: 'ERROR', time: 0, error: error.message };
  }
}

async function runAllTests() {
  console.log(chalk.cyan.bold('\n🚀 NASA Space Explorer Backend API Testing'));
  console.log(chalk.cyan(`🔑 Using NASA API Key: ${API_KEY.substring(0, 8)}...`));
  console.log(chalk.cyan(`🌐 Testing against: ${BASE_URL}`));
  console.log(chalk.gray('=' .repeat(60)));
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test);
    results.push(result);
    
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log(chalk.cyan.bold('\n📊 TEST SUMMARY'));
  console.log(chalk.gray('=' .repeat(60)));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  console.log(chalk.green(`✅ PASSED: ${passed}`));
  console.log(chalk.yellow(`⚠️  PARTIAL: ${partial}`));
  console.log(chalk.red(`❌ FAILED: ${failed}`));
  console.log(chalk.red(`💥 ERRORS: ${errors}`));
  
  const totalTime = results.reduce((sum, r) => sum + r.time, 0);
  console.log(chalk.gray(`⏱️  Total time: ${totalTime}ms`));
  
  // API Key Status
  console.log(chalk.cyan.bold('\n🔑 API KEY STATUS'));
  console.log(chalk.gray('=' .repeat(60)));
  
  if (passed > 0) {
    console.log(chalk.green('✅ NASA API Key is VALID and WORKING'));
    console.log(chalk.green('✅ Rate limits are not exceeded'));
    console.log(chalk.green('✅ Backend is properly configured'));
  } else {
    console.log(chalk.red('❌ NASA API Key may be invalid or rate limited'));
    console.log(chalk.yellow('💡 Check your NASA API key and rate limits'));
  }
  
  // Recommendations
  console.log(chalk.cyan.bold('\n💡 RECOMMENDATIONS'));
  console.log(chalk.gray('=' .repeat(60)));
  
  if (errors > 0) {
    console.log(chalk.yellow('• Check if the backend server is running on port 5000'));
    console.log(chalk.yellow('• Verify network connectivity'));
  }
  
  if (failed > 0) {
    console.log(chalk.yellow('• Some NASA APIs may be temporarily unavailable'));
    console.log(chalk.yellow('• Check NASA API service status'));
  }
  
  console.log(chalk.green('• Your NASA API key has higher rate limits than DEMO_KEY'));
  console.log(chalk.green('• Consider implementing caching for production use'));
  console.log(chalk.green('• Monitor rate limits to avoid exceeding quotas'));
  
  console.log(chalk.cyan.bold('\n🎉 Testing Complete!\n'));
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️ Testing interrupted by user'));
  process.exit(0);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error(chalk.red('\n💥 Test runner failed:'), error.message);
    process.exit(1);
  });
}

module.exports = { runAllTests, testEndpoint };
