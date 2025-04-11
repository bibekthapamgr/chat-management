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

if (!$pageId) {
    http_response_code(400);
    echo json_encode(['error' => 'Page ID is required']);
    exit;
}

$userId = $payload->user_id;

// Verify the user has access to this page
try {
    $stmt = $db->prepare("SELECT access_token FROM facebook_pages WHERE page_id = :page_id AND user_id = :user_id");
    $stmt->bindParam(':page_id', $pageId);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $page = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$page) {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have access to this page']);
        exit;
    }
    
    // Get conversations from database
    $stmt = $db->prepare("SELECT * FROM conversations WHERE page_id = :page_id ORDER BY updated_at DESC");
    $stmt->bindParam(':page_id', $pageId);
    $stmt->execute();
    
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // If no conversations in database, fetch from Facebook API
    if (count($conversations) === 0) {
        $accessToken = $page['access_token'];
        $fbConversations = getConversations($pageId, $accessToken);
        
        if (isset($fbConversations['data']) && count($fbConversations['data']) > 0) {
            $conversations = [];
            
            foreach ($fbConversations['data'] as $conv) {
                // Get the user ID (the participant who is not the page)
                $userId = null;
                $userName = "Unknown";
                
                if (isset($conv['participants']['data'])) {
                    foreach ($conv['participants']['data'] as $participant) {
                        if ($participant['id']!== $pageId) {
                            $userId = $participant['id'];
                            $userName = isset($participant['name']) ? $participant['name'] : "Unknown";
                            break;
                        }
                    }
                }
                
                if ($userId) {
                    // Get user info from Facebook
                    $userInfo = getUserInfo($userId, $accessToken);
                    $profilePic = isset($userInfo['profile_pic']) ? $userInfo['profile_pic'] : null;
                    $name = isset($userInfo['name']) ? $userInfo['name'] : $userName;
                    
                    // Get last message
                    $lastMessage = "";
                    $lastMessageTime = null;
                    
                    if (isset($conv['messages']['data']) && count($conv['messages']['data']) > 0) {
                        $lastMessage = $conv['messages']['data'][0]['message'];
                        $lastMessageTime = strtotime($conv['messages']['data'][0]['created_time']);
                    }
                    
                    // Save conversation to database
                    $stmt = $db->prepare("
                        INSERT INTO conversations (page_id, user_id, user_name, profile_pic, last_message, last_message_time, created_at, updated_at)
                        VALUES (:page_id, :user_id, :user_name, :profile_pic, :last_message, :last_message_time, NOW(), NOW())
                        ON DUPLICATE KEY UPDATE
                        user_name = :user_name,
                        profile_pic = :profile_pic,
                        last_message = :last_message,
                        last_message_time = :last_message_time,
                        updated_at = NOW()
                    ");
                    
                    $stmt->bindParam(':page_id', $pageId);
                    $stmt->bindParam(':user_id', $userId);
                    $stmt->bindParam(':user_name', $name);
                    $stmt->bindParam(':profile_pic', $profilePic);
                    $stmt->bindParam(':last_message', $lastMessage);
                    $stmt->bindParam(':last_message_time', $lastMessageTime);
                    $stmt->execute();
                    
                    // Add to result
                    $conversations[] = [
                        'user_id' => $userId,
                        'user_name' => $name,
                        'profile_pic' => $profilePic,
                        'last_message' => $lastMessage,
                        'last_message_time' => $lastMessageTime
                    ];
                }
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'conversations' => $conversations
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
