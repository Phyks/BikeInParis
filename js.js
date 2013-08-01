/* Config : À éditer selon vos besoins */
var tiles_provider = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
var reverse_geolocation_provider = "http://open.mapquestapi.com/nominatim/v1/reverse.php";
var directions_provider = "http://router.project-osrm.org/viaroute";
var lat_long_provider = "http://open.mapquestapi.com/nominatim/v1/search.php"
var email = "webmaster@phyks.me"; //Mettre votre adresse e-mail ici si vous utilisez Nominatim (cf Usage Policy de Nominatim)

/* Script : */

window.onload = function() {
	function escapeHTML(unsafe)
	{
		return unsafe
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}


	function params() //Get all the parameters in the URL
	{	
		var t = location.search.substring(1).split('&');
		var params = [];
	
		for (var i=0; i<t.length; i++)
		{
			var x = t[i].split('=');
			params[x[0]] = x[1];
		}
		return params;
	}
	
	var params = params();
	
	var params_url = '';
	var map_get = false;
	var station = false;
	var free = false;
	var available = false;
	var update = false;
	var refresh = false;
	var ignore_position = false;
	var position = '';

	for(GET in params) //Define boolean to handle the different cases next
	{
		if(GET != '')
		{
			if(params_url != '')
				params_url += '&';
			
			params_url += GET+'='+params[GET];
			
			switch(GET)
			{
				case 'map':
				map_get = true;
				break;
				
				case 'available':
				available = true;
				break;
				
				case 'free':
				free = true;
				break;
				
				case 'station':
				station = true;
				break;
				
				case 'update':
				update = true;
				break;
				
				case 'refresh':
				refresh = true;
				break;

				case 'ignorePosition':
				ignore_position = true;
				break;

				case 'position':
				position = params[GET];
				break;
			}
		}
	}
	
	if(available || free || station)
	{
		if(update == false && (navigator.geolocation || position != '')) //We don't want to update and the navigator as geolocation capabilities or we specified a position
		{
			function successFunction(position)
			{
				var latitude = position.coords.latitude; //Get the current position
				var longitude = position.coords.longitude;

				getBikes(latitude, longitude);
			}

			function getBikes(latitude, longitude)
			{
				var xhr; //Define xhr variables
				try 
				{  
					xhr = new XMLHttpRequest();
				}
				catch (e)
				{
					try 
					{   
						xhr = new ActiveXObject('Msxml2.XMLHTTP');
					}
					catch (e2)
					{
						try 
						{  
							xhr = new ActiveXObject('Microsoft.XMLHTTP');
						}
						catch (e3) 
						{  
							xhr = false;
						}
					}
				}

				if(xhr == false)
				{
					document.getElementById("position").innerHTML = "<p>Une erreur a été rencontrée. Veuillez réessayer.</p>";
				}
				else
				{
					xhr.onreadystatechange  = function()
					{
						if(xhr.readyState  == 4)
						{
							if(xhr.status  == 200)
							{
								var json = JSON.parse(xhr.responseText); //Parse the response
								
								if(json.length == 1) //If there was an error
								{
									document.getElementById('stations').innerHTML = json[0].error;
								}
								else
								{
									if(map_get == false && station == false) //If we want to display a table
									{
										var display = '<table>';
										for(var i = 1; i < json.length; i++)
										{
											display += "<tr><td class='left'>À "+json[i].dist+" mètres</td><td class='right'><a href='station.php?"+params_url+"&station="+json[i].key+"'>"+json[i].nom+"</a></td>";
											if(json[i].nombre == 1)
											{
												if(available == true)
													display += "<td class='right'>"+json[i].nombre+" vélo</td></tr>";
												else
													display += "<td class='right'>"+json[i].nombre+" emplacement</td></tr>";
											}
											else
											{
												if(available == true)
													display += "<td class='right'>"+json[i].nombre+" vélos</td></tr>";
												else
													display += "<td class='right'>"+json[i].nombre+" emplacements</td></tr>";
											}
										}
									
										display += "</table>";
									
										document.getElementById('stations').innerHTML = display;
									}
									else if(station == true) //Else, if we want to display information about a specific station
									{
										var display = "<h2><a href='station.php?"+params_url+"'>Station "+json[1].nom+"</a> (À "+json[1].dist+" mètres)</h2>";
									
										display += "<p><em>Adresse : </em>"+json[1].address+"</p>";
										
										if(json[1].nombre == 1)
										{
											if(available == true)
											{
												display += "<p>Il y a actuellement <strong>"+json[1].nombre+" vélo</strong> disponible.</p>";
												nombre = "1 vélo";
											}
											else
											{
												display += "<p>Il y a actuellement <strong>"+json[1].nombre+" emplacement</strong> disponible.</p>";
												nombre = "1 emplacement";
											}
										}
										else
										{
											if(available == true)
											{
												display += "<p>Il y a actuellement <strong>"+json[1].nombre+" vélos</strong> disponibles.</p>";
												nombre = json[1].nombre+" vélos";
											}
											else
											{
												display += "<p>Il y a actuellement <strong>"+json[1].nombre+" emplacements</strong> disponibles.</p>";
												nombre = json[1].nombre+" emplacements";
											}
										}
									
										document.getElementById('stations').innerHTML = display;
									
										if(available) //Add the markers and the popups
											L.marker([json[1].lat, json[1].lng], {icon: cycleMarker}).addTo(map).bindPopup(json[1].nom+" <br/>"+nombre+"<br/>(À "+json[1].dist+" mètres)").openPopup();
										else
										{
											if(json[i].bonus == 1)
													L.marker([json[1].lat, json[1].lng], {icon: parkingMarkerBonus}).addTo(map).bindPopup("<a href='station.php?"+params_url+"&station="+json[i].key+"'>"+json[i].nom+"</a><br/>"+nombre+"<br/>(À "+json[i].dist+" mètres)");
												else
													L.marker([json[1].lat, json[1].lng], {icon: parkingMarker}).addTo(map).bindPopup("<a href='station.php?"+params_url+"&station="+json[i].key+"'>"+json[i].nom+"</a><br/>"+nombre+"<br/>(À "+json[i].dist+" mètres)");
										}
									
										if(free)
											var routeType = "bicycle";
										else
											var routeType = "pedestrian";
										
										var route_line = L.Polyline.fromEncoded(json[1].directions, {color: 'blue'}).addTo(map);
										
										map.fitBounds(route_line.getBounds()); //Make the map size optimized for the content
									}
									else //Else, we want to display a map
									{
										var latitude_max = 0;
										var latitude_min = 90;
										var longitude_max = -180;
										var longitude_min = 180;
									
										for(var i = 1; i < json.length; i++)
										{
											var nombre;
										
											if(json[i].nombre == 1)
											{
												if(available == true)
													nombre = json[i].nombre+" vélo";
												else
													nombre = json[i].nombre+" emplacement";
											}
											else
											{
												if(available == true)
													nombre = json[i].nombre+" vélos";
												else
													nombre = json[i].nombre+" emplacements";
											}
										
											if(json[i].lat < latitude_min)
												latitude_min = json[i].lat;
											if(json[i].lat > latitude_max)
												latitude_max = json[i].lat;
										
											if(json[i].lng < longitude_min)
												longitude_min = json[i].lng;
											if(json[i].lng > longitude_max)
												longitude_max = json[i].lng;
										
											if(available) //Set the markers and popups
												L.marker([json[i].lat, json[i].lng], {icon: cycleMarker}).addTo(map).bindPopup("<a href='station.php?"+params_url+"&station="+json[i].key+"'>"+json[i].nom+"</a><br/>"+nombre+"<br/>(À "+json[i].dist+" mètres)");
											else
											{
												if(json[i].bonus == 1)
													L.marker([json[i].lat, json[i].lng], {icon: parkingMarkerBonus}).addTo(map).bindPopup("<a href='station.php?"+params_url+"&station="+json[i].key+"'>"+json[i].nom+"</a><br/>"+nombre+"<br/>(À "+json[i].dist+" mètres)");
												else
													L.marker([json[i].lat, json[i].lng], {icon: parkingMarker}).addTo(map).bindPopup("<a href='station.php?"+params_url+"&station="+json[i].key+"'>"+json[i].nom+"</a><br/>"+nombre+"<br/>(À "+json[i].dist+" mètres)");
											}
										}
									
										map.fitBounds([[parseFloat(latitude_min), parseFloat(longitude_min)], [parseFloat(latitude_max) + 0.00015, parseFloat(longitude_max) + 0.00015]]); //0.00015 = margin because of markers size
										//Make the map fit the data
									}
								}
							}
							else
							{
								document.getElementById("stations").innerHTML = "<p>La liste des stations n'a pu être récupérée.</p>";
							}
							
							document.getElementById("adresse").innerHTML = json[0].reverse_geolocation+"→ <a href='index.php?"+params_url+"&refresh=1'>↻ Actualiser ?</a>"; //Display the interesting part of the address
						}
					};
	
					xhr.open("POST", "ajax.php",  true); //xhr handle the data about stations
					xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					xhr.send("latitude=" + latitude +  "&longitude=" + longitude + "&" + params_url + "&email=" + email + "&directions_provider="+ encodeURI(directions_provider) +"&reverse_geolocation_provider="+ encodeURI(reverse_geolocation_provider));
				}
				
				if(map_get == true || station) //If we need a map
				{
					document.getElementById("position").innerHTML = "<h2>Position :</h2><p id='adresse'>Latitude : "+latitude+", Longitude : "+longitude+" → <a href='index.php?"+params_url+"&refresh=1'>↻ Actualiser ?</a></p>";
					// create a map in the "map" div, set the view to a given place and zoom
					var map = L.map('map').setView([latitude, longitude], 16);

					// add an OpenStreetMap tile layer
					L.tileLayer(tiles_provider, {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

					var redMarker = L.icon({
						iconUrl: 'images/marker-icon-red.png',
						shadowUrl: 'images/marker-shadow.png',

						iconSize:     [25, 41], // size of the icon
						shadowSize:   [41, 41], // size of the shadow
						iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
						shadowAnchor: [12, 41],  // the same for the shadow
						popupAnchor:  [1, -34] // point from which the popup should open relative to the iconAnchor
					});
					
					var cycleMarker = L.icon({
						iconUrl: 'images/marker_cycle.png',
						shadowUrl: 'images/shadow_icons.png',

						iconSize:     [32, 37], // size of the icon
						shadowSize:   [38, 25], // size of the shadow
						iconAnchor:   [16, 35], // point of the icon which will correspond to marker's location
						shadowAnchor: [11, 18],  // the same for the shadow
						popupAnchor:  [0, -31] // point from which the popup should open relative to the iconAnchor
					});
					
					var parkingMarker = L.icon({
						iconUrl: 'images/marker_parking.png',
						shadowUrl: 'images/shadow_icons.png',

						iconSize:     [32, 37], // size of the icon
						shadowSize:   [37, 21], // size of the shadow
						iconAnchor:   [16, 35], // point of the icon which will correspond to marker's location
						shadowAnchor: [11, 18],  // the same for the shadow
						popupAnchor:  [0, -31] // point from which the popup should open relative to the iconAnchor
					});
					
					var parkingMarkerBonus = L.icon({
						iconUrl: 'images/marker_parking_bonus.png',
						shadowUrl: 'images/shadow_icons.png',

						iconSize:     [32, 37], // size of the icon
						shadowSize:   [37, 21], // size of the shadow
						iconAnchor:   [16, 35], // point of the icon which will correspond to marker's location
						shadowAnchor: [11, 18],  // the same for the shadow
						popupAnchor:  [0, -31] // point from which the popup should open relative to the iconAnchor
					});

					// add a marker in the given location, attach some popup content to it and open the popup
					var position_marker = L.marker([latitude, longitude], {icon: redMarker}).addTo(map);
					position_marker.bindPopup('Ma position.');
				}
				else
				{
					document.getElementById("position").innerHTML = "<h2>Position :</h2><p id='adresse'>Latitude : "+latitude+", Longitude : "+longitude+" → <a href='index.php?"+params_url+"&refresh=1'>↻ Actualiser ?</a></p>";
					document.getElementById("see_map").innerHTML = "<p id='map_p'><a href='index.php?"+params_url+"&map=1'><img src='images/carte.png'/> Voir la carte</p>";
				}
			}

			function errorFunction(error) //Handle errors
			{
				switch(error.code)
				{
					case error.TIMEOUT:
					//Restart with a greater timeout
					if(refresh)
						navigator.geolocation.getCurrentPosition(successFunction, errorFunction, {enableHighAccuracy:true,  maximumAge:0, timeout:20000});
					else
						navigator.geolocation.getCurrentPosition(successFunction, errorFunction, {enableHighAccuracy:true,  maximumAge:60000, timeout:20000});
					break;
					
					
					case error.PERMISSION_DENIED:
					document.getElementById("position").innerHTML = "<p>Erreur : L'application n'a pas l'autorisation d'utiliser les ressources de geolocalisation.</p>";
					break;
					
					case error.POSITION_UNAVAILABLE:
					document.getElementById("position").innerHTML = "<p>Erreur : La position n'a pu être déterminée.</p>";
					break;
					
					default:
					document.getElementById("position").innerHTML = "<p>Erreur "+error.code+" : "+error.message+"</p>";
					break;
				}
			}

			if(position == '' && !ignore_position) 
			{
				if(refresh) //If refresh, we want to force a new position (non cached)
					navigator.geolocation.getCurrentPosition(successFunction, errorFunction, {enableHighAccuracy:true,  maximumAge:0, timeout:2000});
				else
					navigator.geolocation.getCurrentPosition(successFunction, errorFunction, {enableHighAccuracy:true,  maximumAge:60000, timeout:2000}); //Else, we are ok with 60 seconds old position
			}
			else if(position != '')
			{
				var latitude = 0;
				var longitude = 0;

				var xhr; //Define xhr variables
				try 
				{  
					xhr = new XMLHttpRequest();
				}
				catch (e)
				{
					try 
					{   
						xhr = new ActiveXObject('Msxml2.XMLHTTP');
					}
					catch (e2)
					{
						try 
						{  
							xhr = new ActiveXObject('Microsoft.XMLHTTP');
						}
						catch (e3) 
						{  
							xhr = false;
						}
					}
				}

				if(xhr == false)
				{
					document.getElementById("position").innerHTML = "<p>Une erreur a été rencontrée. Veuillez réessayer.</p>";
				}
				else
				{
					xhr.onreadystatechange  = function()
					{
						if(xhr.readyState  == 4)
						{
							if(xhr.status  == 200)
							{
								var json = JSON.parse(xhr.responseText); //Parse the response

								latitude = json[0].lat;
								longitude = json[0].lon;

								if(latitude == 0 && longitude == 0)
									document.getElementById("position").innerHTML = "<p>Une erreur a été rencontrée. Veuillez réessayer.</p>";
								else
									getBikes(latitude, longitude);
							}
						}
					}
				}
				
				xhr.open("GET", lat_long_provider+"?format=json&q="+encodeURI(position+", Paris, France"),  true); //xhr handle the data about stations
				xhr.send();
			}
		}
		else
		{
			var input_params = '';

			for(GET in params)  //Define hidden input to keep params
			{
				if(GET != '' && GET != "position")
				{
					input_params += "<input type='hidden' name='"+GET+"' value='"+params[GET]+"'/>";
				}
			}

			document.getElementById("position").innerHTML = '<form action="index.php" method="get"><p><label for="position">Chercher autour de :</label><br/><input typ="text" name="position" id="position"/></p><p><input type="submit" value="Chercher"/></p>'+escapeHTML(input_params)+'</form>';
		}
	}
	else //If we didn't choose what to do, display the choices
	{
		document.getElementById("position").innerHTML = "<p><a href='?available=1&"+params_url+"'><img src='images/velo.png' alt='Retirer un vélo'/></a><span id='ou'> ou </span><a href='?free=1&"+params_url+"'><img src='images/parking.png' alt='Rendre un vélo'/></a></p><p><a href='?ignorePosition=1&"+params_url+"'>Ignorer la géolocalisation</a></p>";
	}
}
