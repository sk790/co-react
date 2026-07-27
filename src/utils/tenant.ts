export const getSubdomain = () => {
  const host = window.location.hostname;
  
  // Handle localhost (e.g., school.localhost)
  if (host.includes('localhost')) {
    const parts = host.split('.');
    if (parts.length > 1) {
      return parts[0];
    }
    return null;
  }

  // Handle production domain (e.g., school.classorbit.com)
  const parts = host.split('.');
  
  // Assuming a domain structure like subdomain.domain.com
  // If the host is just domain.com or www.domain.com, we might handle it differently.
  if (parts.length >= 3) {
    // If domain is like school.co.uk, this logic needs adjustment.
    // For standard subdomain.domain.com, the first part is the subdomain.
    if (parts[0] !== 'www') {
      return parts[0];
    }
  }

  return null;
};
