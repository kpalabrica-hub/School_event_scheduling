<?php
session_start();
require_once 'config/database.php';

if(isset($_SESSION['user_id'])) {
    $role = $_SESSION['role'];
    if($role == 'admin') {
        header('Location: admin/dashboard.php');
    } else {
        header('Location: staff/dashboard.php');
    }
    exit();
}

$error = '';

if($_POST) {
    $email = $_POST['email'];
    $password = md5($_POST['password']);
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
    $stmt->execute([$email, $password]);
    $user = $stmt->fetch();
    
    if($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        
        if($user['role'] == 'admin') {
            header('Location: admin/dashboard.php');
        } else {
            header('Location: staff/dashboard.php');
        }
        exit();
    } else {
        $error = 'Invalid credentials!';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>School Event Scheduler - Login</title>
    <link rel="stylesheet" href="css/style.css?v=2">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="login-body">
    <img src="images/school-bg.png" alt="School Logo" class="bg-image">
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <i class="fas fa-calendar-alt"></i>

                <img src="images/OC-LOGO.png" alt="School Logo" class="login-school-logo">

                <h1>Welcome to OCESS!</h1>
                <h2>Olivarez College Event Scheduling System</h2>
            </div>
            <form method="POST" class="login-form">
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email</label>
                    <input type="email" name="email" required placeholder="example@olivarezcollege.edu.ph">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-lock"></i> Password</label>
                    <input type="password" name="password" required placeholder="**********">
                </div>
                <?php if($error): ?>
                    <div class="error-message"><?php echo $error; ?></div>
                <?php endif; ?>
                <button type="submit" class="login-btn">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
            </form>
            
        </div>
    </div>
</body>
</html>