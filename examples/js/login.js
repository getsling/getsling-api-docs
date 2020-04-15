const https = require('https')

// Check command line arguments.
if ( process.argv.length != 4 ) {
  console.log('./login <email> <password>')
  process.exit()
}

// Define the request.
var body = JSON.stringify({
  'email': process.argv[2],
  'password': process.argv[3],
})
var options = {
  hostname: 'api.getsling.com',
  port: 443,
  path: '/account/login',
  method: 'POST',
  headers: {
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'Content-Length': body.length
  }
}

// Issue the request.
var request = https.request(options, (response) => {
  // Print the authorization token.
  console.log(response.headers.authorization)
})

// Report any errors.
request.on('error', (error) => {
  console.error(error)
})

// Write the body.
request.write(body)
request.end()
