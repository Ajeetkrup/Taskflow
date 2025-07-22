const request = require('supertest');
const app = require('../app');
const db = require('../utils/database');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../utils/database');
jest.mock('../utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn()
}));

describe('Notification Model Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new notification successfully', async () => {
            const mockNotification = {
                id: 1,
                user_id: 1,
                task_id: 1,
                type: 'reminder',
                title: 'Task Due Soon',
                message: 'Your task is due in 1 hour',
                scheduled_for: new Date(),
                created_at: new Date()
            };

            db.query.mockResolvedValue({ rows: [mockNotification] });

            const notificationData = {
                userId: 1,
                taskId: 1,
                type: 'reminder',
                title: 'Task Due Soon',
                message: 'Your task is due in 1 hour',
                scheduledFor: new Date()
            };

            const result = await Notification.create(notificationData);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO notifications'),
                [1, 1, 'reminder', 'Task Due Soon', 'Your task is due in 1 hour', notificationData.scheduledFor]
            );
            expect(result).toEqual(mockNotification);
        });

        it('should throw error when database query fails', async () => {
            const error = new Error('Database error');
            db.query.mockRejectedValue(error);

            const notificationData = {
                userId: 1,
                taskId: 1,
                type: 'reminder',
                title: 'Test',
                message: 'Test message',
                scheduledFor: new Date()
            };

            await expect(Notification.create(notificationData)).rejects.toThrow('Database error');
        });
    });

    describe('getByUserId', () => {
        it('should get notifications for a user with default pagination', async () => {
            const mockNotifications = [
                {
                    id: 1,
                    user_id: 1,
                    type: 'reminder',
                    title: 'Task Due',
                    message: 'Task is due soon',
                    task_title: 'Sample Task',
                    created_at: new Date()
                },
                {
                    id: 2,
                    user_id: 1,
                    type: 'update',
                    title: 'Task Updated',
                    message: 'Task has been updated',
                    task_title: 'Another Task',
                    created_at: new Date()
                }
            ];

            db.query.mockResolvedValue({ rows: mockNotifications });

            const result = await Notification.getByUserId(1);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT n.*, t.title as task_title'),
                [1, 20, 0]
            );
            expect(result).toEqual(mockNotifications);
        });

        it('should get notifications with custom pagination', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await Notification.getByUserId(1, 10, 5);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('LIMIT $2 OFFSET $3'),
                [1, 10, 5]
            );
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread notifications count', async () => {
            db.query.mockResolvedValue({ rows: [{ count: '5' }] });

            const result = await Notification.getUnreadCount(1);

            expect(db.query).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
                [1]
            );
            expect(result).toBe(5);
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            const mockNotification = {
                id: 1,
                user_id: 1,
                is_read: true,
                updated_at: new Date()
            };

            db.query.mockResolvedValue({ rows: [mockNotification] });

            const result = await Notification.markAsRead(1, 1);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE notifications'),
                [1, 1]
            );
            expect(result).toEqual(mockNotification);
        });
    });

    describe('updatePreferences', () => {
        it('should update notification preferences', async () => {
            const mockPreferences = {
                user_id: 1,
                email_enabled: false,
                due_date_reminder: true,
                reminder_minutes: 30,
                daily_summary: true,
                updated_at: new Date()
            };

            db.query.mockResolvedValue({ rows: [mockPreferences] });

            const preferences = {
                emailEnabled: false,
                dueDateReminder: true,
                reminderMinutes: 30,
                dailySummary: true
            };

            const result = await Notification.updatePreferences(1, preferences);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE notification_preferences'),
                [1, false, true, 30, true]
            );
            expect(result).toEqual(mockPreferences);
        });

        it('should throw error when no valid fields provided', async () => {
            await expect(Notification.updatePreferences(1, {}))
                .rejects.toThrow('No valid fields provided for update');
        });
    });

    describe('getPreferences', () => {
        it('should get existing preferences', async () => {
            const mockPreferences = {
                user_id: 1,
                email_enabled: true,
                due_date_reminder: true,
                reminder_minutes: 60,
                daily_summary: false
            };

            db.query.mockResolvedValue({ rows: [mockPreferences] });

            const result = await Notification.getPreferences(1);

            expect(result).toEqual(mockPreferences);
        });
    });
});

