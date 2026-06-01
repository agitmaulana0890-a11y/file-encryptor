async function encryptFile() {

    const fileInput =
        document.getElementById("fileInput");

    const status =
        document.getElementById("status");

    const file = fileInput.files[0];

    if (!file) {

        alert("Pilih file terlebih dahulu");

        return;
    }

    status.innerText = "Encrypting...";

    // baca file
    const fileBuffer =
        await file.arrayBuffer();

    // generate AES key
    const key =
        await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    // export key
    const exportedKey =
        await crypto.subtle.exportKey(
        "raw",
        key
    );

    // random IV
    const iv =
        crypto.getRandomValues(
            new Uint8Array(12)
        );

    // encrypt
    const encryptedData =
        await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        fileBuffer
    );

    // gabungkan IV + encrypted
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