<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Collect form data
    $studentName = htmlspecialchars($_POST['studentName']);
    $studentAge = intval($_POST['studentAge']);
    $parentName = htmlspecialchars($_POST['parentName']);
    $contactNumber = htmlspecialchars($_POST['contactNumber']);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $auditionDate = htmlspecialchars($_POST['auditionDate']);
    $songChoice = htmlspecialchars($_POST['songChoice']);

    // Validate required fields
    if (empty($studentName) || empty($studentAge) || empty($parentName) || empty($contactNumber) || empty($email) || empty($auditionDate)) {
        echo "All required fields must be filled out.";
        exit;
    }

    // Save data to a file (or replace this with database logic)
    $data = [
        'Student Name' => $studentName,
        'Student Age' => $studentAge,
        'Parent Name' => $parentName,
        'Contact Number' => $contactNumber,
        'Email' => $email,
        'Audition Date' => $auditionDate,
        'Song Choice' => $songChoice
    ];
    $dataString = json_encode($data) . PHP_EOL;

    $file = 'audition-submissions.txt';
    if (file_put_contents($file, $dataString, FILE_APPEND | LOCK_EX)) {
        echo "Thank you for signing up! Your audition details have been submitted.";
    } else {
        echo "There was an error saving your submission. Please try again.";
    }
} else {
    echo "Invalid request method.";
}
?>
