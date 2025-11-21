
export const generateId = (): string => {
    // Check if crypto.randomUUID is supported and available
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback for environments where crypto is not available
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
