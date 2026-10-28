export const saveContacts = (contacts) => {
    localStorage.setItem('wa_contacts', JSON.stringify(contacts));
};

export const getContacts = () => {
    const data = localStorage.getItem('wa_contacts');
    return data ? JSON.parse(data) : [];
};

export const clearContacts = () => {
    localStorage.removeItem('wa_contacts');
};

export const saveCampaignState = (state) => {
    localStorage.setItem('wa_campaign_state', JSON.stringify(state));
};

export const getCampaignState = () => {
    const data = localStorage.getItem('wa_campaign_state');
    return data ? JSON.parse(data) : null;
};
