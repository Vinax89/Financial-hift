export function createPageUrl(pageName: string) {
    const slug = pageName
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase()
        .replace(/^-|-$/g, "");

    return `/${slug}`;
}
