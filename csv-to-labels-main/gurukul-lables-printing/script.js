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

// function drawLabels(data) {
//     const canvas = document.getElementById("labelsCanvas");
//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.fillStyle = "black";
//     ctx.font = "70px Arial"; // Adjusted for better text fitting
//     ctx.textAlign = "center";  
//     ctx.textBaseline = "middle"; 

//     const columns = 3;
//     const rows = 8;
//     const labelWidth = canvas.width / columns;
//     const labelHeight = canvas.height / rows;
//     const maxLineWidth = labelWidth * 0.9; // Leave some margin

//     data.forEach((row, index) => {
//         let col = index % columns;
//         let rowNum = Math.floor(index / columns);

//         if (rowNum >= rows) return; // Prevent extra rows

//         let x = col * labelWidth + labelWidth / 2;  
//         let y = rowNum * labelHeight + labelHeight / 2; 

//         let text = Object.values(row).join(" ");
//         let lines = wrapText(ctx, text, maxLineWidth);

//         let lineHeight = 80; // Line spacing
//         let startY = y - (lines.length - 1) * lineHeight / 2; // Center the text block

//         lines.forEach((line, i) => {
//             ctx.fillText(line, x, startY + i * lineHeight);
//         });
//     });
// }

function drawLabels(data) {
    const canvas = document.getElementById("labelsCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#782718";
    ctx.font = "700 70px baloo";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const columns = 3;
    const rows = 8;

    const topMargin = 100;
    const bottomMargin = 100;
    const columnMargin = 20;

    // Full canvas dimensions
    const totalWidth = canvas.width;
    const totalHeight = canvas.height;

    // Calculate width accounting for margins
    const totalColumnMargins = (columns - 1) * columnMargin;
    const labelWidth = (totalWidth - totalColumnMargins) / columns;

    const usableHeight = totalHeight - topMargin - bottomMargin;
    const labelHeight = usableHeight / rows;

    const maxLineWidth = labelWidth * 0.9;

    data.forEach((row, index) => {
        let col = index % columns;
        let rowNum = Math.floor(index / columns);
        if (rowNum >= rows) return;

        // X starts with col index plus margins
        let x = col * (labelWidth + columnMargin) + labelWidth / 2;
        let y = topMargin + rowNum * labelHeight + labelHeight / 2;

        let text = Object.values(row).join(" ");
        let lines = wrapText(ctx, text, maxLineWidth);
        let lineHeight = 90;
        let startY = y - (lines.length - 1) * lineHeight / 2;

        // Draw label border for debug
        const labelX = col * (labelWidth + columnMargin);
        const labelY = topMargin + rowNum * labelHeight;
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

        // Draw text
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

async function loadFonts() {
  // const font = new FontFace("baloo", "url(BalooBhai2-Medium.ttf)", {
  //   style: "normal",
  //   weight: "400",
  //   stretch: "condensed",
  // });
  
  const font = new FontFace("baloo", "url(./fonts/BalooBhai2-Bold.ttf)", {
    style: "normal",
    weight: "400",
    stretch: "condensed",
  });
  
  // wait for font to be loaded
  await font.load();
  // add font to document
  document.fonts.add(font);
  // enable font with CSS class
  document.body.classList.add("fonts-loaded");
}
loadFonts();