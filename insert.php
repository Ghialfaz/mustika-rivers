<?php
// koneksi database
$host = "localhost";
$user = "root";
$pass = "";
$db   = "flood_iot";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Koneksi gagal");
}

// ambil data dari ESP32
$jarak  = $_POST['jarak'] ?? null;
$air    = $_POST['air'] ?? null;
$status = $_POST['status'] ?? null;

if ($jarak && $air && $status) {

    $sql = "INSERT INTO data_flood (jarak, tinggi_air, status)
            VALUES ('$jarak', '$air', '$status')";

    if (mysqli_query($conn, $sql)) {
        echo "OK";
    } else {
        echo "DB ERROR";
    }

} else {
    echo "DATA KOSONG";
}

mysqli_close($conn);
?>
