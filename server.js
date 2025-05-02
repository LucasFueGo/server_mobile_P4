const express = require("express");
const app = express();
app.use(express.json());

let host_ip = null;

let clients_map = new Map();

let number_woods = 0;

const availableNames = [
    "marie", "lucas", "aurelien", "melano", "antoine","bob", "alice", "jade", "leo", "emma", "nina", "max", "sofia", "theo", "liam"
];



app.get("/get_host_ip", (req, res) => {
    res.json({ host_ip });
    console.log("get_host_ip : ", host_ip);
});

app.post("/set_host_ip", (req, res) => {
    console.log(req.body.host_ip);
    host_ip = req.body.host_ip;
    const name = getRandomName([]);
    clients_map.set(host_ip, new Set([{ ip: host_ip, name: "Host", isDead: false }])); // L'hôte est ajouté
    console.log("Nouvel hôte :", host_ip);
    res.json({ success: true });
});


app.get("/remove_host_ip", (req, res) => {
    if (host_ip) clients_map.delete(host_ip);
    host_ip = null;
    console.log("Hôte supprimé.");
    number_woods = 0; // Réinitialiser le nombre de bois
    console.log("Nombre de bois réinitialisé à 0.");
    res.json({ host_ip });
});


app.post("/add_client", (req, res) => {
    const client_ip = req.body.client_ip;
    if (!host_ip) {
        return res.status(400).json({ error: "Aucun hôte défini." });
    }

    if (!clients_map.has(host_ip)) {
        clients_map.set(host_ip, new Set());
    }

    const existingPlayers = Array.from(clients_map.get(host_ip));
    const name = getRandomName(existingPlayers);

    clients_map.get(host_ip).add({ ip: client_ip, name : name, isDead: false });
    console.log(`Client ${client_ip} ajouté à l'hôte ${host_ip}.`);
    res.json({ success: true });
});


app.post("/remove_client_ip", (req, res) => {
    const client_ip = req.body.client_ip;
    if (!host_ip || !clients_map.has(host_ip)) {
        return res.status(400).json({ error: "Aucun hôte ou liste de clients introuvable." });
    }

    let clientSet = clients_map.get(host_ip);
    clients_map.set(
        host_ip,
        new Set([...clientSet].filter(client => client.ip !== client_ip))
    );

    console.log(`Client ${client_ip} supprimé de l'hôte ${host_ip}.`);
    res.json({ success: true });
});


app.get("/get_clients", (req, res) => {
    if (!host_ip || !clients_map.has(host_ip)) {
        return res.json({ clients: [] });
    }
    res.json({ clients: Array.from(clients_map.get(host_ip)) });
});


//get all players (host + clients)
app.get("/get_all_players", (req, res) => {
    if (!host_ip) {
        return res.json({ players: [] });
    }

    const players = [];
    if (clients_map.has(host_ip)) {
        players.push(...clients_map.get(host_ip)); // Ajoute tous les clients
    }

    res.json({ players });
});


app.post("/mark_player_dead", (req, res) => {
    const { player_ip } = req.body;
    if (!host_ip || !clients_map.has(host_ip)) {
        return res.status(400).json({ error: "Aucun hôte ou liste de joueurs introuvable." });
    }

    let players = clients_map.get(host_ip);
    let updatedPlayers = new Set();

    players.forEach(player => {
        if (player.ip === player_ip) {
            updatedPlayers.add({ ip: player.ip, name: player.name, isDead: true }); // Met à jour isDead à true
        } else {
            updatedPlayers.add(player);
        }
    });

    clients_map.set(host_ip, updatedPlayers);

    console.log(`Le joueur ${player_ip} est maintenant mort.`);
    res.json({ success: true });
});


app.post("/mark_player_dead_with_name", (req, res) => {
    const { player_name } = req.body;
    if (!host_ip || !clients_map.has(host_ip)) {
        return res.status(400).json({ error: "Aucun hôte ou liste de joueurs introuvable." });
    }

    let players = clients_map.get(host_ip);
    let updatedPlayers = new Set();

    let found = false;

    players.forEach(player => {
        if (player.name == player_name && player.isDead == false) {
            updatedPlayers.add({ ip: player.ip, name: player.name, isDead: true }); // Met à jour isDead à true
            found = true
        } else {
            updatedPlayers.add(player);
        }
    });

    clients_map.set(host_ip, updatedPlayers);
    if (found) {
        console.log(`Le joueur ${player_name} est maintenant mort.`);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Joueur non trouvé." });
    }
    
});

app.get("/get_alive_players", (req, res) => {
    if (!host_ip || !clients_map.has(host_ip)) {
        return res.json({ players: [] });
    }
    
    let alivePlayers = [];

    clients_map.get(host_ip).forEach((playerData, player) => {
        if (!playerData.isDead) {
            alivePlayers.push(player.name);
        }
    });

    res.json({ players: alivePlayers });
});


app.get("/get_number_woods", (req, res) => {
    res.json({ number_woods });
});

app.post("/set_number_woods", (req, res) => {
    const { woods } = req.body;
    number_woods += woods;
    console.log("Nombre de bois défini à :", number_woods);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur ${PORT}`));
//app.listen(3000, '127.0.0.1', () => {console.log('Serveur local lancé sur http://127.0.0.1:3000');});

function getRandomName(existingPlayers) {
    const usedNames = new Set(existingPlayers.map(p => p.name));
    const unusedNames = availableNames.filter(name => !usedNames.has(name));

    if (unusedNames.length < 0){
        for (let baseName of availableNames) {
            for (let i = 1; i < 1000; i++) {
                const newName = `${baseName}${i}`;
                if (!usedNames.has(newName)) {
                    return newName;
                }
            }
        }

    }

    //if (unusedNames.length === 0) return "unknown"; 
    const index = Math.floor(Math.random() * unusedNames.length);

    return unusedNames[index];
}
