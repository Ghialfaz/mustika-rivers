<?php
header("Content-Type: application/json");
require "../core/db.php";

$sql = "SELECT tinggi_air, status, created_at
        FROM data_flood
        ORDER BY created_at DESC
        LIMIT 10";

$result = $conn->query($sql);
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = [
    "time"  => date("H:i:s", strtotime($row["created_at"])),
    "air"   => (float)$row["tinggi_air"],
    "status"=> $row["status"]
    ];
}

echo json_encode($data);
