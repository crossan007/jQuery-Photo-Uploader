<?php

$base64 = $_POST['imgBase64'];

$img = str_replace('data:image/png;base64,', '', $base64);
$img = str_replace(' ', '+', $img);
$fileData = base64_decode($img);
$temp_file = __DIR__."/lastImage.png";
file_put_contents($temp_file , $fileData);

echo json_encode(array("status"=>"success"));
?>