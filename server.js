const express = require("express");
const app = express();
app.use(express.json());

let host_ip = null;

app.get("/get_host_ip", (req, res) => {
    res.json({ host_ip });
    console.log("get_host_ip : ", host_ip);
});

app.post("/set_host_ip", (req, res) => {
    host_ip = req.body.host_ip;
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur ${PORT}`));
