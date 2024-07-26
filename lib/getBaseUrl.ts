const getBaseUrl = () => process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.VERCEL_URL;

export default getBaseUrl;
