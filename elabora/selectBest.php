<?php
$servername = "sql104.epizy.com";
$username = "epiz_25370186";
$password = "W0Pq3BflOByqZr";
$dbname = "epiz_25370186_db1";

/*
$servername = "localhost";
$username = "username";
$password = "password";
$dbname = "ggg";
*/


// Creazione della connessione
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Controllo della connessione
if (!$conn) {
    echo "errore di connessione: " . mysqli_connect_errno() . "<br>";
    die("Connection failed: " . mysqli_connect_error());
}

$playerName = $_GET['name'];

// Composizione del comando SQL personal best
$sql1 = "SELECT *
        FROM leaderboard
        WHERE name = '" . $playerName . "';";

// Lancio dell'interrogazione sul DB
$result1 = mysqli_query($conn, $sql1);

if ($result1) {
    if (mysqli_num_rows($result1) > 0) {
        while ($row = mysqli_fetch_assoc($result1)) {
            echo $row["score"] . ";"; 
        }
    } else {
        echo "0;";
    }
} else {
    echo "<span>Error: " . $sql1 . "<br>" . mysqli_error($conn) . "</span>";
    echo "<BR><span> Errore numero: " . mysqli_errno($conn) . "</span>";
}

// Composizione del comando SQL
$sql2 = "SELECT MAX(score) AS maxscore
        FROM leaderboard;";

// Lancio dell'interrogazione sul DB
$result2 = mysqli_query($conn, $sql2);

if ($result2) {
    if (mysqli_num_rows($result2) > 0) {
        while ($row = mysqli_fetch_assoc($result2)) {
            echo $row["maxscore"]; 
        }
    } else {
        echo "DB vuoto";
    }
} else {
    echo "<span>Error: " . $sql2 . "<br>" . mysqli_error($conn) . "</span>";
    echo "<BR><span> Errore numero: " . mysqli_errno($conn) . "</span>";
}

// Chiusura della connessione
mysqli_close($conn);
?>