describe('Notification Routes Tests', () => {
    let authToken;
    const mockUserId = 1;

    beforeAll(() => {
        // Create a valid JWT token for testing
        authToken = jwt.sign(
            { userId: mockUserId, email: 'test@example.com' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /notifications', () => {
        it('should get user notifications successfully', async () => {
            const mockNotifications = [
                {
                    id: 1,
                    user_id: 1,
                    type: 'reminder',
                    title: 'Task Due',
                    message: 'Task is due soon',
                    is_read: false,
                    created_at: `${new Date()}`
                }
            ];

            db.query.mockResolvedValue({ rows: mockNotifications });

            const response = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toEqual({
                "pagination": {
                    "limit": 20,
                    "page": 1,
                    "total": 1,
                },
                "unreadCount": null,
                notifications: mockNotifications
            });
        });

        it('should return 401 without authentication', async () => {
            await request(app)
                .get('/api/notifications')
                .expect(401);
        });
    });

    describe('GET /notifications/unread-count', () => {
        it('should get unread notifications count', async () => {
            db.query.mockResolvedValue({ rows: [{ count: '3' }] });

            const response = await request(app)
                .get('/api/notifications/unread-count')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toEqual({
                "unreadCount": 3,
            });
        });
    });

    describe('PUT /notifications/:id/read', () => {
        it('should mark notification as read', async () => {
            const mockNotification = {
                message: "Notification marked as read",
                notification: {
                    id: 1,
                    is_read: true,
                    updated_at: `${new Date()}`,
                    user_id: 1,
                }
            };

            db.query.mockResolvedValue({ rows: [mockNotification] });

            const response = await request(app)
                .put('/api/notifications/1/read')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toEqual({
                message: "Notification marked as read",
                notification: mockNotification
            });
        });

        it('should return 404 if notification not found', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .put('/api/notifications/999/read')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('PUT /notifications/mark-all-read', () => {
        it('should mark all notifications as read', async () => {
            const mockNotifications = [
                { id: 1, user_id: 1, is_read: true },
                { id: 2, user_id: 1, is_read: true }
            ];

            db.query.mockResolvedValue({ rows: mockNotifications });

            const response = await request(app)
                .put('/api/notifications/mark-all-read')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toEqual({
                message: 'All notifications marked as read',
            });
        });
    });

    describe('DELETE /notifications/:id', () => {
        it('should delete notification successfully', async () => {
            const mockNotification = {
                id: 1,
                user_id: 1,
                title: 'Deleted notification'
            };

            db.query.mockResolvedValue({ rows: [mockNotification] });

            const response = await request(app)
                .delete('/api/notifications/1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toEqual({
                message: 'Notification deleted successfully'
            });
        });

        it('should return 404 if notification not found', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .delete('/api/notifications/999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('GET /notifications/preferences', () => {
        it('should get notification preferences', async () => {
            const mockPreferences = {
                user_id: 1,
                email_enabled: true,
                due_date_reminder: true,
                reminder_minutes: 60,
                daily_summary: false
            };

            db.query.mockResolvedValue({ rows: [mockPreferences] });

            const response = await request(app)
                .get('/api/notifications/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toEqual({
                ...mockPreferences
            });
        });
    });

    describe('POST /notifications/preferences', () => {
        it('should update notification preferences successfully', async () => {
            const mockUpdatedPreferences = {
                daily_summary: true,
                due_date_reminder: true,
                email_enabled: false,
                reminder_minutes: 30,
                user_id: 1,
                updated_at: `${new Date()}`
            };

            db.query.mockResolvedValue({ rows: [mockUpdatedPreferences] });

            const preferences = {
                emailEnabled: false,
                dueDateReminder: true,
                reminderMinutes: 30,
                dailySummary: true
            };

            const response = await request(app)
                .post('/api/notifications/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send(preferences)
                .expect(200);

            expect(response.body).toEqual({
                "message": "Notification preferences updated successfully",
                preferences: mockUpdatedPreferences,
            });
        });

        it('should validate preferences data', async () => {
            const invalidPreferences = {
                emailEnabled: 'not-a-boolean',
                reminderMinutes: 'not-a-number'
            };

            await request(app)
                .post('/api/notifications/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidPreferences)
                .expect(400);
        });
    });

    describe('POST /notifications', () => {
        it('should create notification successfully', async () => {
            const mockNotification = {
                id: 1,
                user_id: 1,
                task_id: 1,
                type: 'reminder',
                title: 'Test Notification',
                message: 'Test message'
            };

            db.query.mockResolvedValue({ rows: [mockNotification] });

            const notificationData = {
                userId: 4,
                taskId: 1,
                type: 'reminder',
                title: 'New Task Reminder',
                message: 'You have a task due soon'
            }

            const response = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(notificationData)
                .expect(201);

            expect(response.body).toEqual({
                message: 'Notification created successfully',
                notification: mockNotification,
            });
        });

        it('should validate notification data', async () => {
            const invalidData = {
                type: 'invalid-type',
                title: '', // Empty title should be invalid
                message: 'Test message'
            };

            await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData)
                .expect(400);
        });
    });

    describe('POST /notifications/test', () => {
        it('should send test notification successfully', async () => {
            const mockNotification = {
                id: 1,
                user_id: 1,
                type: 'test',
                title: 'Test Notification',
                message: 'This is a test notification'
            };

            db.query.mockResolvedValue({ rows: [mockNotification] });

            const response = await request(app)
                .post('/api/notifications/test')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toEqual({
                message: 'Test notification sent successfully',
                notification: mockNotification
            });
        });
    });
});

describe('Notification Integration Tests', () => {
    let authToken;
    const mockUserId = 1;

    beforeAll(() => {
        authToken = jwt.sign(
            { userId: mockUserId, email: 'test@example.com' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle complete notification workflow', async () => {
        // Step 1: Get initial unread count
        db.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

        let response = await request(app)
            .get('/api/notifications/unread-count')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(response.body.unreadCount).toBe(0);

        // Step 2: Create a new notification
        const newNotification = {
            id: 1,
            user_id: 1,
            task_id: 1,
            type: 'reminder',
            title: 'New Task Reminder',
            message: 'You have a task due soon',
            is_read: false,
        };

        db.query.mockResolvedValueOnce({ rows: [newNotification] });

        response = await request(app)
            .post('/api/notifications')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                userId: 4,
                taskId: 1,
                type: 'reminder',
                title: 'New Task Reminder',
                message: 'You have a task due soon',
            })
            .expect(201);

        expect(response.body.message).toBe("Notification created successfully");

        // Step 3: Get updated unread count
        db.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });

        response = await request(app)
            .get('/api/notifications/unread-count')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.unreadCount).toBe(1);

        // Step 4: Get notifications list
        db.query.mockResolvedValueOnce({ rows: [newNotification] });

        response = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.notifications).toHaveLength(1);
        expect(response.body.notifications[0].is_read).toBe(false);

        // Step 5: Mark notification as read
        const readNotification = { ...newNotification, is_read: true };
        db.query.mockResolvedValueOnce({ rows: [readNotification] });

        response = await request(app)
            .put('/api/notifications/1/read')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.notification.is_read).toBe(true);

        // Step 6: Verify unread count decreased
        db.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

        response = await request(app)
            .get('/api/notifications/unread-count')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.unreadCount).toBe(0);
    });

    it('should handle preferences workflow', async () => {
        // Step 1: Get default preferences (created when none exist)
        const defaultPreferences = {
            user_id: 1,
            email_enabled: true,
            due_date_reminder: true,
            reminder_minutes: 60,
            daily_summary: false
        };

        db.query
            .mockResolvedValueOnce({ rows: [] }) // No existing preferences
            .mockResolvedValueOnce({ rows: [defaultPreferences] }); // Create default

        let response = await request(app)
            .get('/api/notifications/preferences')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.user_id).toBe(1);
        expect(response.body.email_enabled).toBe(true);

        // Step 2: Update preferences
        const updatedPreferences = {
            ...defaultPreferences,
            email_enabled: false,
            reminder_minutes: 30,
            daily_summary: true
        };

        db.query.mockResolvedValueOnce({ rows: [updatedPreferences] });

        response = await request(app)
            .post('/api/notifications/preferences')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                emailEnabled: false,
                reminderMinutes: 30,
                dailySummary: true
            })
            .expect(200);

        expect(response.body.message).toBe("Notification preferences updated successfully");
    });
});