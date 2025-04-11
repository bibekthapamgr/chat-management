<?php
require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json);

// Validate input
if (!isset($data->name) || !isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email, and password are required']);
    exit;
}

$name = $data->name;
$email = $data->email;
$password = $data->password;

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}

// Validate password strength (at least 8 characters)
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 8 characters']);
    exit;
}

// Hash the password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Check if email already exists
try {
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already exists']);
        exit;
    }
    
    // Insert new user
    $stmt = $db->prepare("INSERT INTO users (name, email, password, created_at) VALUES (:name, :email, :password, NOW())");
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->execute();
    
    $user_id = $db->lastInsertId();
    
    // Generate JWT token
    $token = generateJWT($user_id, $email);
    
    // Return success response with token
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'token' => $token,
        'user' => [
            'id' => $user_id,
            'name' => $name,
            'email' => $email
        ]
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
