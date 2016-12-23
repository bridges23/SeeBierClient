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

$sql = "SELECT * FROM header";
$result = $conn->query($sql);

$counter = 0;
if ($result->num_rows > 0) {
    // output data of each row
    $data = array();

    while($row = $result->fetch_assoc()) {
        $tank = array(
                        'id'            => $row["id"],
                        'starttime'     => $row["starttime"],
                        'temp_beer'     => $row["temp_beer"],
                        'temp_air'      => $row["temp_air"],
                        'temp_target'   => $row["temp_target"],
                        'steps'         => array(

                        )


                    );
        array_push($data, $tank);

        $id = $row["id"];
        $sql_step = "SELECT * FROM steps WHERE tank_id = '$id'";
        $result_step = $conn->query($sql_step);
            if ($result_step->num_rows > 0) {
                while($row_step = $result_step->fetch_assoc()) {
                    $step = array (
                        'step_duration'     => $row_step["step_duration"],
                        'step_temperature'  => $row_step["step_temperature"]
                    );
                    array_push($data[$counter]['steps'],$step);
                }
                }

            $counter = $counter + 1;
            //echo "id: " . $row["id"]. " - starttime: " . $row["starttime"]. " Temperatur Bier" . $row["temp_beer"]. "<br>";
    }

    header('Content-Type: application/json');
    echo json_encode($data);

} else {
    echo "0 results";
}
$conn->close();


?>
