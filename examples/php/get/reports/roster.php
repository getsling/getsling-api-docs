<?php
# Initialize curl.
$curl = curl_init();

# Form the request.
$options = [
    CURLOPT_URL => 'https://api.getsling.com/v1/' . $argv[2] . '/reports/roster?dates=2019-10-30/2019-10-30',
    CURLOPT_HTTPHEADER => ['Authorization: ' . $argv[1]],
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_RETURNTRANSFER => true
];
curl_setopt_array($curl, $options);

# Make the request.
$response = curl_exec($curl);

# Echo the response.
echo $response
?>
