
<?php
/**
 * EnderHOST Order Email Notification Script
 * This script handles sending email notifications when a customer places an order
 */

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// For preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load configuration
require_once '../config.php';

// Set up error logging
function logError($message, $type = 'ERROR') {
    if (defined('ENABLE_ERROR_LOGGING') && ENABLE_ERROR_LOGGING) {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] [$type] $message" . PHP_EOL;
        
        // Make sure logs directory exists and is writable
        $logDir = dirname(ERROR_LOG_PATH);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        // Write to log file
        file_put_contents(ERROR_LOG_PATH, $logEntry, FILE_APPEND);
    }
}

// Function to sanitize input
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    logError("Method not allowed: " . $_SERVER['REQUEST_METHOD']);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON data from the request body
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Check if data was provided and properly decoded
if (!$data) {
    http_response_code(400);
    logError("Invalid JSON data: " . $json_data);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Extract and sanitize data
$customer_name = isset($data['customerName']) ? sanitize_input($data['customerName']) : 'Unknown';
$customer_email = isset($data['customerEmail']) ? sanitize_input($data['customerEmail']) : 'Unknown';
$customer_phone = isset($data['customerPhone']) ? sanitize_input($data['customerPhone']) : 'Not provided';
$discord_username = isset($data['discordUsername']) ? sanitize_input($data['discordUsername']) : 'Not provided';
$server_name = isset($data['serverName']) ? sanitize_input($data['serverName']) : 'Unknown';
$plan = isset($data['plan']) ? sanitize_input($data['plan']) : 'Unknown';
$plan_price = isset($data['basePlanPrice']) ? sanitize_input($data['basePlanPrice']) : 'Unknown';
$additional_backups = isset($data['additionalBackups']) ? (int)$data['additionalBackups'] : 0;
$additional_ports = isset($data['additionalPorts']) ? (int)$data['additionalPorts'] : 0;
$total_price = isset($data['totalPrice']) ? sanitize_input($data['totalPrice']) : $plan_price;
$order_date = isset($data['orderDate']) ? date('Y-m-d H:i:s', strtotime($data['orderDate'])) : date('Y-m-d H:i:s');

// Generate order ID
$order_id = "EH-" . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8)) . "-" . date("Ymd");

// Log order details
logError("New order received - ID: $order_id, Plan: $plan, Total: ₹$total_price", "INFO");

// Prepare email content
$admin_email = ADMIN_EMAIL; // From config.php
$subject = "New Minecraft Server Order - " . $server_name;

// Calculate add-on prices
$backup_cost = $additional_backups * 19;
$port_cost = $additional_ports * 9;

