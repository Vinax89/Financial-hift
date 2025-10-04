export function createPageUrl(pageName: string) {
    const trimmed = pageName.trim();

    if (!trimmed) {
        return '/';
    }

    const slug = trimmed
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^A-Za-z0-9\s_-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();

    return slug ? `/${slug}` : '/';
}
