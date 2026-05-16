export interface AppConfig {
  databaseUrl: string;
  authSecret: string;
  apiPort: number;
  allowedOrigins: string[];
  appUrl: string;
  storageEndpoint?: string;
  storageRegion: string;
  storageAccessKeyId: string;
  storageSecretAccessKey: string;
  storageBucketName: string;
}

export default (): { app: AppConfig } => {
  const missing: string[] = [];

  const require = (key: string): string => {
    const val = process.env[key];
    if (!val) missing.push(key);
    return val ?? "";
  };

  const config: AppConfig = {
    databaseUrl: require("DATABASE_URL"),
    authSecret: require("AUTH_SECRET"),
    apiPort: Number(process.env.API_PORT) || 3001,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:3005"],
    appUrl: process.env.APP_URL ?? "http://localhost:3005",
    storageEndpoint: process.env.STORAGE_ENDPOINT,
    storageRegion: process.env.STORAGE_REGION ?? "auto",
    storageAccessKeyId: require("STORAGE_ACCESS_KEY_ID"),
    storageSecretAccessKey: require("STORAGE_SECRET_ACCESS_KEY"),
    storageBucketName: require("STORAGE_BUCKET_NAME"),
  };

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return { app: config };
};
