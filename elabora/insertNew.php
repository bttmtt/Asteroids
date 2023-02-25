<?php

$servername = "sql105.epizy.com";
$username = "epiz_33673290";
$password = "Y8v7oKOV1T";
$dbname = "epiz_33673290_database1";

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

$playerName = $_POST['name'];
$playerScore = $_POST['score'];

// Composizione del comando SQL per vedere se ha gia un record a suo nome
$sql1 = "SELECT score
        FROM leaderboard
        WHERE name = '" . $playerName . "';";

// Lancio dell'interrogazione sul DB
$result1 = mysqli_query($conn, $sql1);

if ($result1) {
    if (mysqli_num_rows($result1) > 0) {
        while ($row = mysqli_fetch_assoc($result1)) {
            // se ha gia un record 
            if ($row["score"] < $playerScore) { // se il nuovo record è maggiore
                $sql2 = "DELETE FROM leaderboard
                        WHERE name = '" . $playerName . "';";
                mysqli_query($conn, $sql2);
                $sql3 = "INSERT INTO leaderboard (name, score)
                        VALUES ('" . $playerName . "', '" . $playerScore . "')";
                mysqli_query($conn, $sql3);
            }
        }
    } else { // se non esiste nel db
        $sql4 = "INSERT INTO leaderboard (name, score)
                VALUES ('" . $playerName . "', '" . $playerScore . "')";
        mysqli_query($conn, $sql4);
    }
} else {
    echo "<span>Error: " . $sql1 . "<br>" . mysqli_error($conn) . "</span>";
    echo "<BR><span> Errore numero: " . mysqli_errno($conn) . "</span>";
}

// Chiusura della connessione
mysqli_close($conn);