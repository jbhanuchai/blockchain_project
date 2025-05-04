const GATEWAYS = [
    "https://gateway.pinata.cloud/ipfs/",
    "https://ipfs.io/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://dweb.link/ipfs/"
  ];
  
  const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
  
  export async function getMetadata(cidOrUrl, cacheKey) {
    const cache = localStorage.getItem(cacheKey);
    if (cache) {
      const { data, timestamp } = JSON.parse(cache);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  
    let cid = cidOrUrl.replace("ipfs://", "").replace(/^https?:\/\/[^/]+\/ipfs\//, "");
    for (const base of GATEWAYS) {
      try {
        const res = await fetch(`${base}${cid}`);
        if (!res.ok) continue;
        const json = await res.json();
        localStorage.setItem(cacheKey, JSON.stringify({ data: json, timestamp: Date.now() }));
        return json;
      } catch (e) {
        continue;
      }
    }
  
    throw new Error("Failed to fetch metadata from all IPFS gateways.");
  }
  