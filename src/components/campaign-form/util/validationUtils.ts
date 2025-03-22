
/**
 * Validates a Spotify URL to ensure it follows the correct format
 */
export const validateSpotifyUrl = (url: string): boolean => {
  if (!url) return true; // Empty inputs are allowed
  const spotifyUrlPattern = /^https:\/\/open\.spotify\.com\/(track|artist|album)\/[a-zA-Z0-9]{22}(\?si=[a-zA-Z0-9]{16})?$/;
  return spotifyUrlPattern.test(url);
};
