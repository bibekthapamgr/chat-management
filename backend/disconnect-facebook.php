<?php
require_once 'config.php';
require_once 'facebook-service.php';

// Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get token from Authorization header
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'No token provided']);
    exit;
}

$token = $matches[1];
$payload = verifyJWT($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
    exit;
}

// Get page ID from query parameter
$pageId = $_GET['pageId'] ?? '';

if (!$pageId) {
    http_response_code(400);
    echo json_encode(['error' => 'Page ID is required']);
    exit;
}

$userId = $payload->user_id;

// Delete the Facebook page
$result = deleteFacebookPage($userId, $pageId);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to disconnect Facebook page']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Facebook page disconnected successfully'
]);
?>
