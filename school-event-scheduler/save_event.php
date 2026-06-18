<?php
session_start();
require_once 'config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Admin access required']);
    exit();
}

try {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'delete') {
        $id = (int)$_POST['id'];
        $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
        $success = $stmt->execute([$id]);
        echo json_encode(['success' => $success]);
        exit();
    }
    
    // Handle ADD and EDIT (NO LIMIT NOW!)
    if ($action === 'add' || $action === 'edit') {
        if ($action === 'add') {
            $stmt = $pdo->prepare("
                INSERT INTO events (event_name, department, reservation_date, venue, event_time, equipment, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $success = $stmt->execute([
                trim($_POST['event_name']),
                trim($_POST['department']),
                $_POST['date'],
                trim($_POST['venue']),
                trim($_POST['event_time']),
                trim($_POST['equipment'] ?? ''),
                $_SESSION['user_id']
            ]);
            $message = 'Event added successfully!';
        } else {
            $id = (int)$_POST['id'];
            $stmt = $pdo->prepare("
                UPDATE events SET 
                event_name = ?, department = ?, venue = ?, event_time = ?, equipment = ?
                WHERE id = ?
            ");
            $success = $stmt->execute([
                trim($_POST['event_name']),
                trim($_POST['department']),
                trim($_POST['venue']),
                trim($_POST['event_time']),
                trim($_POST['equipment'] ?? ''),
                $id
            ]);
            $message = 'Event updated successfully!';
        }
        
        echo json_encode(['success' => $success, 'message' => $message]);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>