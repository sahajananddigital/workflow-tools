export interface MediaItem {
    id: number;
    date: string;
    guid: {
        rendered: string;
    };
    source_url: string;
    media_details: {
        sizes: {
            thumbnail: {
                source_url: string;
            };
            medium: {
                source_url: string;
            };
            full: {
                source_url: string;
            };
        };
    };
    alt_text: string;
    title: {
        rendered: string;
    };
}
