<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "flood_iot";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    http_response_code(500);
    exit("DB CONNECT ERROR");
}

$jarak  = isset($_POST['jarak']) ? floatval($_POST['jarak']) : null;
$air    = isset($_POST['air']) ? floatval($_POST['air']) : null;
$status = isset($_POST['status']) ? trim($_POST['status']) : null;

if ($jarak === null || $air === null || !$status) {
    http_response_code(400);
    exit("DATA KOSONG");
}

$thresholdAir = 1.0;
$minInterval  = 60;

$q = mysqli_query($conn, "
    SELECT tinggi_air, status, UNIX_TIMESTAMP(created_at) AS ts
    FROM data_flood
    ORDER BY id DESC
    LIMIT 1
");

$allowInsert = false;

if (!$q || mysqli_num_rows($q) === 0) {
    $allowInsert = true;
} else {
    $last = mysqli_fetch_assoc($q);

    $deltaAir  = abs($air - floatval($last['tinggi_air']));
    $deltaTime = time() - intval($last['ts']);

    if ($status !== $last['status']) {
        $allowInsert = true;
    } elseif ($deltaAir >= $thresholdAir) {
        $allowInsert = true;
    } elseif ($deltaTime >= $minInterval) {
        $allowInsert = true;
    }
}

if ($allowInsert) {
    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO data_flood (jarak, tinggi_air, status) VALUES (?, ?, ?)"
    );
    mysqli_stmt_bind_param($stmt, "dds", $jarak, $air, $status);
    mysqli_stmt_execute($stmt);

    echo "INSERTED";
} else {
    echo "SKIPPED";
}

mysqli_close($conn);
