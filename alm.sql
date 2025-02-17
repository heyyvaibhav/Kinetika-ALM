-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 17, 2025 at 12:02 PM
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
-- Database: `alm`
--

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `attachment_id` bigint(20) UNSIGNED NOT NULL,
  `issue_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `comment_id` bigint(20) UNSIGNED NOT NULL,
  `issue_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `comment_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`comment_id`, `issue_id`, `user_id`, `comment_text`, `created_at`) VALUES
(1, 4, 1, 'This is a test comment.', '2025-02-05 11:50:00'),
(2, 4, 1, 'This is a test comment.', '2025-02-05 11:50:24'),
(3, 7, 1, 'This is a test comment.', '2025-02-05 12:00:14'),
(4, 7, NULL, 'This is a test comment.', '2025-02-05 12:00:21'),
(5, 6, 4, 'This is a test comment....', '2025-02-05 12:03:16'),
(6, 3, 1, 'this is a testingggg', '2025-02-05 12:19:07'),
(7, 3, 1, 'eherheemym', '2025-02-05 12:25:59'),
(8, 3, 1, 'rtrntu,gs', '2025-02-05 12:29:11'),
(9, 1, 1, 'hello', '2025-02-05 13:26:41'),
(10, 1, 1, 'hello again', '2025-02-05 13:27:21'),
(11, 1, 1, 'uhjnjuhvnevkl', '2025-02-05 13:27:27');

-- --------------------------------------------------------

--
-- Table structure for table `issuehistory`
--

CREATE TABLE `issuehistory` (
  `history_id` bigint(20) UNSIGNED NOT NULL,
  `issue_id` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `field_changed` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `issuekeys`
--

CREATE TABLE `issuekeys` (
  `issue_key_id` bigint(20) UNSIGNED NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `issue_key_prefix` varchar(10) NOT NULL,
  `current_number` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `issuekeys`
--

INSERT INTO `issuekeys` (`issue_key_id`, `project_id`, `issue_key_prefix`, `current_number`) VALUES
(1, 7, 'PROJ7', 2),
(2, NULL, 'PROJundefi', 1),
(3, NULL, 'PROJundefi', 1),
(4, NULL, 'PROJundefi', 1),
(5, 3, 'PROJ3', 3),
(6, 8, 'PROJ8', 4),
(7, 6, 'PROJ6', 2),
(8, 9, 'PROJ9', 1),
(9, 5, 'PROJ5', 2),
(10, 2, 'PROJ2', 1),
(11, 0, 'PROJ', 1),
(12, 1, 'PROJ1', 1);

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `issue_id` bigint(20) UNSIGNED NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `issue_key` varchar(20) NOT NULL,
  `summary` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `flagged` tinyint(1) DEFAULT NULL,
  `issue_type_id` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `priority` varchar(20) DEFAULT 'Medium',
  `reporter_id` int(11) DEFAULT NULL,
  `assignee_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `issues`
--

