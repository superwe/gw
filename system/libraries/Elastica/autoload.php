<?php
spl_autoload_register(function($className) {
	$thisClass = str_replace(__NAMESPACE__.'\\', '', __CLASS__);
	$baseDir = realpath(__DIR__ . DIRECTORY_SEPARATOR . '../') . DIRECTORY_SEPARATOR;

	if (substr($baseDir, -strlen($thisClass)) === $thisClass) {
		$baseDir = substr($baseDir, 0, -strlen($thisClass));
	}

	$className = ltrim($className, '\\');
	$fileName  = $baseDir;
	if ($lastNsPos = strripos($className, '\\')) {
		$namespace = substr($className, 0, $lastNsPos);
		$className = substr($className, $lastNsPos + 1);
		$fileName  .= str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
	}
	$fileName .= str_replace('_', DIRECTORY_SEPARATOR, $className) . '.php';

	if (file_exists($fileName)) {
		require $fileName;
	}
});