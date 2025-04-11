<?php
require_once 'config.php';
require_once 'facebook-service.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

// Get query parameters
$pageId = $_GET['pageId'] ?? '';
$senderId = $_GET['senderId'] ?? '';

if (!$pageId) {
    http_response_code(400);
    echo json_encode(['error' => 'Page ID is required']);
    exit;
}

$userId = $payload->user_id;

// Verify the user has access to this page
try {
    $stmt = $db->prepare("SELECT id FROM facebook_pages WHERE page_id = :page_id AND user_id = :user_id");
    $stmt->bindParam(':page_id', $pageId);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have access to this page']);
        exit;
    }
    
    // Get messages
    $query = "
        SELECT * FROM messages 
        WHERE page_id = :page_id
    ";
    $params = [':page_id' => $pageId];
    
    if ($senderId) {
        $query .= " AND (sender_id = :sender_id OR recipient_id = :recipient_id)";
        $params[':sender_id'] = $senderId;
        $params[':recipient_id'] = $senderId;
    }
    
    $query .= " ORDER BY timestamp ASC";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindParam($key, $value);
    }
    $stmt->execute();
    
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'messages' => $messages
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
