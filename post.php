<?php


$servername = "localhost";
$username = "root";
$password = "";
$dbname = "seebier";


// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo file_get_contents('php://input');

$conn->close();


?>
