import { notificationService } from "@/lib/services/notificationService";

describe("NotificationService", () => {
  beforeEach(() => {
    // Clear notifications before each test
    notificationService["notifications"] = [];
  });

  describe("create", () => {
    it("creates notification", () => {
      const notification = notificationService.create(
        "user1",
        "airdrop",
        "New Airdrop",
        "Check out this airdrop"
      );

      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe("user1");
      expect(notification.type).toBe("airdrop");
      expect(notification.title).toBe("New Airdrop");
      expect(notification.read).toBe(false);
    });

    it("includes additional data", () => {
      const notification = notificationService.create(
        "user1",
        "wallet",
        "Transaction",
        "Transaction confirmed",
        { txHash: "0x123" }
      );

      expect(notification.data?.txHash).toBe("0x123");
    });
  });

  describe("getForUser", () => {
    beforeEach(() => {
      notificationService.create("user1", "airdrop", "Title1", "Message1");
      notificationService.create("user1", "wallet", "Title2", "Message2");
      notificationService.create("user2", "system", "Title3", "Message3");
    });

    it("returns all user notifications", () => {
      const notifications = notificationService.getForUser("user1");

      expect(notifications.length).toBe(2);
      expect(notifications.every((n) => n.userId === "user1")).toBe(true);
    });

    it("returns only unread notifications", () => {
      const notifications = notificationService.getForUser("user1");
      notificationService.markAsRead(notifications[0].id);

      const unreadNotifications = notificationService.getForUser("user1", true);

      expect(unreadNotifications.length).toBe(1);
      expect(unreadNotifications[0].read).toBe(false);
    });
  });

  describe("markAsRead", () => {
    it("marks notification as read", () => {
      const notification = notificationService.create(
        "user1",
        "airdrop",
        "Title",
        "Message"
      );

      const result = notificationService.markAsRead(notification.id);

      expect(result).toBe(true);
      expect(notificationService.getForUser("user1", true).length).toBe(0);
    });

    it("returns false for non-existent notification", () => {
      const result = notificationService.markAsRead("invalid-id");

      expect(result).toBe(false);
    });
  });

  describe("markAllAsRead", () => {
    it("marks all user notifications as read", () => {
      notificationService.create("user1", "airdrop", "Title1", "Message1");
      notificationService.create("user1", "wallet", "Title2", "Message2");
      notificationService.create("user2", "system", "Title3", "Message3");

      const count = notificationService.markAllAsRead("user1");

      expect(count).toBe(2);
      expect(notificationService.getUnreadCount("user1")).toBe(0);
      expect(notificationService.getUnreadCount("user2")).toBe(1);
    });
  });

  describe("delete", () => {
    it("deletes notification", () => {
      const notification = notificationService.create(
        "user1",
        "airdrop",
        "Title",
        "Message"
      );

      const result = notificationService.delete(notification.id);

      expect(result).toBe(true);
      expect(notificationService.getForUser("user1").length).toBe(0);
    });

    it("returns false for non-existent notification", () => {
      const result = notificationService.delete("invalid-id");

      expect(result).toBe(false);
    });
  });

  describe("getUnreadCount", () => {
    it("returns unread count", () => {
      notificationService.create("user1", "airdrop", "Title1", "Message1");
      notificationService.create("user1", "wallet", "Title2", "Message2");

      const count = notificationService.getUnreadCount("user1");

      expect(count).toBe(2);
    });

    it("updates after marking as read", () => {
      const notification = notificationService.create(
        "user1",
        "airdrop",
        "Title",
        "Message"
      );

      notificationService.markAsRead(notification.id);

      expect(notificationService.getUnreadCount("user1")).toBe(0);
    });
  });
});

