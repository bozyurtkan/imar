export function parseSpintax(text: string): string {
  const regex = /\{([^{}]+)\}/;
  let result = text;
  let match;
  let safety = 0;

  while ((match = regex.exec(result)) !== null && safety < 100) {
    const options = match[1].split('|');
    const chosen = options[Math.floor(Math.random() * options.length)].trim();
    result =
      result.substring(0, match.index) +
      chosen +
      result.substring(match.index + match[0].length);
    safety++;
  }

  return result;
}

export function replacePlaceholders(
  text: string,
  data: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return result;
}
