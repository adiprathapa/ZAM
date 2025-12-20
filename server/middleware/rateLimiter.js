/**
 * Rate Limiting Middleware
 * Limits requests per IP address to 3 requests per day (24 hours)
 */

// In-memory store for tracking requests per IP
// Format: { ip: { requestCount: number, resetTime: timestamp } }
const requestStore = new Map();

const REQUESTS_PER_DAY = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  // Initialize or retrieve the IP's request data
  if (!requestStore.has(ip)) {
    requestStore.set(ip, {
      requestCount: 0,
      resetTime: now + WINDOW_MS,
    });
  }

  const ipData = requestStore.get(ip);

  // Check if the 24-hour window has expired
  if (now >= ipData.resetTime) {
    // Reset the counter and window
    ipData.requestCount = 0;
    ipData.resetTime = now + WINDOW_MS;
  }

  // Increment the request count
  ipData.requestCount += 1;

  // Calculate remaining requests and reset time
  const remainingRequests = Math.max(0, REQUESTS_PER_DAY - ipData.requestCount);
  const resetDate = new Date(ipData.resetTime);

  // Set rate limit headers
  res.set('X-RateLimit-Limit', REQUESTS_PER_DAY.toString());
  res.set('X-RateLimit-Remaining', remainingRequests.toString());
  res.set('X-RateLimit-Reset', ipData.resetTime.toString());

  // Check if rate limit exceeded
  if (ipData.requestCount > REQUESTS_PER_DAY) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded: 3 requests per day allowed. Please try again after ${resetDate.toISOString()}`,
      resetTime: resetDate.toISOString(),
    });
  }

  next();
}

/**
 * Cleanup old entries periodically (optional)
 * Removes entries that have expired to prevent memory leaks
 */
export function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [ip, data] of requestStore.entries()) {
    if (now >= data.resetTime + WINDOW_MS) {
      requestStore.delete(ip);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredEntries, 60 * 60 * 1000);
