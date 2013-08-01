README for Velib app
====================
_(A french version is available below)_

This app has been developped by Phyks (phyks@phyks.me). It allows you to locate the nearest velibs (parisian public bike rental service) available and the nearest velibs station to park your velib. It is released under a (NO-ALCOHOL) BEER-WARE license and uses the velib REST API (as described by Stéphane Bortzmeyer on his website http://www.bortzmeyer.org/velib-rest.html ).

For more information about the licenses of the libraries and images (leaflet ...) used, please refer to the LICENSE file.

The reverse geolocation system is provided by Mapquest, maps are provided by OpenStreetMap and routes are provided by OSRM. The system to provide latitude and longitude from text input is also provided by Mapquest.

You can find a demo running at http://velib.phyks.me . Please, host your own if you want to use it intensively. This is for demo purpose only and the Velib REST API put limitations on the requests you send (less than X requests per hour). Limitations on this address may appear if it's used too intensively.

For any suggestion or remark, please send me an e-mail at phyks@phyks.me.

## How to install on your own server ?

* Decompress the archive file in a folder accessible to your web server.
* Ensure that your web server can write in the "data" directory. If there's no such directory, create it at the root of the project (beside js.js and ajax.php files) and ensure your web server can write in it.
* Edit the configuration in the js.js file (OSM tiles provider, reverse geolocation provider and email) as needed.
* The application will automatically update the stations list at first run and will give you the link you should use to update the list of stations.

* To automatically update the stations list, you can use a cron task as following :
<code>sudo crontab -e</code>
then, add a line
<code>* * * * * wget -q -O adresse_de_base_de_velib/index.php?update=1&code=code_synchro #Update velib stations</code>

Don't forget to replace code_synchro by your synchronisation code and define * according to the update frequency you want.

## Notes

* This app heavily uses Javascript and AJAX. As a result, a modern browser and JS support enabled are mandatory. For example, this app was successfully tested using Firefox on a desktop and Firefox Mobile for Android (on a SGS 3).
* If you have lost your synchronisation code, just delete the file data/data to reset it. You'll then have to make a full update at the next visit.
* The update of the list of stations must be done manually (via a crontask for example). When using the script, the number of available velibs for each stationn is automatically retrieved, and stored in cache for some time to reduce the load toward the REST API.
* Although I tried to optimize this application, it was created to answer my own need and may not be suited for a large scale website with a great load. Please report any problem and we'll see.

------
# French version
------

Cette application a été developpée par Phyks (phyks@phyks.me). Elle vous permet de localiser les vélibs et les emplacements de vélibs les plus proches de vous et de vous y guider. Elle est distribuée sous licence (NO-ALCOHOL) BEER-WARE et utilise l'API REST des velibs (telle que décrite dans un billet de Stéphane Bortzmeyer, tp://www.bortzmeyer.org/velib-rest.html ).

Pour plus d'informations sur les licences des différentes parties (leaflet, images), se référer au fichier LICENSE.

La fonction d'obtention des noms à partir des coordonnées GPS est fournie par Mapquest, les cartes sont fournies par OpenStreetMap et les itinéraires sont fournis par OSRM. L'obtention d'un couple latitude/longitude à partir d'une recherche textuelle se base sur les APIs de Mapquest. L'intégralité du service repose donc sur les données fournies par OpenStreeMap.

Une démo est disponible à l'adresse http://velib.phyks.me . Si vous souhaitez utiliser régulièrement ce service, merci d'héberger une copie du script chez vous. En effet, il y a des limitations quant au nombre de requêtes par IP dans l'API REST de Vélib et je pourrais donc être obligé de mettre des limitations sur le script disponible à l'adresse précédente pour garantir un fonctionnement optimal pour tous.

Pour toute suggestion ou remarque, envoyer un e-mail à phyks@phyks.me.

## Comment l'installer sur mon serveur ?

* Décompresser l'archive dans un dossier accessible par votre serveur web.
* S'assurer que le serveur web a les droits en écriture sur le répertoire "data". Si un tel répertoire n'existe pas, le créer à la racine du projet (à côté des fichiers index.php, ajax.php, js.js etc.) et s'assurer que le serveur web a les droits d'écriture dessus.
* Éditer la configuration en haut du fichier js.js (fournisseur de tiles OSM et de fonctions de reverse geoposition, adresse e-mail) pour correspondre à vos besoins.
* L'application mettra automatiquement à jour la liste des stations au premier démarrage. Elle vous donnera ensuite des informations sur la mise à jour régulière des stations.

* Pour mettre à jour automatiquement la liste des stations, vous pouvez utiliser une tâche cron comme suit :
<code>sudo crontab -e</code>
puis insérer la ligne
<code>* * * * * wget -q -O adresse_de_base_de_velib/index.php?update=1&code=code_synchro #Commande de mise a jour des stations de velib</code>

en remplaçant code_synchro par votre code de synchronisation et en définissant * conformément à la fréquence de mises à jour souhaitée.

Notes :
=======
* Cette app utilise beaucoup Javascript et AJAX. Ainsi, un navigateur moderne, avec Javascript activé sont un pré-requis pour en profiter. Par exemple, le script a été testé avec succès avec Firefox pour desktop et avec Firefox Mobile (pour Android, sur un SGS 3).
* Si vous avez perdu votre code de synchronisation, il suffit de supprimer le fichier data/data pour le réinitialiser (il faudra alors refaire une synchronisation des stations à la visite suivante).
* La mise à jour des stations doit être faite manuellement (via une crontask par exemple). En revanche, la mise à jour du nombre de vélos et d'emplacements disponibles pour chaque station est mis à jour à chaque requête vers les stations en question et reste en cache pendant un certain temps pour réduire la charge sur l'API REST.
* Bien que cette application ait été optimisée, notamment au niveau du nombre de requêtes vers des services distants, elle a été créée dans l'optique de répondre à mon besoin et peut supporter difficilement une charge importante. Merci de me rapporter les problèmes que vous pourriez éventuellement rencontrer.
