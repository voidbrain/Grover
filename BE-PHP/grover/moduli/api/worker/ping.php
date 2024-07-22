<?

error_reporting(E_ALL);

$wait = 5000; // wait Timeout In Seconds
$host = '151.61.172.25';
$ports = [
    'http'  => 8084,
];

foreach ($ports as $key => $port) {
    $fp = @fsockopen($host, $port, $errCode, $errStr, $wait);
    echo "Ping $host:$port ($key) ==> ";
    if ($fp) {
        echo 'SUCCESS';
        fclose($fp);
    } else {
        echo "ERROR: $errCode - $errStr";
    }
    echo PHP_EOL;
}
