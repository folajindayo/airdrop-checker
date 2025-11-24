/**
 * Input sanitization utilities
 */

export function sanitizeHtml(html: string): string {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

export function sanitizeFileName(fileName: string): string {
  // Remove potentially dangerous characters
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  // Trim whitespace
  let sanitized = input.trim();

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Escape HTML
  sanitized = escapeHtml(sanitized);

  return sanitized;
}

export function sanitizeEmail(email: string): string {
  const sanitized = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return "";
  }

  return sanitized;
}

export function sanitizeAddress(address: string): string {
  // Remove all non-hex characters and 0x prefix
  const cleaned = address.replace(/[^0-9a-fA-F]/g, "");
  
  // Ethereum addresses should be 40 characters (without 0x)
  if (cleaned.length !== 40) {
    return "";
  }

  return `0x${cleaned.toLowerCase()}`;
}