// HTML email body
$html_message = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #000; color: #fff; padding: 15px; text-align: center; }
        .header h1 { margin: 0; color: #fff; }
        .header h1 span { color: #00C853; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; }
        .order-details { background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; }
        .footer { font-size: 12px; text-align: center; margin-top: 30px; color: #777; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Ender<span>HOST</span> - New Order</h1>
        </div>
        <div class='content'>
            <h2>New Minecraft Server Order Received</h2>
            <p>A new server order has been placed. The customer has been directed to the payment page.</p>
            
            <div class='order-details'>
                <h3>Order Details:</h3>
                <table>
                    <tr>
                        <th>Order ID:</th>
                        <td>{$order_id}</td>
                    </tr>
                    <tr>
                        <th>Server Name:</th>
                        <td>{$server_name}</td>
                    </tr>
                    <tr>
                        <th>Plan:</th>
                        <td>{$plan}</td>
                    </tr>
                    <tr>
                        <th>Base Price:</th>
                        <td>₹{$plan_price}</td>
                    </tr>";

// Add add-ons only if they exist
if ($additional_backups > 0) {
    $html_message .= "
                    <tr>
                        <th>Additional Backups ({$additional_backups}):</th>
                        <td>₹{$backup_cost}</td>
                    </tr>";
}

if ($additional_ports > 0) {
    $html_message .= "
                    <tr>
                        <th>Additional Ports ({$additional_ports}):</th>
                        <td>₹{$port_cost}</td>
                    </tr>";
}

$html_message .= "
                    <tr>
                        <th>Total Price:</th>
                        <td>₹{$total_price}</td>
                    </tr>
                    <tr>
                        <th>Order Date:</th>
                        <td>{$order_date}</td>
                    </tr>
                </table>
            </div>
            
            <h3>Customer Information:</h3>
            <table>
                <tr>
                    <th>Name:</th>
                    <td>{$customer_name}</td>
                </tr>
                <tr>
                    <th>Email:</th>
                    <td>{$customer_email}</td>
                </tr>
                <tr>
                    <th>Phone:</th>
                    <td>{$customer_phone}</td>
                </tr>
                <tr>
                    <th>Discord Username:</th>
                    <td>{$discord_username}</td>
                </tr>
            </table>
            
            <p style='margin-top: 30px;'>
                <b>Note:</b> This is just a notification that the customer has reached the payment page. 
                Await payment confirmation from Discord before setting up the server.
            </p>
        </div>
        <div class='footer'>
            <p>This is an automated message from the EnderHOST ordering system.</p>
            <p>&copy; " . date('Y') . " EnderHOST. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
";

// Plain text alternative for email clients that don't support HTML
$text_message = "
NEW MINECRAFT SERVER ORDER

Order ID: {$order_id}
Server Name: {$server_name}
Plan: {$plan}
Base Price: ₹{$plan_price}";

if ($additional_backups > 0) {
    $text_message .= "\nAdditional Backups ({$additional_backups}): ₹{$backup_cost}";
}

if ($additional_ports > 0) {
    $text_message .= "\nAdditional Ports ({$additional_ports}): ₹{$port_cost}";
}

$text_message .= "
Total Price: ₹{$total_price}
Order Date: {$order_date}

CUSTOMER INFORMATION:
Name: {$customer_name}
Email: {$customer_email}
Phone: {$customer_phone}
Discord Username: {$discord_username}

Note: This is just a notification that the customer has reached the payment page. 
Await payment confirmation from Discord before setting up the server.

© " . date('Y') . " EnderHOST. All rights reserved.
";

// Send email
$success = false;

if (USE_SMTP) {
    // Check if PHPMailer is installed
    $phpmailer_files = [
        __DIR__ . '/lib/PHPMailer/src/Exception.php',
        __DIR__ . '/lib/PHPMailer/src/PHPMailer.php',
        __DIR__ . '/lib/PHPMailer/src/SMTP.php'
    ];
    
    $phpmailer_missing = false;
    foreach ($phpmailer_files as $file) {
        if (!file_exists($file)) {
            $phpmailer_missing = true;
            logError("PHPMailer file missing: $file");
        }
    }
    
    if ($phpmailer_missing) {
        logError("PHPMailer not properly installed. Please check the README.md file for installation instructions.");
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Email system not properly configured. Please contact the administrator.']);
        exit();
    }
    
    // Use PHPMailer
    require_once __DIR__ . '/lib/PHPMailer/src/Exception.php';
    require_once __DIR__ . '/lib/PHPMailer/src/PHPMailer.php';
    require_once __DIR__ . '/lib/PHPMailer/src/SMTP.php';
    
    try {
        // Server settings
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->SMTPDebug = 0; // Set to 2 for debugging
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = 'tls';
        $mail->Port = SMTP_PORT;
        
        // Recipients
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($admin_email);
        $mail->addReplyTo($customer_email, $customer_name);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $html_message;
        $mail->AltBody = $text_message;
        
        $mail->send();
        $success = true;
        
        // Log success
        logError("Order notification email sent to {$admin_email} for order {$order_id}", "SUCCESS");
    } catch (Exception $e) {
        logError('Error sending email: ' . $mail->ErrorInfo);
        $success = false;
    }
} else {
    // Use PHP mail() function
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: EnderHOST Notifications <" . SMTP_FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: {$customer_email}\r\n";
    
    $success = mail($admin_email, $subject, $html_message, $headers);
    
    // Log the attempt
    if ($success) {
        logError("Order notification email sent to {$admin_email} for order {$order_id} using mail()", "SUCCESS");
    } else {
        logError("Failed to send order notification email to {$admin_email} for order {$order_id} using mail()");
    }
}

// Send notification to Discord webhook if configured
if (!empty(DISCORD_WEBHOOK_URL)) {
    $discord_message = [
        'content' => "New Server Order: {$server_name}",
        'embeds' => [
            [
                'title' => "New Minecraft Server Order - {$plan}",
                'description' => "Customer: {$customer_name}\nServer: {$server_name}\nTotal Price: ₹{$total_price}",
                'color' => 3066993, // Green color
                'fields' => [
                    ['name' => 'Order ID', 'value' => $order_id, 'inline' => true],
                    ['name' => 'Discord', 'value' => $discord_username, 'inline' => true],
                    ['name' => 'Email', 'value' => $customer_email, 'inline' => true]
                ],
                'footer' => ['text' => 'EnderHOST Order System']
            ]
        ]
    ];
    
    $discord_payload = json_encode($discord_message);
    
    $discord_ch = curl_init(DISCORD_WEBHOOK_URL);
    curl_setopt($discord_ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($discord_ch, CURLOPT_POST, 1);
    curl_setopt($discord_ch, CURLOPT_POSTFIELDS, $discord_payload);
    curl_setopt($discord_ch, CURLOPT_RETURNTRANSFER, true);
    $discord_response = curl_exec($discord_ch);
    $discord_status = curl_getinfo($discord_ch, CURLINFO_HTTP_CODE);
    curl_close($discord_ch);
    
    if ($discord_status >= 200 && $discord_status < 300) {
        logError("Discord webhook notification sent for order {$order_id}", "SUCCESS");
    } else {
        logError("Failed to send Discord webhook notification for order {$order_id}. Status: {$discord_status}, Response: {$discord_response}");
    }
} else {
    logError("Discord webhook URL not configured in config.php", "WARNING");
}

// Create a helper file to test SMTP configuration
<lov-write file_path="public/api/test-smtp.php">
<?php
// This file is for testing SMTP configuration
// Access it directly in your browser to test email sending

// Load configuration
require_once '../config.php';

// Check if we're in a web environment
$is_cli = (php_sapi_name() == 'cli');

// Set headers for web environment
if (!$is_cli) {
    header('Content-Type: text/html; charset=UTF-8');
}

// Function to output messages appropriately
function output($message, $is_error = false) {
    global $is_cli;
    
    if ($is_cli) {
        echo ($is_error ? "ERROR: " : "") . $message . PHP_EOL;
    } else {
        echo "<p" . ($is_error ? " style='color:red'" : "") . ">" . htmlspecialchars($message) . "</p>";
    }
}

// Start output
if (!$is_cli) {
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>EnderHOST SMTP Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
            .success { color: green; }
            .error { color: red; }
            .info { color: blue; }
            pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        </style>
    </head>
    <body>
        <h1>EnderHOST SMTP Configuration Test</h1>";
}

output("Testing SMTP Configuration...", false);
output("SMTP Host: " . SMTP_HOST, false);
output("SMTP Port: " . SMTP_PORT, false);
output("SMTP User: " . SMTP_USER, false);
output("SMTP From: " . SMTP_FROM_EMAIL, false);

// Check if PHPMailer is properly installed
$phpmailer_files = [
    __DIR__ . '/lib/PHPMailer/src/Exception.php',
    __DIR__ . '/lib/PHPMailer/src/PHPMailer.php',
    __DIR__ . '/lib/PHPMailer/src/SMTP.php'
];

$phpmailer_missing = false;
foreach ($phpmailer_files as $file) {
    if (!file_exists($file)) {
        $phpmailer_missing = true;
        output("PHPMailer file missing: $file", true);
    }
}

if ($phpmailer_missing) {
    output("PHPMailer is not properly installed. Please check the README.md file for installation instructions.", true);
} else {
    output("PHPMailer files found.", false);
    
    // Include PHPMailer
    require_once __DIR__ . '/lib/PHPMailer/src/Exception.php';
    require_once __DIR__ . '/lib/PHPMailer/src/PHPMailer.php';
    require_once __DIR__ . '/lib/PHPMailer/src/SMTP.php';
    
    // Send test email
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->SMTPDebug = 3; // Enable verbose debug output
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = 'tls';
        $mail->Port = SMTP_PORT;
        
        // Recipients
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress(ADMIN_EMAIL);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'EnderHOST SMTP Test';
        $mail->Body = 'This is a test email to verify SMTP configuration is working correctly.';
        $mail->AltBody = 'This is a test email to verify SMTP configuration is working correctly.';
        
        ob_start();
        $mail->send();
        $debug_output = ob_get_clean();
        
        output("Test email sent successfully!", false);
        output("Debug Output:", false);
        
        if (!$is_cli) {
            echo "<pre>";
        }
        echo htmlspecialchars($debug_output);
        if (!$is_cli) {
            echo "</pre>";
        }
        
    } catch (Exception $e) {
        output("Error sending test email: " . $mail->ErrorInfo, true);
    }
}

if (!$is_cli) {
    echo "</body></html>";
}
?>