INSERT INTO `issues` (`issue_id`, `project_id`, `issue_key`, `summary`, `description`, `flagged`, `issue_type_id`, `status`, `priority`, `reporter_id`, `assignee_id`, `created_at`, `updated_at`) VALUES
(1, 7, 'PROJ7-1', '', 'The login button does not respond when clicked.', 0, NULL, 1, 'High', 101, NULL, '2025-01-29 14:57:47', '2025-02-05 14:08:00'),
(2, 1, 'ISS-001', 'Login page not loading', 'Users report that the login page fails to load.', 0, 1, 1, 'High', 201, 301, '2024-12-01 04:30:00', '2024-12-01 04:30:00'),
(3, 2, 'ISS-002', '', 'The GET /users API returns a 500 error.', 0, NULL, 0, 'High', 202, NULL, '2024-12-02 06:00:00', '2025-02-05 13:53:20'),
(4, 3, 'ISS-003', 'Update UI components', 'Redesign button styles and improve spacing.', 0, 3, 0, 'Low', 203, 303, '2024-12-03 08:30:00', '2024-12-04 04:15:00'),
(5, 5, 'ISS-004', 'Optimize database queries', 'Slow response time on heavy queries.', 0, 4, 0, 'Medium', 204, NULL, '2024-12-04 10:50:00', '2024-12-04 10:50:00'),
(6, 5, 'ISS-005', '', 'Implement dark mode for better accessibility. svsv', 0, NULL, 0, 'high', 205, NULL, '2024-12-05 02:30:00', '2025-02-05 13:47:13'),
(7, 6, 'ISS-006', 'Fix email notifications', 'Users are not receiving email notifications.', 0, 2, 0, 'High', 206, 306, '2024-12-06 04:00:00', '2024-12-06 04:00:00'),
(8, 7, 'ISS-007', 'Refactor backend services', 'Improve microservices architecture.', 0, 4, 0, 'Medium', 207, NULL, '2024-12-07 07:15:00', '2024-12-08 08:50:00'),
(9, 8, 'ISS-008', 'Fix logout issue', 'Users remain logged in after logout.', 0, 1, 0, 'Low', 208, 308, '2024-12-08 09:40:00', '2024-12-09 10:30:00'),
(10, 2, 'ISS-009', 'Enhance security policies', 'Add stricter validation on input fields.', 0, 3, 0, 'High', 209, NULL, '2024-12-09 12:55:00', '2024-12-09 12:55:00'),
(11, 5, 'ISS-010', 'Add user analytics', 'Track user interactions on the dashboard.', 0, 5, 0, 'Low', 210, 310, '2024-12-10 02:00:00', '2024-12-11 03:15:00'),
(12, NULL, 'PROJundefined-1', 'xyz', 'wscs', 0, NULL, 0, 'Mid', NULL, NULL, '2025-02-05 06:59:36', '2025-02-05 06:59:36'),
(14, 3, 'PROJ3-1', 'bhrfsbrs', 'ettjn', 0, NULL, 0, 'Low', NULL, NULL, '2025-02-05 07:09:55', '2025-02-05 07:09:55'),
(15, 3, 'PROJ3-2', 'hebn', 'erbrw', 0, 1, 0, 'Low', NULL, NULL, '2025-02-05 07:11:00', '2025-02-05 07:11:00'),
(16, 8, 'PROJ8-1', '', 'egrryn', 0, 1, 0, 'Low', NULL, NULL, '2025-02-05 07:15:17', '2025-02-05 07:15:17'),
(17, 6, 'PROJ6-1', '', 'testing', NULL, 7, 0, 'High', NULL, NULL, '2025-02-05 07:16:32', '2025-02-05 07:16:32'),
(18, 8, 'PROJ8-2', '', '', NULL, NULL, 0, 'High', NULL, NULL, '2025-02-05 07:18:33', '2025-02-17 10:41:11'),
(19, 6, 'PROJ6-2', '', '', NULL, 5, 0, 'Mid', NULL, NULL, '2025-02-05 07:21:25', '2025-02-05 07:21:25'),
(20, 9, 'PROJ9-1', 'hello', '', NULL, 5, 0, 'Mid', NULL, NULL, '2025-02-05 07:24:31', '2025-02-05 07:24:31'),
(21, 5, 'PROJ5-1', '', 'why', NULL, 15, 0, 'Low', NULL, NULL, '2025-02-05 07:32:47', '2025-02-05 07:32:47'),
(22, 8, 'PROJ8-4', '', '', NULL, 1, 0, 'Low', NULL, NULL, '2025-02-05 07:35:41', '2025-02-05 07:35:41'),
(23, 7, 'PROJ7-2', '', 'ugugguuo', NULL, 7, 0, 'Low', NULL, NULL, '2025-02-05 07:39:46', '2025-02-05 07:39:46'),
(24, 2, 'PROJ2-1', 'dummy', 'users added', NULL, 7, 0, 'Mid', NULL, NULL, '2025-02-10 14:33:03', '2025-02-10 14:33:03'),
(25, 0, 'PROJ-1', 'jj', '. j,hm', NULL, 5, 0, 'Low', NULL, NULL, '2025-02-11 13:16:44', '2025-02-11 13:16:44'),
(26, 3, 'PROJ3-3', 'jeca sj', 'hhkfxxcjkjl;lmk', NULL, 3, 0, 'High', NULL, NULL, '2025-02-11 13:17:15', '2025-02-11 13:17:15'),
(27, 1, 'PROJ1-1', 'oll,/', 'knvfh', NULL, 4, 0, 'Low', NULL, NULL, '2025-02-11 13:18:48', '2025-02-11 13:18:48'),
(28, 5, 'PROJ5-2', '', '', NULL, 3, 0, 'Low', NULL, NULL, '2025-02-11 13:19:35', '2025-02-11 13:19:35');

