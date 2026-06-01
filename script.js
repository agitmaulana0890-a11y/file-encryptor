function toggleMode() {

    const mode =
        document.getElementById("mode").value;

    const keySection =
        document.getElementById("keySection");

    if (mode === "decrypt") {

        keySection.style.display = "block";

    } else {

        keySection.style.display = "none";
    }
}

async function processFile() {

    const mode =
        document.getElementById("mode").value;

    if (mode === "encrypt") {

        encryptFile();

    } else {

        decryptFile();
    }
}

async function encryptFile() {

    const file =
        document.getElementById("fileInput")
        .files[0];

    const status =
        document.getElementById("status");

    if (!file) {

        alert("Pilih file");

        return;
    }

    status.innerText = "Encrypting...";

    const fileBuffer =
        await file.arrayBuffer();

    const key =
        await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    const exportedKey =
        await crypto.subtle.exportKey(
        "raw",
        key
    );

    const iv =
        crypto.getRandomValues(
            new Uint8Array(12)
        );

    const encryptedData =
        await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        fileBuffer
    );

    const combined =
        new Uint8Array(
            iv.length +
            encryptedData.byteLength
        );

    combined.set(iv, 0);

    combined.set(
        new Uint8Array(encryptedData),
        iv.length
    );

    // download .enc
    const encBlob =
        new Blob([combined]);

    const encLink =
        document.createElement("a");

    encLink.href =
        URL.createObjectURL(encBlob);

    encLink.download =
        file.name + ".enc";

    encLink.click();

    // download .key
    const keyBlob =
        new Blob([exportedKey]);

    const keyLink =
        document.createElement("a");

    keyLink.href =
        URL.createObjectURL(keyBlob);

    keyLink.download =
        file.name + ".key";

    keyLink.click();

    status.innerText =
        "File berhasil dienkripsi!";
}

async function decryptFile() {

    const encFile =
        document.getElementById("fileInput")
        .files[0];

    const keyFile =
        document.getElementById("keyInput")
        .files[0];

    const status =
        document.getElementById("status");

    if (!encFile || !keyFile) {

        alert("Pilih file .enc dan .key");

        return;
    }

    status.innerText = "Decrypting...";

    const rawKey =
        await keyFile.arrayBuffer();

    const key =
        await crypto.subtle.importKey(
        "raw",
        rawKey,
        {
            name: "AES-GCM"
        },
        true,
        ["decrypt"]
    );

    const encBuffer =
        await encFile.arrayBuffer();

    const data =
        new Uint8Array(encBuffer);

    const iv =
        data.slice(0, 12);

    const encryptedData =
        data.slice(12);

    try {

        const decrypted =
            await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encryptedData
        );

        let originalName =
            encFile.name.replace(".enc", "");

        const blob =
            new Blob([decrypted]);

        const link =
            document.createElement("a");

        link.href =
            URL.createObjectURL(blob);

        link.download =
            originalName;

        link.click();

        status.innerText =
            "File berhasil didekripsi!";

    } catch {

        status.innerText =
            "Key salah atau file rusak!";
    }
}
