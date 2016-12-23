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
    $id = $tank['id'];
    $sql_delete = "DELETE FROM steps WHERE tank_id='$id'";
    $result_delete = $conn->query($sql_delete);

    foreach ($tank['steps'] as $steps) {
        $tank_id = $id;
        $step_duration = $steps['step_duration'];
        $step_temperature = $steps['step_temperature'];
        $sql_create = "INSERT INTO steps (tank_id, step_duration, step_temperature)  VALUES ('$tank_id','$step_duration','$step_temperature')";
        $result_insert = $conn->query($sql_create);
    }
}


$conn->close();


?>
