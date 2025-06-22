<?php
header('Content-Type: application/json');

// Get and decode the input JSON
$data = json_decode(file_get_contents("php://input"), true);

// Initialize the response
$response = "I'm sorry, I didn't understand that.";

if (isset($data['query'])) {
    $q = strtolower(trim($data['query']));

    // Basic keyword matching
    $servicesKeywords = ['services', 'offer', 'provide'];
    $emailKeywords = ['email', 'mail'];
    $spaceKeywords = ['space', 'blank'];
    $phoneKeywords = ['phone', 'number', 'call', 'contact'];

    // Match services
    foreach ($servicesKeywords as $word) {
        if (strpos($q, $word) !== false) {
            $response = "We offer Web Development, Hosting, SEO, Custom Systems, and Domain Registration.";
            break;
        }
    }

    // Match email space issue
    if (strpos($q, 'email') !== false && strpos($q, 'space') !== false) {
        $response = "Please make sure your email address does not contain any spaces.";
    }

    // Match phone/number query
    foreach ($phoneKeywords as $word) {
        if (strpos($q, $word) !== false) {
            $response = "You can reach us via phone. Please include the country code, like +263...";
            break;
        }
    }

    // Add more intents here
    if (strpos($q, 'location') !== false || strpos($q, 'where') !== false) {
        $response = "We're located in Harare, Zimbabwe. You can also contact us online!";
    }

    if (strpos($q, 'contact') !== false || strpos($q, 'get in touch') !== false) {
        $response = "You can contact us via email at support@techzonn.com or call us at +263...";
    }
}

// Optional: Log queries for analytics
file_put_contents('chatbot_log.txt', date('Y-m-d H:i:s') . " - " . ($data['query'] ?? 'N/A') . "\n", FILE_APPEND);

// Return the response as JSON
echo json_encode(['response' => $response]);
?>
