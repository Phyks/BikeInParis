<?php
	session_start();
	
	if(empty($_GET['station']) || !is_file('data/data'))
	{
		header('location: index.php');
	}
?>
<!DOCTYPE html>
<html lang="fr">
	<head>
		<meta charset="utf-8">
		<title>Vélibs à proximité</title>
		<meta name="description" content="">
		<meta name="author" content="phyks">
		<link rel="shortcut icon" href="favicon.ico">
		<link rel="stylesheet" href="main.css" type="text/css" media="screen">
		
		<link rel="stylesheet" href="leaflet.css" />
		<!--[if lte IE 8]>
			<link rel="stylesheet" href="leaflet.ie.css" />
		<![endif]-->
		<script src="leaflet.js"></script>
		<script type="text/javascript" src="Polyline.encoded.js"></script>
		<script type="text/javascript" src="js.js"></script>
	</head>
	<body>
		<h1><a href="index.php">Vélibs à proximité</a></h1>
		
		<div id="stations"></div>
		<div id="map" style="height: 500px;"></div>
		
		<?php
			$param = (!empty($_GET['available'])) ? 'available' : 'free';
			echo "<p><a href='index.php?".$param."=1'>← Retour à la liste</a></p>";
		?>
		
		<hr/>
		
		<div id="position">
			<p><strong>Votre navigateur doit prendre en charge la géolocalisation pour que ce site puisse fonctionner correctement.</strong></p>
		</div>
		
		<hr/>
		<p id="thanks">Map is handled thanks to the <a href="http://leafletjs.com/">Leaflet</a> library, using © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors tiles. Reverse geolocation (Nominatim) are provided by the <a href="http://www.mapquest.com/" alt="MapQuest icon">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png"> open API. Routes are provided by <a href='http://project-osrm.org/'>the OSRM project</a> (OSRM is a free and open source program under GNU Affero GPL).</p>
		<p id="suggestions">N'hésitez pas à m'envoyer vos suggestions à <a href="mailto:webmaster@phyks.me">webmaster@phyks.me</a>.</p>
	</body>
</html>
