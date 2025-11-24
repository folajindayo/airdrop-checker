/**
 * Format utility functions
 */

export function formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function formatHash(hash: string, length: number = 8): string {
  if (!hash || hash.length <= length) {
    return hash;
  }
  return `${hash.slice(0, length)}...`;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  }
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "+$1 ($2) $3-$4");
  }
  
  return phone;
}

export function formatCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, "");
  return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, "");
  
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
  }
  
  return ssn;
}

export function formatPostalCode(code: string, country: string = "US"): string {
  const cleaned = code.replace(/\D/g, "");
  
  if (country === "US" && cleaned.length === 9) {
    return cleaned.replace(/(\d{5})(\d{4})/, "$1-$2");
  }
  
  return code;
}

export function formatList(items: string[], conjunction: string = "and"): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  
  return `${rest.join(", ")}, ${conjunction} ${last}`;
}

export function formatFileSize(bytes: number): string {
  return formatBytes(bytes, 1);
}

export function formatInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatCamelCase(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function formatSnakeCase(str: string): string {
  return str
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function formatKebabCase(str: string): string {
  return str
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function formatTitle(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatSentence(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
