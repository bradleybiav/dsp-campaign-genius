
/**
 * Validates a Spotify URL or ISRC to ensure it follows the correct format
 */
export const validateSpotifyUrl = (url: string): boolean => {
  if (!url) return true; // Empty inputs are allowed
  
  // Spotify URL pattern
  const spotifyUrlPattern = /^https:\/\/open\.spotify\.com\/(track|artist|album)\/[a-zA-Z0-9]{22}(\?si=[a-zA-Z0-9]{16})?$/;
  
  // ISRC pattern (typical format: CC-XXX-YY-NNNNN, but often without hyphens)
  // CC: Country Code (2 letters), XXX: Registrant (3 alphanumeric), 
  // YY: Year (2 digits), NNNNN: Designation (5 digits)
  const isrcPattern = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/;
  
  return spotifyUrlPattern.test(url) || isrcPattern.test(url);
};
