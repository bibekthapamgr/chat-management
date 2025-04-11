<?php
// Database configuration
$host = 'localhost'; // Your cPanel database host
$dbname = 'your_database_name'; // Your database name
$username = 'your_database_username'; // Your database username
$password = 'your_database_password'; // Your database password

// Create database connection
try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}

// Set headers for CORS and JSON responses
header('Access-Control-Allow-Origin: *'); // Replace * with your frontend domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Function to generate JWT token
function generateJWT($user_id, $email) {
    $secret_key = 'your_secret_key'; // Change this to a secure random string
    
    $payload = [
        'iss' => 'your_domain.com', // Issuer
        'iat' => time(), // Issued at
        'exp' => time() + (60 * 60 * 24), // Expires in 24 hours
        'user_id' => $user_id,
        'email' => $email
    ];
    
    // Encode Header
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    
    // Encode Payload
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    
    // Create Signature
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret_key, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // Create JWT
    $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    
    return $jwt;
}

// Function to verify JWT token
function verifyJWT($token) {
    $secret_key = 'your_secret_key'; // Same key as in generateJWT
    
    // Split the token
    $tokenParts = explode('.', $token);
    if (count($tokenParts) != 3) {
        return false;
    }
    
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
    $signatureProvided = $tokenParts[2];
    
    // Check the expiration time
    $payloadObj = json_decode($payload);
    if ($payloadObj->exp < time()) {
        return false;
    }
    
    // Verify signature
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret_key, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if ($base64UrlSignature !== $signatureProvided) {
        return false;
    }
    
    return json_decode($payload);
}
?>
