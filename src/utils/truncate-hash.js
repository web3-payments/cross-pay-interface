// Captures 0x + 4 characters, then the last 4 characters.
const truncateRegex = /^([a-zA-Z0-9]{8})[a-zA-Z0-9]+([a-zA-Z0-9]{8})$/;

/**
 * Truncates an hash to the format 0x0000…0000
 * @param string Full string to truncate
 * @returns Truncated string
 */
const truncateHash = (string) => {
  const match = string.match(truncateRegex);
  if (!match) return string;
  return `${match[1]}…${match[2]}`;
};

export default truncateHash;