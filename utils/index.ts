/**
 * Converts a page name into a URL path by producing a hyphen-separated, lowercased slug prefixed with a leading slash.
 *
 * @param pageName - The page name to convert into a URL-friendly slug.
 * @returns The URL path in the form "/<slug>" where the slug is lowercased, spaces/underscores replaced with hyphens, and hyphens inserted between case transitions (e.g., "AIAssistant" -> "ai-assistant").
 */
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