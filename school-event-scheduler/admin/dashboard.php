<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header('Location: ../login.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Event Scheduler | Olivarez College</title>
    <link rel="stylesheet" href="../css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="dashboard" data-user-role="admin">
    <div class="header">
        <div class="logo">
            <img src="../images/OC-LOGO.png" alt="Olivarez College">
            <span>Olivarez College | Admin Dashboard</span>
        </div>
        <div class="header-controls">
            <div class="view-toggle">
                <button id="calendar-view-btn" class="btn toggle-btn active"><i class="fas fa-calendar-alt"></i> Calendar</button>
                <button id="list-view-btn" class="btn toggle-btn"><i class="fas fa-list"></i> List Form</button>
            </div>
            <div class="user-info">
                <span><i class="fas fa-user-shield"></i> Admin</span>
                <a href="../logout.php" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="page-title">
            <h1>Event Management</h1>
            <p class="page-subtitle">Create and manage all school events from one place.</p>
        </div>
        
        <div class="calendar-container">
            <div class="calendar-header">
                <div class="calendar-controls">
                <button id="prev-month" class="btn">
                    <i class="fas fa-chevron-left"></i>
                </button>
                    <h2 id="calendar-title" class="calendar-title"></h2>
                <button id="next-month" class="btn">
                    <i class="fas fa-chevron-right"></i>
                </button>
                </div>
            </div>
            <div class="calendar-grid"></div>
        </div>
        
        <div id="list-view-container" class="list-view-container" style="display: none;">
            <div class="list-header">
                <h2>All Events</h2>
                <div class="list-controls">
                    <input type="text" id="list-search" placeholder="Search events...">
                    <select id="list-filter">
                        <option value="">All Months</option>
                    </select>
                    <button class="btn btn-primary" onclick="showAddEventModal()">
                        <i class="fas fa-plus-circle"></i> Add Event
                    </button>
                </div>
            </div>
            <div id="events-list" class="events-list"></div>
        </div>
    </div>
    
    <!-- Event Modal -->
    <div id="eventModal" class="modal">
        <div class="modal-content">
            <div id="modalTitle"></div>
            <div id="modalBody"></div>
        </div>
    </div>
    
    <script src="../js/script.js"></script>
</body>
</html>