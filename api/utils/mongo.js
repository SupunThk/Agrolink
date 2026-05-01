const dns = require("dns");

function parseDnsServers(raw) {
  if (!raw) return null;
  const servers = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return servers.length > 0 ? servers : null;
}

function isLocalhostResolver(ip) {
  return ip === "127.0.0.1" || ip === "::1";
}

function applyDnsServerOverride() {
  const envServers = parseDnsServers(process.env.DNS_SERVERS);
  if (envServers) {
    dns.setServers(envServers);
    console.log(`[MongoDB] Using DNS_SERVERS override: ${envServers.join(", ")}`);
    return;
  }

  const current = dns.getServers();
  if (current.length > 0 && current.every(isLocalhostResolver)) {
    const fallback = ["1.1.1.1", "8.8.8.8"];
    dns.setServers(fallback);
    console.warn(
      `[MongoDB] Node DNS resolvers are localhost-only (${current.join(", ")}); switching to ${fallback.join(", ")}`,
    );
  }
}

async function resolveAllViaCares(hostname, family) {
  if (family === 6) {
    const addresses6 = await dns.promises.resolve6(hostname);
    return addresses6.map((address) => ({ address, family: 6 }));
  }

  if (family === 4) {
    const addresses4 = await dns.promises.resolve4(hostname);
    return addresses4.map((address) => ({ address, family: 4 }));
  }

  // family unspecified: prefer IPv4 first, then append IPv6.
  const results = [];
  try {
    const addresses4 = await dns.promises.resolve4(hostname);
    results.push(...addresses4.map((address) => ({ address, family: 4 })));
  } catch (err) {
    // Ignore and try IPv6 next.
  }

  try {
    const addresses6 = await dns.promises.resolve6(hostname);
    results.push(...addresses6.map((address) => ({ address, family: 6 })));
  } catch (err) {
    // Ignore; we'll fail below if both lookups failed.
  }

  if (results.length === 0) {
    const noDataError = new Error(`Unable to resolve hostname: ${hostname}`);
    noDataError.code = "ENOTFOUND";
    throw noDataError;
  }

  return results;
}

function mongoDriverLookup(hostname, options, callback) {
  // MongoDB Node driver expects Node-style lookup(hostname, options, cb).
  resolveAllViaCares(hostname, options?.family)
    .then((records) => {
      if (options?.all) {
        callback(null, records);
        return;
      }

      const first = records[0];
      callback(null, first.address, first.family);
    })
    .catch((err) => callback(err));
}

function logMongoConnectError(err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[MongoDB] Connection failed:", message);

  const reason = err && typeof err === "object" ? err.reason : null;
  if (reason) {
    const reasonMessage = reason.message || reason.toString?.();
    if (reasonMessage) console.error("[MongoDB] Reason:", reasonMessage);

    const servers = reason.servers || reason.topologyDescription?.servers;
    if (servers && typeof servers === "object") {
      const entries = servers instanceof Map ? Array.from(servers.entries()) : Object.entries(servers);
      for (const [key, server] of entries) {
        if (server?.error) {
          console.error(`[MongoDB] Server ${key} error:`, server.error.message || server.error);
        }
      }
    }
  }

  if (err && typeof err === "object" && err.stack) {
    console.error(err.stack);
  }
}

async function connectMongo(mongoose, uri, options = {}) {
  applyDnsServerOverride();

  const connectOptions = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 8000,
    lookup: mongoDriverLookup,
    ...options,
  };

  await mongoose.connect(uri, connectOptions);
}

module.exports = {
  connectMongo,
  logMongoConnectError,
  applyDnsServerOverride,
  mongoDriverLookup,
};
