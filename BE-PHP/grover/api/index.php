<?php
/**
 * API Handler for Grover
 * Handles /client/{table} endpoints
 */

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Define environment
define('ENVIRONMENT', 'development');

// Load configuration
require_once __DIR__ . '/../inc/config.php';

// Connect to database
$conn = mysqli_connect(MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DB);
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Get the request path
$requestPath = isset($_GET['request']) ? $_GET['request'] : '';
$lastUpdate = isset($_GET['lastUpdateString']) ? intval($_GET['lastUpdateString']) : 0;

// Parse the request path to get table name
// Expected format: client/{tableName}
$parts = explode('/', trim($requestPath, '/'));

if (count($parts) < 2 || $parts[0] !== 'client') {
    http_response_code(404);
    echo json_encode(['error' => 'Invalid API endpoint']);
    exit();
}

$tableName = $parts[1];

// Map frontend table names to actual database table names
$tableMapping = [
    'calendars' => 'calendars',
    'calendar_doses' => 'calendar_doses',
    'doses' => 'calendar_doses',
    'calendars_phases' => 'calendars_phases',
    'companies' => 'companies',
    'plants' => 'plants',
    'pots' => 'pots',
    'probes_list' => 'probes_list',
    'probes_log' => 'probes_log',
    'probes_schedule' => 'probes_schedule',
    'probes_type' => 'probes_type',
    'rooms' => 'rooms',
    'strains' => 'strains',
    'workers_list' => 'workers_list',
    'workers_log' => 'workers_log',
    'workers_schedule' => 'workers_schedule',
    'workers_type' => 'workers_type',
    'locations' => 'locations',
    'mediums' => 'mediums',
    'growing_mediums' => 'mediums',
    'scenarios' => 'scenarios',
    'growing_scenarios' => 'scenarios',
    'settings' => 'settings',
    'operating_modes' => 'operating_modes'
];

// Validate table name (prevent SQL injection)
if (!array_key_exists($tableName, $tableMapping)) {
    http_response_code(404);
    echo json_encode(['error' => 'Table not found: ' . $tableName]);
    exit();
}

$fullTableName = 'grover_' . $tableMapping[$tableName];

// Build the query
$query = "SELECT * FROM `" . $fullTableName . "`";
$params = [];
$types = '';

if ($lastUpdate > 0) {
    $query .= " WHERE `lastUpdate` > ?";
    $params[] = $lastUpdate;
    $types .= 'i';
}

// Execute query
$stmt = mysqli_prepare($conn, $query);
if ($params) {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Convert numeric strings to numbers where appropriate
    foreach ($row as $key => $value) {
        if (is_numeric($value) && $key !== 'id' && strpos($value, '.') === false) {
            $row[$key] = intval($value);
        } elseif (is_numeric($value) && strpos($value, '.') !== false) {
            $row[$key] = floatval($value);
        }
    }
    $items[] = $row;
}

// Close connection
mysqli_stmt_close($stmt);
mysqli_close($conn);

// Return JSON response
echo json_encode([
    'items' => $items,
    'count' => count($items),
    'table' => $tableName,
    'lastUpdate' => $lastUpdate
]);
