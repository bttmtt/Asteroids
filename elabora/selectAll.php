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

// Composizione del comando SQL
$sql = "SELECT * 
        FROM leaderboard 
        ORDER BY score DESC
        LIMIT 15;";

// Lancio dell'interrogazione sul DB
$result = mysqli_query($conn, $sql);

if ($result) {
    if (mysqli_num_rows($result) > 0) {
        echo "<table id='scoreTable'>";
        echo "<tr> <td colspan='3' id='tableTitle'> LEADERBOARD </td> </tr>";
        $i = 1;
        while ($row = mysqli_fetch_assoc($result)) {
                echo "<tr> <td id='r" . $i . "'> #" . $i . "</td> <td id='n" . $i . "'>" 
                . $row["name"] . "</td> <td id='s" . $i . "'>" . $row["score"] . "</td> </tr>";
                $i++;
        }
        echo "</table>";
    } else {
        echo "DB vuoto";
    }
} else {
    echo "<span>Error: " . $sql . "<br>" . mysqli_error($conn) . "</span>";
    echo "<BR><span> Errore numero: " . mysqli_errno($conn) . "</span>";
}

// Chiusura della connessione
mysqli_close($conn);
