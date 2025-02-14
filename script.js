async function fetchCEP() {
    const urlParams = new URLSearchParams(window.location.search);
    const cep = urlParams.get('cep');

    if (!cep || cep.length !== 8) {
        alert("❌ Fehler: Ungültige CEP!");
        return;
    }

    const apiUrl = `https://viacep.com.br/ws/${cep}/json/`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.erro) {
            alert("❌ Fehler: Diese CEP existiert nicht!");
            return;
        }

        saveDataToGitHub(data);
    } catch (error) {
        alert("❌ Fehler: API-Abfrage fehlgeschlagen!");
    }
}

async function saveDataToGitHub(data) {
    const rawData = `
Rua: ${data.logradouro || ""}
Bairro: ${data.bairro || ""}
Cidade: ${data.localidade || ""}
Estado: ${data.uf || ""}
    `;

    // **GitHub API URL für das Repo (ersetze mit deinem Usernamen & Repo)**
    const githubApiUrl = "https://api.github.com/repos/CannonFood0815/cep/contents/cep_data.txt";

    // **Lese zuerst den aktuellen SHA-Hash der Datei**
    let sha = "";
    try {
        const shaResponse = await fetch(githubApiUrl);
        if (shaResponse.ok) {
            const shaData = await shaResponse.json();
            sha = shaData.sha; // SHA-Wert der existierenden Datei
        }
    } catch (error) {
        console.warn("⚠️ Datei existiert noch nicht, wird neu erstellt.");
    }

    const requestBody = {
        message: "Update CEP-Daten",
        content: btoa(rawData),  // Base64-Kodierung der Textdaten
        sha: sha || undefined, // Falls Datei existiert, SHA angeben
    };

    try {
        const response = await fetch(githubApiUrl, {
            method: "PUT",
            headers: {
                "Authorization": "token GITHUB_PERSONAL_ACCESS_TOKEN", // Ersetze mit deinem GitHub Token
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            alert("✅ CEP-Daten wurden erfolgreich auf GitHub gespeichert!");
        } else {
            alert("❌ Fehler beim Speichern der Daten auf GitHub.");
        }
    } catch (error) {
        alert("❌ API-Fehler: " + error.message);
    }
}

window.onload = fetchCEP;
