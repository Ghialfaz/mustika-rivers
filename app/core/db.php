<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "flood_iot";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("DB Connection Failed");
}
?>