-- --------------------------------------------------------

--
-- Table structure for table `issuetypes`
--

CREATE TABLE `issuetypes` (
  `issue_type_id` bigint(20) UNSIGNED NOT NULL,
  `issue_type_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `issuetypes`
--

INSERT INTO `issuetypes` (`issue_type_id`, `issue_type_name`, `description`) VALUES
(1, 'Epic', 'A large body of work that can be broken down into smaller tasks (e.g., stories, tasks, or bugs).'),
(2, 'Story (User Story)', 'Represents a feature or functionality from the end-user\'s perspective.'),
(3, 'Task', 'A piece of work that needs to be completed.'),
(4, 'Bug', 'Represents a defect or issue in the software that needs to be fixed.'),
(5, 'Sub-task', 'A smaller, more granular piece of work that is part of a larger issue (e.g., a story or task).'),
(6, 'Incident', 'Used to track unexpected issues or outages in a production environment.'),
(7, 'Change Request', 'Represents a request to modify an existing feature or system.'),
(8, 'New Feature', 'Represents a request for a new functionality or feature to be added to the system.'),
(9, 'Improvement', 'Represents an enhancement or optimization of an existing feature.'),
(10, 'Technical Debt', 'Represents work that needs to be done to address code quality or architectural issues.'),
(11, 'Test Case', 'Represents a specific test scenario to validate functionality.'),
(12, 'Test Execution', 'Represents the execution of a test case and its results.'),
(13, 'Requirement', 'Represents a specific need or condition that must be met by the system.'),
(14, 'Risk', 'Represents a potential issue or threat that could impact the project.'),
(15, 'Defect', 'Similar to a bug, but often used in formal testing processes to track issues found during testing.'),
(16, 'Spike', 'Represents a time-boxed research or investigation task to explore a solution or gather information.'),
(17, 'Documentation', 'Represents work related to creating or updating documentation.'),
(18, 'Support Ticket', 'Represents a request from a user or customer for assistance or resolution of an issue.');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `permission_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `project_id` bigint(20) UNSIGNED NOT NULL,
  `project_key` varchar(10) NOT NULL,
  `project_name` varchar(100) NOT NULL,
  `project_description` text DEFAULT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`project_id`, `project_key`, `project_name`, `project_description`, `lead_id`, `created_at`) VALUES
(1, 'KED', 'KEDAR Test', 'KEDAR Test', 1, '2025-01-26 19:44:15'),
(2, 'Test2', 'TESt', 'TTESt', 1, '2025-01-26 19:44:46'),
(3, 'PROJ123', 'Issue Tracking System', 'A project to manage and track issues.', 2, '2025-01-29 14:40:31'),
(5, 'PROJ122', 'Issue Tracking System', 'A project to manage and track issues.', 2, '2025-01-29 14:43:51'),
(6, 'PROJ128', 'Issue Tracking System', 'A project to manage and track issues.', 2, '2025-01-29 14:47:06'),
(7, 'PROJ198', 'Issue Tracking System', 'A project to manage and track issues.', 2, '2025-01-29 14:52:30'),
(8, 'v123', 'v12', 'alm type', 1, '2025-01-30 04:50:56'),
(9, 'hkeokh', 'rher', '3wngj bh', 2, '2025-01-30 05:07:07'),
(10, 'kbk', 'jbbjl', 'ktuyr', 1, '2025-02-11 13:10:37'),
(11, ' k  ', 'jbk gbj', 'gxetzru', 1, '2025-02-11 13:11:11'),
(12, 'bm,', 'lbjbjj', 'hjxryxyki', 1, '2025-02-11 13:15:27');

-- --------------------------------------------------------

--
-- Table structure for table `status_list`
--

