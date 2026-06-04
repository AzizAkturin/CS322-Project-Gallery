import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error('MONGODB_URI is not set. Add it to .env.local.'));
  }
  return new MongoClient(uri).connect();
}

// In development, cache the connection on the global so hot-reloads don't
// spawn a new connection every time. If the connection fails, we clear the
// cache so the next request gets a fresh attempt rather than a cached rejection.
export default function getClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV !== 'development') {
    return createClientPromise();
  }

  if (!global._mongoClientPromise) {
    const promise = createClientPromise();
    global._mongoClientPromise = promise;
    promise.catch(() => {
      if (global._mongoClientPromise === promise) {
        global._mongoClientPromise = undefined;
      }
    });
  }
  return global._mongoClientPromise;
}
