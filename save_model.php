<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $input = file_get_contents('php://input');
  if (!is_dir('models')) {
    mkdir('models');
  }
  $filename = 'models/model_' . time() . '.json';
  file_put_contents($filename, $input);
  echo json_encode(['status' => 'success', 'file' => $filename]);
} else {
  echo json_encode(['status' => 'fail', 'message' => 'Méthode non autorisée']);
}
?>