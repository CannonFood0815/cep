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

        generateFDF(data);
    } catch (error) {
        alert("❌ Fehler: API-Abfrage fehlgeschlagen!");
    }
}

function generateFDF(data) {
    const fdfContent = `
        %FDF-1.2
        1 0 obj
        <<
        /FDF <<
        /Fields [
            << /T (Rua) /V (${data.logradouro || ""}) >>
            << /T (Bairro) /V (${data.bairro || ""}) >>
            << /T (Cidade) /V (${data.localidade || ""}) >>
            << /T (Estado) /V (${data.uf || ""}) >>
        ]
        >>
        >>
        endobj
        trailer
        <<
        /Root 1 0 R
        >>
        %%EOF
    `;

    const blob = new Blob([fdfContent], { type: "application/vnd.fdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cep_data.fdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert("✅ FDF-Datei wurde erstellt und sollte sich automatisch in Foxit/Adobe öffnen.");
}

window.onload = fetchCEP;
