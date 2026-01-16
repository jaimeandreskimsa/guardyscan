import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { performSecurityScan } from "@/lib/scanner";

// This endpoint should be protected with a secret key in production
// and called by Vercel Cron or similar scheduler
export async function GET(req: Request) {
  try {
    // Verify authorization (use a secret key)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret-change-in-production";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.log("Running monthly auto-scans...");

    // Get all subscriptions with auto-scan enabled
    const subscriptions = await prisma.subscription.findMany({
      where: {
        autoScanEnabled: true,
        autoScanUrl: { not: null },
        status: "ACTIVE",
        plan: { not: "FREE" },
      },
      include: {
        user: true,
      },
    });

    console.log(`Found ${subscriptions.length} subscriptions with auto-scan enabled`);

    const results = [];

    for (const subscription of subscriptions) {
      try {
        // Check if user has reached scan limit
        if (subscription.scansLimit !== -1 && subscription.scansUsed >= subscription.scansLimit) {
          console.log(`User ${subscription.userId} has reached scan limit`);
          results.push({
            userId: subscription.userId,
            status: "skipped",
            reason: "scan_limit_reached",
          });
          continue;
        }

        // Create scan record
        const scan = await prisma.scan.create({
          data: {
            userId: subscription.userId,
            targetUrl: subscription.autoScanUrl!,
            scanType: subscription.plan === "PROFESSIONAL" || subscription.plan === "ENTERPRISE" 
              ? "FULL" 
              : "BASIC",
            status: "PENDING",
          },
        });

        // Perform scan asynchronously
        performSecurityScan(
          scan.id, 
          subscription.autoScanUrl!, 
          scan.scanType
        ).catch(error => {
          console.error(`Scan ${scan.id} failed:`, error);
        });

        // Update subscription
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            scansUsed: { increment: 1 },
            lastAutoScan: new Date(),
          },
        });

        results.push({
          userId: subscription.userId,
          scanId: scan.id,
          status: "created",
        });

        console.log(`Created auto-scan ${scan.id} for user ${subscription.userId}`);
      } catch (error) {
        console.error(`Error creating scan for user ${subscription.userId}:`, error);
        results.push({
          userId: subscription.userId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: subscriptions.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Monthly scan cron error:", error);
    return NextResponse.json(
      { error: "Error al ejecutar escaneos mensuales" },
      { status: 500 }
    );
  }
}
