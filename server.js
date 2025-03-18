const express = require("express");
const app = express();
app.use(express.json());

let host_ip = null;

let clientsMap = new Map();

app.get("/get_host_ip", (req, res) => {
    res.json({ host_ip });
    console.log("get_host_ip : ", host_ip);
});

app.post("/set_host_ip", (req, res) => {
    host_ip = req.body.host_ip;
    clientsMap.set(host_ip, new Set([{ ip: host_ip, isDead: false }])); // L'hôte est ajouté
    console.log("Nouvel hôte :", host_ip);
    res.json({ success: true });
});


app.get("/remove_host_ip", (req, res) => {
    if (host_ip) clientsMap.delete(host_ip);
    host_ip = null;
    console.log("Hôte supprimé.");
    res.json({ host_ip });
});


app.post("/add_client", (req, res) => {
    const client_ip = req.body.client_ip;
    if (!host_ip) {
        return res.status(400).json({ error: "Aucun hôte défini." });
    }

    if (!clientsMap.has(host_ip)) {
        clientsMap.set(host_ip, new Set());
    }

    clientsMap.get(host_ip).add({ ip: client_ip, isDead: false });
    console.log(`Client ${client_ip} ajouté à l'hôte ${host_ip}.`);
    res.json({ success: true });
});


app.post("/remove_client_ip", (req, res) => {
    const client_ip = req.body.client_ip;
    if (!host_ip || !clientsMap.has(host_ip)) {
        return res.status(400).json({ error: "Aucun hôte ou liste de clients introuvable." });
    }

    let clientSet = clientsMap.get(host_ip);
    clientsMap.set(
        host_ip,
        new Set([...clientSet].filter(client => client.ip !== client_ip))
    );

    console.log(`Client ${client_ip} supprimé de l'hôte ${host_ip}.`);
    res.json({ success: true });
});


app.get("/get_clients", (req, res) => {
    if (!host_ip || !clientsMap.has(host_ip)) {
        return res.json({ clients: [] });
    }
    res.json({ clients: Array.from(clientsMap.get(host_ip)) });
});


//get all players (host + clients)
app.get("/get_all_players", (req, res) => {
    if (!host_ip) {
        return res.json({ players: [] });
    }

    const players = [];
    if (clientsMap.has(host_ip)) {
        players.push(...clientsMap.get(host_ip)); // Ajoute tous les clients
    }

    res.json({ players });
});


app.post("/mark_player_dead", (req, res) => {
    const { player_ip } = req.body;
    if (!host_ip || !clientsMap.has(host_ip)) {
        return res.status(400).json({ error: "Aucun hôte ou liste de joueurs introuvable." });
    }

    let players = clientsMap.get(host_ip);
    let updatedPlayers = new Set();

    players.forEach(player => {
        if (player.ip === player_ip) {
            updatedPlayers.add({ ip: player.ip, isDead: true }); // Met à jour isDead à true
        } else {
            updatedPlayers.add(player);
        }
    });

    clientsMap.set(host_ip, updatedPlayers);

    console.log(`Le joueur ${player_ip} est maintenant mort.`);
    res.json({ success: true });
});

app.get("/get_alive_players", (req, res) => {
    if (!host_ip || !clientsMap.has(host_ip)) {
        return res.json({ players: [] });
    }

    // Récupérer tous les joueurs vivants (l'hôte + clients)
    let alivePlayers = [];

    // Ajouter les clients vivants
    clientsMap.get(host_ip).forEach((playerData, playerIp) => {
        if (!playerData.isDead) {
            alivePlayers.push(playerIp.ip);
        }
    });

    res.json({ players: alivePlayers });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur ${PORT}`));
