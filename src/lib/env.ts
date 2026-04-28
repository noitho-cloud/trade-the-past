interface EnvConfig {
  ENCRYPTION_KEY: string;
  NEWSAPI_KEY: string | undefined;
  OPENAI_API_KEY: string | undefined;
}

let validated = false;

export function validateEnv(): EnvConfig {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey || encryptionKey.length < 64) {
    throw new Error(
      "Missing or invalid ENCRYPTION_KEY env var. " +
      "Generate one: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  if (!validated) {
    validated = true;

    if (!process.env.NEWSAPI_KEY) {
      console.warn("[env] NEWSAPI_KEY not set — NewsAPI fallback disabled (RSS primary source active)");
    }
    if (!process.env.OPENAI_API_KEY) {
      console.warn("[env] OPENAI_API_KEY not set — AI-powered historical matching disabled");
    }
  }

  return {
    ENCRYPTION_KEY: encryptionKey,
    NEWSAPI_KEY: process.env.NEWSAPI_KEY || undefined,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
  };
}

export function getEnv(): EnvConfig {
  return validateEnv();
}
