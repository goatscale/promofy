import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:85124428Rr%40@db.ajsbampepvzuxrgqosvs.supabase.co:6543/postgres?pgbouncer=true",
        },
    },
});

async function main() {
    try {
        console.log("Connecting to database...");
        await prisma.$connect();
        console.log("Connected successfully.");

        console.log("Checking for session table...");
        // Try to count sessions to verify table access
        const count = await prisma.session.count();
        console.log(`Found ${count} sessions.`);

        // Also try to query raw to see table name
        const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("Tables in public schema:", result);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
