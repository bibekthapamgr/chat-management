<?php
require_once 'config.php';

// Facebook API functions
function getFacebookPages($userId) {
    global $db;
    
    try {
        $stmt = $db->prepare("SELECT * FROM facebook_pages WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        error_log("Error fetching Facebook pages: " . $e->getMessage());
        return [];
    }
}

function saveFacebookPage($userId, $pageId, $pageName, $accessToken) {
    global $db;
    
    try {
        // Check if page already exists
        $stmt = $db->prepare("SELECT id FROM facebook_pages WHERE page_id = :page_id AND user_id = :user_id");
        $stmt->bindParam(':page_id', $pageId);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            // Update existing page
            $stmt = $db->prepare("UPDATE facebook_pages SET access_token = :access_token, page_name = :page_name, updated_at = NOW() WHERE page_id = :page_id AND user_id = :user_id");
        } else {
            // Insert new page
            $stmt = $db->prepare("INSERT INTO facebook_pages (user_id, page_id, page_name, access_token, created_at, updated_at) VALUES (:user_id, :page_id, :page_name, :access_token, NOW(), NOW())");
        }
        
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':page_id', $pageId);
        $stmt->bindParam(':page_name', $pageName);
        $stmt->bindParam(':access_token', $accessToken);
        $stmt->execute();
        
        return true;
    } catch(PDOException $e) {
        error_log("Error saving Facebook page: " . $e->getMessage());
        return false;
    }
}

function deleteFacebookPage($userId, $pageId) {
    global $db;
    
    try {
        $stmt = $db->prepare("DELETE FROM facebook_pages WHERE page_id = :page_id AND user_id = :user_id");
        $stmt->bindParam(':page_id', $pageId);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        return true;
    } catch(PDOException $e) {
        error_log("Error deleting Facebook page: " . $e->getMessage());
        return false;
    }
}

function getConversations($pageId, $accessToken) {
    $url = "https://graph.facebook.com/v18.0/{$pageId}/conversations?access_token={$accessToken}&fields=participants,updated_time,messages{message,from,to,created_time}";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

function sendMessage($pageId, $recipientId, $message, $accessToken) {
    $url = "https://graph.facebook.com/v18.0/{$pageId}/messages";
    
    $data = [
        'recipient' => ['id' => $recipientId],
        'message' => ['text' => $message],
        'messaging_type' => 'RESPONSE',
        'access_token' => $accessToken
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Save incoming message to database
function saveIncomingMessage($pageId, $senderId, $message, $timestamp) {
    global $db;
    
    try {
        $stmt = $db->prepare("INSERT INTO messages (page_id, sender_id, message, direction, timestamp, created_at) VALUES (:page_id, :sender_id, :message, 'incoming', :timestamp, NOW())");
        $stmt->bindParam(':page_id', $pageId);
        $stmt->bindParam(':sender_id', $senderId);
        $stmt->bindParam(':message', $message);
        $stmt->bindParam(':timestamp', $timestamp);
        $stmt->execute();
        
        return $db->lastInsertId();
    } catch(PDOException $e) {
        error_log("Error saving incoming message: " . $e->getMessage());
        return false;
    }
}

// Save outgoing message to database
function saveOutgoingMessage($pageId, $recipientId, $message) {
    global $db;
    
    try {
        $timestamp = time();
        $stmt = $db->prepare("INSERT INTO messages (page_id, recipient_id, message, direction, timestamp, created_at) VALUES (:page_id, :recipient_id, :message, 'outgoing', :timestamp, NOW())");
        $stmt->bindParam(':page_id', $pageId);
        $stmt->bindParam(':recipient_id', $recipientId);
        $stmt->bindParam(':message', $message);
        $stmt->bindParam(':timestamp', $timestamp);
        $stmt->execute();
        
        return $db->lastInsertId();
    } catch(PDOException $e) {
        error_log("Error saving outgoing message: " . $e->getMessage());
        return false;
    }
}

// Get messages for a conversation
function getMessages($pageId, $userId) {
    global $db;
    
    try {
        $stmt = $db->prepare("
            SELECT m.*, u.name as sender_name 
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.facebook_id
            WHERE m.page_id = :page_id
            ORDER BY m.timestamp ASC
        ");
        $stmt->bindParam(':page_id', $pageId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        error_log("Error fetching messages: " . $e->getMessage());
        return [];
    }
}

// Get user info from Facebook
function getUserInfo($userId, $accessToken) {
    $url = "https://graph.facebook.com/v18.0/{$userId}?access_token={$accessToken}&fields=name,profile_pic";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
?>
