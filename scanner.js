// ==============================
// DAPO QR Code Scanner
// ==============================

let html5QrCode;
let scanned = false;

// ------------------------------
// Save scanned record
// ------------------------------
function saveScanRecord(decodedText) {

    let name = "";
    let address = "";
    let cell = "";
    let email = "";

    decodedText.split("\n").forEach(line => {

        line = line.trim();

        if (line.startsWith("Name:"))
            name = line.replace("Name:", "").trim();

        if (line.startsWith("Address:"))
            address = line.replace("Address:", "").trim();

        if (line.startsWith("Cell:"))
            cell = line.replace("Cell:", "").trim();

        if (line.startsWith("Email:"))
            email = line.replace("Email:", "").trim();

    });

    const now = new Date();

    const records = JSON.parse(localStorage.getItem("scanRecords")) || [];

    records.push({
        name,
        address,
        cell,
        email,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    });

    localStorage.setItem("scanRecords", JSON.stringify(records));

    console.log("Record saved.");
}

// ------------------------------
// QR Scan Success
// ------------------------------
function onScanSuccess(decodedText) {

    if (scanned) return;

    scanned = true;

    console.log("QR Detected:");
    console.log(decodedText);

    const resultBox = document.getElementById("result");

    if (resultBox) {
        resultBox.value = decodedText;
    }

    saveScanRecord(decodedText);

    html5QrCode.stop()
        .then(() => {

            console.log("Scanner stopped.");

            alert("QR Code scanned successfully!");

        })
        .catch(err => {

            console.error("Stop Error:", err);

        });

}

// ------------------------------
// Ignore scan failures
// ------------------------------
function onScanFailure(error) {
    // Leave empty to avoid console spam
}

// ------------------------------
// Start Scanner
// ------------------------------
function startScanner() {

    html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras()
        .then(cameras => {

            if (!cameras || cameras.length === 0) {

                alert("No camera found.");
                return;

            }

            console.log("Available Cameras:");
            console.log(cameras);

            // Prefer back camera
            let cameraId = cameras[0].id;

            cameras.forEach(camera => {

                const name = camera.label.toLowerCase();

                if (
                    name.includes("back") ||
                    name.includes("rear") ||
                    name.includes("environment")
                ) {
                    cameraId = camera.id;
                }

            });

            console.log("Using Camera:", cameraId);

            html5QrCode.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250
                    }
                },
                onScanSuccess,
                onScanFailure
            );

        })
        .catch(err => {

            console.error(err);

            alert(
                "Unable to access the camera.\n\n" +
                "Possible reasons:\n" +
                "• Camera permission denied\n" +
                "• Website is not HTTPS\n" +
                "• Another application is using the camera"
            );

        });

}

// ------------------------------
// Wait until page loads
// ------------------------------
window.addEventListener("load", () => {

    if (typeof Html5Qrcode === "undefined") {

        alert("QR Scanner library failed to load.");
        return;

    }

    startScanner();

});