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
    clientsMap.set(host_ip, new Set());
    console.log("Nouvel hôte :", host_ip);
    res.json({ success: true });
});

app.post("/remove_host_ip", (req, res) => {
    host_ip = null;
    console.log("Hôte supprimé.");
    res.json({ success: true });
});

app.get("/remove_host_ip_2", (req, res) => {
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
    
    clientsMap.get(host_ip).add(client_ip);
    console.log(`Client ${client_ip} ajouté à l'hôte ${host_ip}.`);
    res.json({ success: true });
});

app.get("/get_clients", (req, res) => {
    if (!host_ip || !clientsMap.has(host_ip)) {
        return res.json({ clients: [] });
    }
    res.json({ clients: Array.from(clientsMap.get(host_ip)) });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur ${PORT}`));
