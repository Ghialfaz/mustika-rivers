<?php
header("Content-Type: application/json");
require "../core/db.php";

$sql = "SELECT tinggi_air, created_at
        FROM data_flood
        ORDER BY created_at DESC
        LIMIT 30";

$result = $conn->query($sql);
$labels = [];
$values = [];

while ($row = $result->fetch_assoc()) {
    $labels[] = date("H:i", strtotime($row["created_at"]));
    $values[] = (float)$row["tinggi_air"];
}

echo json_encode([
    "labels" => array_reverse($labels),
    "values" => array_reverse($values)
]);
