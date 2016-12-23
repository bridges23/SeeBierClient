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

$input = json_decode(file_get_contents('php://input'), true);

foreach ($input as $tank) { //Speichert die Werte beider Tanks
    $starttime = $tank['starttime'];
    $id = $tank['id'];
    $sql = "UPDATE header SET starttime='$starttime' WHERE id='$id'";
    $result = $conn->query($sql);

    if ($conn->query($sql) === TRUE) {
        echo "Record updated successfully";
    } else {
        echo "Error updating record: " . $conn->error;
    }
}




$conn->close();


?>
