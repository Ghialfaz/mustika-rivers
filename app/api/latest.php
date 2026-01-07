<?php
header("Content-Type: application/json");
require "../core/db.php";

$sql = "SELECT tinggi_air, status, created_at
        FROM data_flood
        ORDER BY created_at DESC
        LIMIT 1";

$result = $conn->query($sql);

if ($row = $result->fetch_assoc()) {
    echo json_encode([
    "tinggi_air" => (float)$row["tinggi_air"],
    "status"     => $row["status"],
    "updated"    => date("d M Y H:i:s", strtotime($row["created_at"]))
    ]);
} else {
    echo json_encode(null);
}
