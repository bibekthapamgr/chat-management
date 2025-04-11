<?php
require_once 'config.php';
require_once 'facebook-service.php';

// Verify webhook subscription
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mode = $_GET['hub_mode'] ?? '';
    $token = $_GET['hub_verify_token'] ?? '';
    $challenge = $_GET['hub_challenge'] ?? '';
    
    // Use the token you've already set up
    $verify_token = $_ENV['FACEBOOK_WEBHOOK_VERIFY_TOKEN'] ?? 'your_verify_token'; 
    
    if ($mode === 'subscribe' && $token === $verify_token) {
        echo $challenge;
        exit;
    }
    
    http_response_code(403);
    echo 'Verification failed';
    exit;
}

// Handle incoming webhook events
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Log the webhook event for debugging
    file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . ' - ' . $input . PHP_EOL, FILE_APPEND);
    
    // Process the webhook payload
    if (isset($data['object']) && ($data['object'] === 'page' || $data['object'] === 'instagram')) {
        // Process each entry (there might be multiple)
        foreach ($data['entry'] as $entry) {
            $pageId = $entry['id'];
            
            // Handle messaging events
            if (isset($entry['messaging'])) {
                foreach ($entry['messaging'] as $event) {
                    processMessagingEvent($event, $pageId);
                }
            }
        }
        
        http_response_code(200);
        echo json_encode(['status' => 'ok']);
        exit;
    }
    
    http_response_code(200);
    echo json_encode(['status' => 'not relevant']);
    exit;
}

function processMessagingEvent($event, $pageId) {
    // Extract the sender PSID
    $senderId = $event['sender']['id'];
    
    // Check if this is a message event
    if (isset($event['message'])) {
        // Handle text messages
        if (isset($event['message']['text'])) {
            $message = $event['message']['text'];
            $timestamp = isset($event['timestamp']) ? $event['timestamp'] : time() * 1000;
            
            // Save the incoming message
            saveIncomingMessage($pageId, $senderId, $message, $timestamp / 1000); // Convert to seconds
            
            // You could also implement auto-replies here
        }
        
        // Handle attachments (images, files, etc.)
        if (isset($event['message']['attachments'])) {
            foreach ($event['message']['attachments'] as $attachment) {
                // Process different attachment types
                // For simplicity, we're just logging them
                file_put_contents('attachment_log.txt', date('Y-m-d H:i:s') . ' - ' . json_encode($attachment) . PHP_EOL, FILE_APPEND);
            }
        }
    }
    
    // Handle message delivery confirmations
    if (isset($event['delivery'])) {
        // Update message status in database
        // For simplicity, we're just logging them
        file_put_contents('delivery_log.txt', date('Y-m-d H:i:s') . ' - ' . json_encode($event['delivery']) . PHP_EOL, FILE_APPEND);
    }
    
    // Handle message read events
    if (isset($event['read'])) {
        // Update message status in database
        // For simplicity, we're just logging them
        file_put_contents('read_log.txt', date('Y-m-d H:i:s') . ' - ' . json_encode($event['read']) . PHP_EOL, FILE_APPEND);
    }
}
?>
