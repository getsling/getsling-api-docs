<?php
# Initialize curl.
$curl = curl_init();

# Form the request.
$data->email = $argv[1];
$data->password = $argv[2];
$options = [
    CURLOPT_URL => 'https://api.getsling.com/account/login',
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true
];
curl_setopt_array($curl, $options);

# Make the request.
$response = curl_exec($curl);

# Parse the authorization token from the header.
$header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
$headers = substr($response, 0, $header_size);
foreach (explode("\r\n", $headers) as $line) {
    if (stripos($line, 'authorization:') === 0) {
        echo trim(explode(":", $line, 2)[1]);
    }
}
?>