CREATE TABLE `status_list` (
  `ID` int(11) NOT NULL,
  `Name` varchar(25) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status_list`
--

INSERT INTO `status_list` (`ID`, `Name`, `created_at`, `updated_at`) VALUES
(1, 'To Do', '2025-02-11 12:13:17', '2025-02-11 12:13:17'),
(2, 'In Progress', '2025-02-11 12:13:17', '2025-02-11 12:13:17'),
(3, 'Done', '2025-02-11 12:13:17', '2025-02-11 12:13:17');

--
-- Triggers `status_list`
--
DELIMITER $$
CREATE TRIGGER `limit_status_list` BEFORE INSERT ON `status_list` FOR EACH ROW BEGIN
    DECLARE total_rows INT;
    
    -- Count the number of existing rows
    SELECT COUNT(*) INTO total_rows FROM Status_List;
    
    -- If there are already 10 rows, prevent insertion
    IF total_rows >= 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Maximum 10 entries allowed in Status_List table';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `FailedLoginAttempts` int(11) NOT NULL DEFAULT 0,
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  `role` int(2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `full_name`, `FailedLoginAttempts`, `Status`, `role`, `created_at`) VALUES
(1, 'Vaibhav', 'vaibhav.a@kinetikalabs.com', '$2a$12$TqGEABdkJPk0hZClmPmoA.mjlvqcEdvst5lNNYA7cW6TSoe0ciq4.', 'Vaibhav Agarwal', 0, 'Active', 1, '2025-02-10 12:51:43'),
(2, 'Kinetika Labs', 'contact@kinetikalabs.com', '$2a$12$J.x7SRKTuk4FK/b8Qy536.FzJVo66p9H89smrTDxoM0wrZgYT0r5m', 'Kedar Aundhekar', 0, 'Active', 1, '2025-02-11 05:39:28'),
(3, 'Venkatesh', 'venkatesh.k@kinetikalabs.com', '$2a$12$9xooQHHwG0UiGLkyfEMGw.yrGG1iU7klyuxqXHKv7sTOZtSLjzCwe', 'Venkatesh Korra', 0, 'Active', 1, '2025-02-11 10:41:32'),
(5, 'Bharath', 'bharath.t@kinetikalabs.com', '$2a$12$64Y5Ve9X0.tzHaoJl6cnF.oJ1EnLB6EBaDqKCSQoRnpa.En6BgJkm', 'Bharath Thavidishetty', 0, 'Active', 1, '2025-02-11 10:43:45'),
(6, 'Aparna', 'aparna.k@kinetikalabs.com', '$2a$12$1T6n/hisGNeH8bSf7lF6neYdXnQbnaGe97ELj1Pqer0u1MTellPoK', 'Aparna Kulkarni', 0, 'Active', 1, '2025-02-11 10:44:41');

-- --------------------------------------------------------

--
-- Table structure for table `workflows`
--

CREATE TABLE `workflows` (
  `workflow_id` bigint(20) UNSIGNED NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `status_from` varchar(50) NOT NULL,
  `status_to` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`attachment_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`);

--
-- Indexes for table `issuehistory`
--
ALTER TABLE `issuehistory`
  ADD PRIMARY KEY (`history_id`);

--
-- Indexes for table `issuekeys`
--
ALTER TABLE `issuekeys`
  ADD PRIMARY KEY (`issue_key_id`),
  ADD UNIQUE KEY `project_id` (`project_id`,`issue_key_prefix`);

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`issue_id`),
  ADD UNIQUE KEY `issue_key` (`issue_key`),
  ADD UNIQUE KEY `issue_id` (`issue_id`);

--
-- Indexes for table `issuetypes`
--
ALTER TABLE `issuetypes`
  ADD PRIMARY KEY (`issue_type_id`),
  ADD UNIQUE KEY `issue_type_name` (`issue_type_name`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`project_id`),
  ADD UNIQUE KEY `project_key` (`project_key`);

--
-- Indexes for table `status_list`
--
ALTER TABLE `status_list`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `workflows`
--
ALTER TABLE `workflows`
  ADD PRIMARY KEY (`workflow_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `attachment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `issuehistory`
--
ALTER TABLE `issuehistory`
  MODIFY `history_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `issuekeys`
--
ALTER TABLE `issuekeys`
  MODIFY `issue_key_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `issues`
--
ALTER TABLE `issues`
  MODIFY `issue_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `issuetypes`
--
ALTER TABLE `issuetypes`
  MODIFY `issue_type_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `project_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `status_list`
--
ALTER TABLE `status_list`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `workflows`
--
ALTER TABLE `workflows`
  MODIFY `workflow_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
