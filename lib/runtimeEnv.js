export function hasDatabaseUrl() {
  return Boolean(String(process.env.DATABASE_URL || "").trim());
}

export function databaseUnavailableResponse(context) {
  return Response.json(
    {
      message: `${context} tidak bisa dijalankan karena DATABASE_URL belum tersedia di environment deployment.`
    },
    { status: 503 }
  );
}