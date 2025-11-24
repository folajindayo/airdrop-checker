import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/services/notificationService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, all } = body;

    if (all && userId) {
      const count = notificationService.markAllAsRead(userId);
      return NextResponse.json({
        success: true,
        count,
        message: `Marked ${count} notifications as read`,
      });
    }

    if (notificationId) {
      const success = notificationService.markAsRead(notificationId);

      if (!success) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    }

    return NextResponse.json(
      { error: "Provide either notificationId or userId with all=true" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark as read" },
      { status: 500 }
    );
  }
}

