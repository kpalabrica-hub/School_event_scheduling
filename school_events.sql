-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 18, 2026 at 08:32 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school_events`
--

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `event_name` varchar(200) NOT NULL,
  `department` varchar(100) NOT NULL,
  `reservation_date` date NOT NULL,
  `venue` varchar(100) NOT NULL,
  `event_time` varchar(50) NOT NULL,
  `equipment` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `event_name`, `department`, `reservation_date`, `venue`, `event_time`, `equipment`, `created_by`, `created_at`) VALUES
(8, 'Seminar', 'Nursing', '2026-06-03', 'Conference', '8:00am - 5:00pm', 'sound system', 1, '2026-06-16 15:53:53'),
(9, 'Lecture', 'Radiologic Technology', '2026-06-13', 'Botanical', '8:00am - 5:00pm', 'projector 1, sound system', 1, '2026-06-16 15:54:45'),
(10, 'Larong Lahi', 'Criminology', '2026-07-03', 'Resort', '8:00am - 5:00pm', 'Sound System', 1, '2026-06-16 15:55:36'),
(11, 'Sports Festival', 'Accountancy', '2026-06-03', 'Quadrangle', '8:00am - 5:00pm', 'sound system', 1, '2026-06-16 15:58:52'),
(12, 'Lecture', 'Nursing', '2026-06-13', 'Auditorium', '8:00am - 5:00pm', 'microphone', 1, '2026-06-16 16:29:56'),
(13, 'meeting', 'Information Technology', '2026-07-22', 'Conference', '8:00am - 5:00pm', 'sound system', 1, '2026-06-16 16:30:44'),
(15, 'Seminar', 'Tourism Management', '2026-06-09', 'Resort', '8:00am - 5:00pm', 'speaker', 1, '2026-06-17 07:04:14'),
(16, 'meeting', 'Criminology', '2026-06-03', 'Resort', '8:00am - 5:00pm', 'sounds and mic', 1, '2026-06-17 07:32:39'),
(17, 'Larong Lahi', 'Nursing', '2026-06-03', 'Resort', '8:00am - 5:00pm', 'speaker', 1, '2026-06-17 07:33:12'),
(18, 'Sports Festival', 'Information Technology', '2026-06-03', 'Olivarez Coliseum', '8:00am - 5:00pm', 'speaker', 1, '2026-06-17 07:33:44'),
(19, 'Seminar', 'Information Technology', '2026-06-03', 'Resort', '8:00am - 5:00pm', 'kdjdsj', 1, '2026-06-17 07:57:11'),
(20, 'Seminar', 'Tourism Management', '2026-06-17', 'Botanical', '8:00am - 5:00pm', 'kk', 1, '2026-06-17 07:58:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`) VALUES
(1, 'admin@olivarezcollege.edu.ph', '0192023a7bbd73250516f069df18b500', 'admin'),
(2, 'staff@olivarezcollege.edu.ph', 'de9bf5643eabf80f4a56fda3bbb84483', 'staff');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
