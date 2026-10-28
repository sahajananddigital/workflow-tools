
# CSV Label Generator

This is a simple web application that generates labels from a CSV file and displays them on a canvas. You can then download the generated labels as a PNG image or a PDF document.

# csv-to-labels

## gurukul-lables-printing
- A4 size ( 3 Coloumn , 8 Rows, New line text if size exceeds )
https://sahajananddigital.github.io/csv-to-labels/gurukul-lables-printing/

## Features

* **CSV Upload:** Allows users to upload a CSV file.
* **Label Generation:** Parses the CSV data and generates labels on a canvas.
* **Text Wrapping:** Automatically wraps long text to fit within the label bounds.
* **Customizable Layout:** Arranges labels in a grid layout (3 columns, 8 rows).
* **PNG Download:** Downloads the generated labels as a PNG image.
* **PDF Download:** Downloads the generated labels as a PDF document.

## Prerequisites

* A web browser that supports HTML5, JavaScript, and the Canvas API.
* PapaParse library for CSV parsing. You can include it via CDN or download it and include it locally.
* jsPDF library for PDF creation. You can include it via CDN or download it and include it locally.

## Usage

1.  **HTML Structure:**
    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <title>CSV Label Generator</title>
        <script src="[https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js](https://www.google.com/search?q=https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js)"></script>
        <script src="[https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js](https://www.google.com/search?q=https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js)"></script>
    </head>
    <body>
        <input type="file" id="csvFile" accept=".csv">
        <canvas id="labelsCanvas" width="900" height="1200" style="border:1px solid #000;"></canvas>
        <button onclick="downloadCanvas()">Download PNG</button>
        <button onclick="downloadPDF()">Download PDF</button>

        <script src="script.js"></script>
    </body>
    </html>
    ```
    * Ensure that the PapaParse and jsPDF libraries are included.
    * The `canvas` element is where the labels will be drawn.
    * The buttons initiate the download functions.
    * The script.js file contains the javascript code.
2.  **JavaScript (script.js):**
    ```javascript
    document.getElementById("csvFile").addEventListener("change", handleFileUpload);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            Papa.parse(e.target.result, {
                complete: function (results) {
                    drawLabels(results.data);
                },
            });
        };
        reader.readAsText(file);
    }

    function drawLabels(data) {
        const canvas = document.getElementById("labelsCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "90px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const columns = 3;
        const rows = 8;
        const labelWidth = canvas.width / columns;
        const labelHeight = canvas.height / rows;
        const maxLineWidth = labelWidth * 0.9;

        data.forEach((row, index) => {
            let col = index % columns;
            let rowNum = Math.floor(index / columns);

            if (rowNum >= rows) return;

            let x = col * labelWidth + labelWidth / 2;
            let y = rowNum * labelHeight + labelHeight / 2;

            let text = Object.values(row).join(" ");
            let lines = wrapText(ctx, text, maxLineWidth);

            let lineHeight = 80;
            let startY = y - (lines.length - 1) * lineHeight / 2;

            lines.forEach((line, i) => {
                ctx.fillText(line, x, startY + i * lineHeight);
            });
        });
    }

    function wrapText(ctx, text, maxWidth) {
        let words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            let testLine = currentLine ? currentLine + " " + word : word;
            let testWidth = ctx.measureText(testLine).width;

            if (testWidth > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) lines.push(currentLine);
        return lines;
    }

    function downloadCanvas() {
        const canvas = document.getElementById("labelsCanvas");
        const link = document.createElement("a");
        link.download = "labels.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");
        const canvas = document.getElementById("labelsCanvas");

        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
        pdf.save("labels.pdf");
    }
    ```
3.  **Upload CSV:**
    * Open the HTML file in your web browser.
    * Click the "Choose File" button and select your CSV file.
4.  **View Labels:**
    * The labels will be generated and displayed on the canvas.
5.  **Download:**
    * Click the "Download PNG" button to download the labels as a PNG image.
    * Click the "Download PDF" button to download the labels as a PDF document.

## CSV Format

The CSV file should contain data that you want to display on the labels. Each row in the CSV file will be used to generate a single label. The script joins all values within each row with spaces.

## Customization

* **Canvas Size:** Change the `width` and `height` attributes of the `canvas` element to adjust the label dimensions.
* **Label Layout:** Modify the `columns` and `rows` variables in the `drawLabels` function to change the grid layout.
* **Font Size:** Change the `ctx.font` property in the `drawLabels` function to adjust the font size.
* **Line Spacing:** change the `lineHeight` variable within the `drawLabels` function to adjust the spacing between lines of text within a label.
* **Margins:** Change the `maxLineWidth` calculation to adjust the text margins within each label.
