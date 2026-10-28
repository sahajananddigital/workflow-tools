export const processSpintax = (text) => {
    if (!text) return '';
    // Matches {A|B} but not {name}
    const regex = /\{([^{}]*\|[^{}]*)\}/g;
    return text.replace(regex, (match, content) => {
        const choices = content.split('|');
        const randomChoice = choices[Math.floor(Math.random() * choices.length)];
        return randomChoice;
    });
};

export const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 10);
};

export const processMessage = (template, contact, options = {}) => {
    let message = processSpintax(template);

    // Replace variables
    Object.keys(contact).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'gi');
        message = message.replace(regex, contact[key] || '');
    });

    // Anti-spam suffix
    if (options.appendRandomId) {
        message += `\n\nID: ${generateRandomId()}`;
    }

    return message;
};
