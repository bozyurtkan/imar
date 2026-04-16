export async function findEmailsFromWebsite(url: string): Promise<string[]> {
  try {
    let fullUrl = url;
    if (!fullUrl.startsWith('http')) fullUrl = 'https://' + fullUrl;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const html = await response.text();

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const found = html.match(emailRegex) || [];
    const unique = [...new Set(found)];

    const filtered = unique.filter((email) => {
      const lower = email.toLowerCase();
      return (
        !lower.includes('example.com') &&
        !lower.includes('sentry') &&
        !lower.includes('wixpress') &&
        !lower.endsWith('.png') &&
        !lower.endsWith('.jpg') &&
        !lower.endsWith('.js') &&
        !lower.endsWith('.css') &&
        !lower.includes('webpack') &&
        !lower.includes('schema.org')
      );
    });

    return filtered;
  } catch {
    return [];
  }
}
