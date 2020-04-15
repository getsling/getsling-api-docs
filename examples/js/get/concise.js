const https = require('https')

// Check command line arguments.
if ( process.argv.length != 3 ) {
  console.log('./concise <token>')
  process.exit()
}

// Define the request.
var options = {
  hostname: 'api.getsling.com',
  port: 443,
  path: '/users/concise',
  method: 'GET',
  headers: {
    'Accept': '*/*',
    'Authorization': process.argv[2]
  }
}

// Issue the request.
var request = https.request(options, (response) => {
  // The commented code below will print the whole response.
  response.on('data', (data) => {
    process.stdout.write(data)
  })
})

// Report any errors.
request.on('error', (error) => {
  console.error(error)
})

// Send the request.
request.end()
