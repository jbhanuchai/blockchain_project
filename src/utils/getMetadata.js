// List of fallback IPFS gateways to fetch metadata from
const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/"
];

  const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
  
export async function getMetadata(cidOrUrl, cacheKey) {
  // Check localStorage cache
  const cache = localStorage.getItem(cacheKey);
  if (cache) {
    const { data, timestamp } = JSON.parse(cache);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data; // Return cached metadata if not expired
    }
  }

  // Normalize the CID from various IPFS URL formats
  let cid = cidOrUrl.replace("ipfs://", "").replace(/^https?:\/\/[^/]+\/ipfs\//, "");

  // Attempt to fetch from each IPFS gateway
  for (const base of GATEWAYS) {
    try {
      const res = await fetch(`${base}${cid}`);
      if (!res.ok) continue;
      const json = await res.json();

      // Cache the metadata in localStorage
      localStorage.setItem(cacheKey, JSON.stringify({ data: json, timestamp: Date.now() }));
      return json;
    } catch (e) {
      continue; // Try next gateway if error occurs
    }
  }

  // If all gateways fail, throw an error
  throw new Error("Failed to fetch metadata from all IPFS gateways.");
}
