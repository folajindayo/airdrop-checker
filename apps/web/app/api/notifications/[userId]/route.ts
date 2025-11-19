import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/services/notificationService";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = notificationService.getForUser(userId, unreadOnly);

    return NextResponse.json({
      notifications,
      count: notifications.length,
      unreadCount: notificationService.getUnreadCount(userId),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

