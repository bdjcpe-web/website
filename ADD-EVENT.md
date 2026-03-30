# 📝 Guide de création d'un événement BDJ

Ce document explique comment ajouter un événement pour qu'il s'affiche parfaitement sur le site, avec le bon design, la bonne couleur, la jauge de places et la billetterie automatisée.

L'architecture du site utilise **Google Calendar comme source de vérité**. Tout commence là-bas !

---

## ÉTAPE 1 : Créer l'événement sur Google Calendar

Rends-toi sur le Google Calendar de l'association (bdj.cpe@gmail.com) et crée un nouvel événement. 

### 1. Le Titre (Mots-clés pour les couleurs)
Le site analyse le titre de l'événement pour lui attribuer automatiquement la bonne couleur et la bonne icône. **Il faut absolument inclure un mot-clé d'activité dans le titre pour que l'événement s'affiche correctement**. Vous trouverez la liste des mots-clés des activités dans le fichier `activites.ts`.

*Exemple de bon titre :* `Tournoi Poker de Printemps`

### 2. La Description (Les balises magiques)
C'est ici qu'on configure la billetterie et la jauge. Dans la zone de texte de la description, on tape son texte normalement, puis on ajoute ces éléments :

* **La jauge de places :** Ajoute la balise `[MAX:X]` (ex: `[MAX:50]`). Le site la lira, calculera les places restantes, et la masquera aux étudiants. Si on ne met rien, le max sera de 50 par défaut.
* **Le lien HelloAsso :** Clique sur ajouter un lien dans la description et colle l'URL publique de la billetterie HelloAsso. C'est grâce à ce lien que le site fait le lien entre l'événement et HelloAsso.

### 3. Date, Heure et Lieu
Remplis-les normalement sur Google Calendar. Le site les extraira et les affichera proprement dans de petites cartes.

---

## ÉTAPE 2 : Configurer la Billetterie (HelloAsso)

Si ton événement nécessite de prendre une place (payante ou gratuite), tu dois créer une campagne de type "Événement" sur HelloAsso.

### 1. Les Tarifs (Crucial)
Notre site est intelligent et applique des réductions automatiques pour les membres cotisants du BDJ. Pour que cela fonctionne, tu dois respecter une règle stricte sur le nom de tes tarifs (Tiers) dans HelloAsso :

* **Pour le tarif réduit :** Le nom du tarif DOIT contenir le mot **`Membre`** (ex: *Tarif Membre*, *Place Membre*, *Prévente Membre*).
* **Pour le tarif normal :** Le nom ne doit pas contenir ce mot (ex: *Tarif Normal*, *Place Standard*).

*Note : Si l'événement est 100% gratuit, mets simplement le prix à `0€`. Le site contournera la page de paiement bancaire et générera le QR Code instantanément dans le profil de l'étudiant !*

### 2. Le Formulaire
Demande uniquement le Prénom et le Nom et l'email cpe si possible (le site pourra ainsi tout préremplir grâce à sa base de données).

---

## ÉTAPE 3 : Le Jour J (Le Scan)

Les étudiants retrouveront leur billet sous forme de QR Code dans leur espace `Mon Profil` sur le site du BDJ.

1. Connecte-toi au site du BDJ avec un **compte Administrateur** sur ton téléphone.
2. Ouvre l'appareil photo de ton téléphone.
3. Scanne le QR Code de l'étudiant.
4. Une page sécurisée s'ouvrira :
   * 🟢 **Écran Vert :** Le billet est valide, l'étudiant peut entrer.
   * 🟠 **Écran Orange :** Le billet a déjà été scanné (tentative de fraude ou de double entrée).
   * 🔴 **Écran Rouge :** Faux billet ou billet inconnu.

---

## 💡 Résumé : La Check-list Rapide

- [ ] Titre avec mot-clé (ex: Poker, JDR).
- [ ] Balise `[MAX:XX]` dans la description Google Calendar.
- [ ] Lien HelloAsso en pièce jointe dans la description Google Calendar.
- [ ] Dans HelloAsso : un tarif avec le mot "Membre" pour la réduc auto.
- [ ] L'événement est publié !