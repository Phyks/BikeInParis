<?php
	session_start();
	
	//AJAX query code
	if(!empty($_POST['latitude']) && !empty($_POST['longitude']) && (!empty($_POST['available']) || !empty($_POST['free'])) && !empty($_POST['email']) && !empty($_POST['reverse_geolocation_provider']) && !empty($_POST['directions_provider']))
	{
		$updated_position = false;
		$updated_stations = false;
		
		//Define UserAgent etc
		$opts = array(
						'http'=>array(
										'method'=>"GET",
										'header'=>"Accept-language: fr\r\n" .
										"Referer: ".$_SERVER['HTTP_REFERER']. 
										"User-Agent: Velib service at http://velib.phyks.me (contact : webmaster@phyks.me) \r\n"
									)
					);
		$context = stream_context_create($opts);
		
		//Check wether the position was updated
		//-------------------------------------
		
		//Convert latitude and longitude to degrees (useful for calculation)
		$latitude = deg2rad((float) $_POST['latitude']);
		$longitude = deg2rad((float) $_POST['longitude']);
		
		$a = pow(sin($_SESSION['latitude'] - $latitude)/2, 2) + cos($latitude)*cos($_SESSION['latitude'])*pow(sin($_SESSION['longitude'] - $longitude)/2, 2);
		$c = 2*atan2(sqrt($a),sqrt(1-$a));
		$R = 6371000;
		$distance = $R*$c;
		
		if(empty($_SESSION['latitude']) || empty($_SESSION['longitude']) || empty($_SESSION['reverse_geolocation']) || $distance >= 25 || empty($_SESSION['distances']))
		{
			$_SESSION['latitude'] = $_POST['latitude'];
			$_SESSION['longitude'] = $_POST['longitude'];
			$updated_position = true;
		}
		
		//If yes, update the address
		if($updated_position)
		{
			$reverse_geolocation_json = file_get_contents($_POST['reverse_geolocation_provider']."?format=json&lat=".$_POST['latitude']."&lon=".$_POST['longitude']."&zoom=18&addressdetails=1&email=".$_POST['email'], false, $context);
			$reverse_geolocation_json = json_decode($reverse_geolocation_json, true);
			
			$reverse_geolocation = '';
			foreach($reverse_geolocation_json['address'] as $key=>$element)
			{
				if($key == 'city')
					break;
		
				if(!empty($reverse_geolocation))
					$reverse_geolocation .= ", ";
		
				$reverse_geolocation .= $element;
			}
			
			$_SESSION['reverse_geolocation'] = $reverse_geolocation;
		}
		else //Else, keep what was stored in session
		{
			$reverse_geolocation = $_SESSION['reverse_geolocation'];
		}
		
		if(is_file('data/data')) //And open the data file
		{
			$data = unserialize(gzinflate(base64_decode(file_get_contents('data/data'))));
			$stations = $data[1];
		}
		else
			exit("[{'error': '<p>La liste des stations n'a pu être récupérée. Essayez de la mettre à jour manuellement.</p>'}]");


		if(!empty($_POST['station'])) //If we want information about a specific station
		{
			$stations_used[$_POST['station']] = $stations[$_POST['station']]; //We only use it - little trick to keep the same code
		}
		else
		{
			$stations_used = $stations; //Else, we use all the stations
		}
		
		if($updated_position) //If position updated
		{
			unset($_SESSION['distances']);
			
			//Compute the distance
			foreach($stations_used as $key=>$station) //We start by sorting the stations by distance to me
			{
				$station_lat = deg2rad($station['lat']);
				$station_lng = deg2rad($station['lng']);
	
				$a = pow(sin($station_lat - $latitude)/2, 2) + cos($latitude)*cos($station_lat)*pow(sin($station_lng - $longitude)/2, 2);
				$c = 2*atan2(sqrt($a),sqrt(1-$a));
				$R = 6371000;
				$distances[$key] = $R*$c;
			}
			asort($distances);
			
			if(!empty($_POST['station'])) //But store the result only if not computed for a single station
				$_SESSION['distances'] = array_slice($distances, 0, 10, true); //Store the 10 first values in session
		}
		else //Else, get the result stored
		{
			if(empty($_POST['station']))
				$distances = $_SESSION['distances']; //If list required, get the currently stored list
			else //Else, get the only one we want
				$distances[(int) $_POST['station']] = $_SESSION['distances'][(int) $_POST['station']];
		}
	
		//Print the JSON
		echo '[{"reverse_geolocation": "'.htmlentities($reverse_geolocation).'"}, ';
	
		$i = 0;
		foreach($distances as $key=>$distance) //Print the information about the 10 nearest stations
		{
			if($i >= 10)
				break;
		
			//Get number of velibs / parkings available
			if($stations[$key]['updated'] < time() - 60) //If data is older than 1 minute, update it
			{
				//Mise à jour du tableau
				$station_xml = simplexml_load_file('http://www.velib.paris.fr/service/stationdetails/paris/'.$stations[$key]['id']);
				
				$stations[$key]['updated'] = time(); //Update the stations array
				$stations[$key]['available'] = (int) $station_xml->available;
				$stations[$key]['free'] = (int) $station_xml->free;
				$stations[$key]['open'] = (int) $station_xml->open;
				
				$updated_stations = true; //We updated the array (so we must update the data file)
			}
			
			$number = (!empty($_POST['free'])) ? $stations[$key]['free'] : $stations[$key]['available']; //Get the number of velibs / parkings ($stations is always up to date or acceptable)
		
			if($number != 0 && $stations[$key]['open'] == 1) //If this station is interesting and opened
			{
				echo '{"key": "'.(int) $key.'", "dist": "'.(int) $distance.'", "bonus": "'.(int) $stations[$key]['bonus'].'", "lat": "'.(float) $stations[$key]['lat'].'", "lng": "'.(float) $stations[$key]['lng'].'", "nombre": "'.(int) $number.'", "nom": "'.substr($stations[$key]['name'], strpos($stations[$key]['name'], "-")+1).'"';
				
				if(!empty($_POST['station'])) //If we only want content about this station, get the directions and the address
				{
					if($updated_position || empty($_SESSION['directions']) || $_SESSION['directions']['key'] != $_POST['station']) //Check wether position was updated, session var doesn't exist or routes isn't stored for this particular station
					{
						unset($_SESSION['directions']); //Destroy the previous variable
						
						if(is_file('data/checksum')) //Checksum is required in OSRM Usage Policy
							$checksum = '&checksum='.file_get_contents('data/checksum');
						else
							$checksum = '';
					
						$directions_json = file_get_contents($_POST['directions_provider'].'?loc='.$_POST['latitude'].','.$_POST['longitude'].'&loc='.$stations[$key]['lat'].','.$stations[$key]['lng'].'&z=18&output=json&instructions=false&alt=false&geomformat=cmp'.$checksum, false, $context);
					
						$directions_json = json_decode($directions_json, true);
					
						if(!empty($directions_json['hint_data']['checksum']))
							file_put_contents('data/checksum', $directions_json['hint_data']['checksum']);
					
						$directions_encoded = json_encode($directions_json['route_geometry']);
					
						if(!empty($directions_json['route_geometry']))
							echo ', "directions": '.$directions_encoded;
						else
							echo ', "directions": ""';
							
						//And then, set new ones
						$_SESSION['directions']['key'] = (int) $_POST['station'];
						$_SESSION['directions']['directions'] = $directions_encoded;
					}
					else
					{
						echo ', "directions": '.$_SESSION['directions']['directions'];
					}
						
					//Get the address
					echo ', "address": "'.substr($stations[$key]['address'], 0, strpos($stations[$key]['address'], " - 75")+1).'"';
				}
				
				//Print the JSON data
				echo '}';
				
				if($i != 9 && $i != count($distances) - 1) //Attention : distance can be less than 9 elements long (if we specify a station for example)
					echo ', ';
				
				$i++;
			}
		}
		
		echo ']'; //And close the JSON array
		
		//If needed, update the data file
		if($updated_stations)
		{
			file_put_contents('data/data', base64_encode(gzdeflate(serialize(array($data[0], $stations)))));
		}
	}
	else
		exit("[{'error': '<p>La liste des stations n'a pu être récupérée. Essayez de la mettre à jour manuellement.</p>'}]");
