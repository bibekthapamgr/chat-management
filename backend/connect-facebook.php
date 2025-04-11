<?php
require_once 'config.php';
require_once 'facebook-service.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json);

// Validate input
if (!isset($data->pageId) || !isset($data->pageName) || !isset($data->accessToken)) {
    http_response_code(400);
    echo json_encode(['error' => 'Page ID, name, and access token are required']);
    exit;
}

$pageId = $data->pageId;
$pageName = $data->pageName;
$accessToken = $data->accessToken;
$userId = $payload->user_id;

// Save the Facebook page
$result = saveFacebookPage($userId, $pageId, $pageName, $accessToken);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save Facebook page']);
    exit;
}

// Subscribe to webhooks for the page
$subscribeResult = subscribeToWebhooks($pageId, $accessToken);

echo json_encode([
    'success' => true,
    'message' => 'Facebook page connected successfully',
    'page' => [
        'id' => $pageId,
        'name' => $pageName
    ]
]);

// Helper function to subscribe to webhooks
function subscribeToWebhooks($pageId, $accessToken) {
    $url = "https://graph.facebook.com/v18.0/{$pageId}/subscribed_apps";
    
    $data = [
        'subscribed_fields' => 'messages,messaging_postbacks,message_deliveries,message_reads',
        'access_token' => $accessToken
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
?>
