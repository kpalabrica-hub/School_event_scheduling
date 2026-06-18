<?php
session_start();
require_once 'config/database.php';

header('Content-Type: application/json');

try {
    $date = $_GET['date'] ?? null;
    $month = (int)($_GET['month'] ?? (date('m') - 1));
    $year = (int)($_GET['year'] ?? date('Y'));
    $single = $_GET['single'] ?? null;
    $all = $_GET['all'] ?? null;
    
    if ($single) {
        $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
        $stmt->execute([$single]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: []);
        exit();
    }
    
    if ($all) {
        $stmt = $pdo->query("SELECT * FROM events ORDER BY reservation_date, event_time");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit();
    }
    
    $sql = "SELECT * FROM events WHERE YEAR(reservation_date) = ? AND MONTH(reservation_date) = ? ORDER BY event_time";
    $params = [$year, $month + 1];
    
    if ($date) {
        $sql = "SELECT * FROM events WHERE reservation_date = ? ORDER BY event_time";
        $params = [$date];
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>