<?php
	session_start(); //Sessions are used to limit the ajax need and the communication between server and velib server (velib servers will block you if you make too many requests).
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
		
<?php
	if(!is_file('data/data')) //First run
	{
		//Define a new synchronisation code
		$code_synchro = substr(sha1(rand(0,30).time().rand(0,30)),0,10);
		
		file_put_contents('data/data', base64_encode(gzdeflate(serialize(array($code_synchro, ''))))); //Save it in data/data file
		
		$_GET['code'] = $code_synchro;
		
		echo "<p>
				Définition du code de synchronisation.<br/>
				Vous pouvez désormais mettre à jour la liste des stations en visitant l'adresse suivante (update URL) :<br/>
				<a href='http://" . $_SERVER["SERVER_NAME"].$_SERVER['REQUEST_URI']."?update=1&code=".$code_synchro."'>http://" . $_SERVER["SERVER_NAME"].$_SERVER['REQUEST_URI']."?update=1&code=".$code_synchro."</a>
			</p>
			<p>
				Il est possible d'automatiser la tâche via une tâche cron. Par exemple (see README) :<br/>
				* * * * * wget -q -O <a href='http://" . $_SERVER["SERVER_NAME"].$_SERVER['REQUEST_URI']."?update=1&code=".$code_synchro."'>http://" . $_SERVER["SERVER_NAME"].$_SERVER['REQUEST_URI']."?update=1&code=".$code_synchro."</a> #Commande de mise a jour des stations de velib
			</p>";
	}
	
	if(!empty($_GET['update']) || !empty($code_synchro)) //If we want to make an update (or first run)
	{
		if(empty($code_synchro) && is_file('data/data')) //If not first run, get the synchronisation code from data file
		{
			$data = unserialize(gzinflate(base64_decode(file_get_contents('data/data'))));
			$code_synchro = $data[0];
		}
	
		if(!empty($_GET['code']) && $_GET['code'] == $code_synchro) //Once we have the code and it is correct
		{
			$stations_xml = simplexml_load_file('http://www.velib.paris.fr/service/carto');

			$liste_stations = $stations_xml->markers->marker; //Get the stations list

			foreach($liste_stations as $station)
			{
				$stations[] = array('name' => htmlentities((string) $station['name']), 'id' => (int) $station['number'], 'address' => htmlentities((string) $station['fullAddress']), 'lat' => (float) $station['lat'], 'lng' => (float) $station['lng'], 'open' => (int) $station['open'], 'bonus' => (int) $station['bonus'], 'free' => 0, 'available' => 0, 'updated' => 0);
			}
	
			file_put_contents('data/data', base64_encode(gzdeflate(serialize(array($code_synchro, $stations))))); //And put the content in the data file
	
			echo "<p>Mise à jour de la liste des stations effectuée avec succès (Update successful).</p>";
		}
		else
		{
			echo "<p>Mauvais code de vérification (Error : bad synchronisation code). Veuillez réessayer la mise à jour. Se référer au README pour plus d'informations sur la mise à jour.</p>";
		}
		echo "<p><a href='index.php'>Retourner à l'application (Back to index)</a></p>";
	}
	else
	{
?>
		<div id="see_map"></div>
		<div id="stations"></div>
		<?php
			if(!empty($_GET['map']))
			{
		?>
				<div id="map"></div>
		<?php
				$param = (!empty($_GET['available'])) ? 'available' : 'free';
				echo "<p><a href='index.php?".$param."=1'>← Retour à la liste</a></p>";
			}
			if(!empty($_GET))
			{
				echo "<hr/>";
			}
		?>
		<div id="position">
			<p><strong>Votre navigateur doit prendre en charge la géolocalisation pour que ce site puisse fonctionner correctement.<br/>Your browser must have geolocation capabilities for this site to display.</strong></p>
		</div>
		<hr/>
		<p id="thanks">Map is handled thanks to the <a href="http://leafletjs.com/">Leaflet</a> library, using © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors tiles. Reverse geolocation (Nominatim) are provided by the <a href="http://www.mapquest.com/" alt="MapQuest icon">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png"> open API. Routes are provided by <a href='http://project-osrm.org/'>the OSRM project</a> (OSRM is a free and open source program under GNU Affero GPL).</p>
		<p id="suggestions">N'hésitez pas à m'envoyer vos suggestions à <a href="mailto:webmaster@phyks.me">webmaster@phyks.me</a>.</p>
	</body>
</html>
<?php		
	}
?>
