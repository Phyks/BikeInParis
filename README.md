README for Velib app
====================
(An english version is available below)

Cette application a été developpée par Phyks (webmaster@phyks.me). Elle vous permet de localiser les vélibs et les emplacements de vélibs les plus proches de vous et de vous y guider. Elle est distribuée sous licence zlib/libpng.

Pour plus d'informations sur les licences des différentes parties (leaflet, images), se référer au fichier LICENSE.

La fonction d'obtention des noms à partir des coordonnées GPS est fournie par Mapquest, les cartes sont fournies par OpenStreetMap et les itinéraires sont fournis par OSRM.

Pour toute suggestion ou remarque, envoyer un e-mail à webmaster@phyks.me.

Installation sur votre serveur :
================================
* Décompresser l'archive dans un dossier accessible par votre serveur web.
* S'assurer que le serveur web a les droits en écriture sur le répertoire "data".
* Éditer la configuration en haut du fichier js.js (fournisseur de tiles OSM et de fonctions de reverse geoposition, adresse e-mail).
* L'application mettra automatiquement à jour la liste des stations au premier démarrage.

* Pour mettre à jour automatiquement la liste des stations, vous pouvez utiliser une tâche cron comme suit :
<code>sudo crontab -e</code>
puis insérer la ligne
<code>* * * * * wget -q -O adresse_de_base_de_velib/index.php?update=1&code=code_synchro #Commande de mise a jour des stations de velib</code>

en remplaçant code_synchro par votre code de synchronisation et en définissant * conformément à la fréquence de mises à jour souhaitée.

Notes :
=======
* Si vous avez perdu votre code de synchronisation, il suffit de supprimer le fichier data/data pour le réinitialiser (il faudra alors refaire une synchronisation des stations à la visite suivante).
* Bien que cette application ait été optimisée, notamment au niveau du nombre de requêtes vers des services distants, elle a été créée dans l'optique de répondre à mon besoin et peut supporter difficilement une charge importante.

====================================================================================
====================================================================================
English version :

This app has been developped by Phyks (webmaster@phyks.me). It allows you to locate the nearest velibs (parisian public bicycle sharing service) and the nearest velibs station. It is released under zlib/libpng license.

For more information about the licenses of the diverse libraries and images (leaflet ...), please refer to the LICENSE file.

The reverse geolocation system is provided by Mapquest, maps are provided by OpenStreetMap and routes are provided by OSRM.

For any suggestion or remark, please send me an e-mail at webmaster@phyks.me.

Installation on your own server :
=================================
* Decompress the archive file in a folder accessible to your web server.
* Ensure that your web server can write in the "data" directory.
* Edit the configuration in the js.js file (OSM tiles provider, reverse geolocation provider and email).
* The application will automatically update the stations list at first run.

* To automatically update the stations list, you can use a cron task as following :
<code>sudo crontab -e</code>
then, add a line
<code>* * * * * wget -q -O adresse_de_base_de_velib/index.php?update=1&code=code_synchro #Update velib stations</code>

Don't forget to replace code_synchro by your synchronisation code and define * according to the update frequency you want.

Notes :
=======
* If you have lost your synchronisation code, just delete the file data/data to reset it. You'll then have to make a full update at the next visit.
* Although I tried to optimize this application, it was created to answer my own need and may not be suited for a large scale website with a great load.
