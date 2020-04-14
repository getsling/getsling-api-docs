const https = require('https')

// Check command line arguments.
if ( process.argv.length != 6 ) {
  console.log('./calendar <token> <org> <user> <dates>')
  process.exit()
}

// Define the request.
var org = process.argv[3]
var user = process.argv[4]
var dates = encodeURIComponent(process.argv[5])
var path = `/calendar/${org}/users/${user}?dates=${dates}`
var options = {
  hostname: 'api.getsling.com',
  port: 443,
  path: path,
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
