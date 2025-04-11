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
if (!isset($data->pageId) || !isset($data->recipientId) || !isset($data->message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Page ID, recipient ID, and message are required']);
    exit;
}

$pageId = $data->pageId;
$recipientId = $data->recipientId;
$message = $data->message;
$userId = $payload->user_id;

// Get the page access token
try {
    $stmt = $db->prepare("SELECT access_token FROM facebook_pages WHERE page_id = :page_id AND user_id = :user_id");
    $stmt->bindParam(':page_id', $pageId);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $page = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$page) {
        http_response_code(404);
        echo json_encode(['error' => 'Facebook page not found']);
        exit;
    }
    
    $accessToken = $page['access_token'];
    
    // Send the message
    $result = sendMessage($pageId, $recipientId, $message, $accessToken);
    
    if (isset($result['error'])) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send message: ' . $result['error']['message']]);
        exit;
    }
    
    // Save the outgoing message
    saveOutgoingMessage($pageId, $recipientId, $message);
    
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully',
        'result' => $result
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
