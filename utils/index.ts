


export function createPageUrl(pageName: string) {
    const slug = pageName
        // Insert hyphen between lowercase/number followed by uppercase
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        // Handle transitions from multiple uppercase letters to title case words (e.g., AIAssistant)
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        // Normalize spaces and underscores to hyphens
        .replace(/[\s_]+/g, '-')
        .toLowerCase();

    return `/${slug}`;
}
