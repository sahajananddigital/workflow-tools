
export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');

                if (lines.length < 2) {
                    throw new Error("CSV file is empty or missing headers");
                }

                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                const results = [];

                for (let i = 1; i < lines.length; i++) {
                    // Regex to split by comma, ignoring commas inside quotes
                    const currentLine = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                    // Better approach:
                    const matches = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)|(?<=,|^)(,)(?=\s*,|\s*$)|(?<=,|^)\s*(?=$)/g) || [];

                    // Simple regex for splitting CSV: ,(?=(?:(?:[^"]*"){2})*[^"]*$)
                    // But we can also write a simple parser function

                    let parts = [];
                    let currentPart = '';
                    let inQuotes = false;

                    for (let char of lines[i]) {
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            parts.push(currentPart);
                            currentPart = '';
                            continue;
                        }
                        currentPart += char;
                    }
                    parts.push(currentPart);

                    if (parts.length === headers.length) {
                        const obj = {};
                        headers.forEach((header, index) => {
                            let value = parts[index].trim();
                            // Remove surrounding quotes if present
                            if (value.startsWith('"') && value.endsWith('"')) {
                                value = value.slice(1, -1);
                            }
                            obj[header] = value;
                        });
                        results.push(obj);
                    }
                }
                resolve(results);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
