const gateways = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/"
];

export const fetchWithIPFSGatewayRotation = async (cid) => {
  for (const gateway of gateways) {
    try {
      const res = await fetch(`${gateway}${cid}`);
      if (!res.ok) continue;
      const json = await res.json();
      return json;
    } catch (_) {
      continue;
    }
  }
  throw new Error("All gateways failed");
};

export const getCachedMetadata = async (key, cid) => {
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, expiry } = JSON.parse(cached);
    if (Date.now() < expiry) return data;
    localStorage.removeItem(key);
  }
  try {
    const metadata = await fetchWithIPFSGatewayRotation(cid);
    localStorage.setItem(key, JSON.stringify({
      data: metadata,
      expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }));
    return metadata;
  } catch (err) {
    return { eventName: 'Unknown', date: 'N/A', price: '0' };
  }
};
