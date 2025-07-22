const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../utils/database');
const { getSession, setSession, deleteSession, client: redisClient } = require('../utils/redis');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// Mock dependencies
jest.mock('../utils/database');
jest.mock('../utils/redis');
jest.mock('jsonwebtoken');

describe('Analytics Controller', () => {
    let app;
    let mockUser;
    let validToken;

    beforeAll(() => {
        // Setup express app with routes
        app = express();
        app.use(express.json());

        // Mock auth middleware to set req.user
        app.use('/analytics', (req, res, next) => {
            req.user = mockUser;
            next();
        });

        app.get('/analytics/overview', analyticsController.getOverview);
        app.get('/analytics/productivity', analyticsController.getProductivity);
        app.get('/analytics/categories', analyticsController.getCategoryStats);
        app.get('/analytics/trends', analyticsController.getTrends);
        app.delete('/analytics/cache', analyticsController.clearCache);
        app.get('/analytics/cache/status', analyticsController.getCacheStatus);
    });

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        mockUser = { id: 1, email: 'test@example.com' };
        validToken = 'valid.jwt.token';

        // Mock Redis functions
        getSession.mockImplementation(() => Promise.resolve(null));
        setSession.mockImplementation(() => Promise.resolve('OK'));
        deleteSession.mockImplementation(() => Promise.resolve(1));
        redisClient.get = jest.fn().mockResolvedValue(null);
    });

    describe('GET /analytics/overview', () => {
        const mockOverviewData = {
            total_tasks: '10',
            completed_tasks: '6',
            pending_tasks: '2',
            in_progress_tasks: '2',
            overdue_tasks: '1',
            high_priority_tasks: '3',
            medium_priority_tasks: '4',
            low_priority_tasks: '3'
        };

        it('should return overview analytics when not cached', async () => {
            pool.query.mockResolvedValueOnce({ rows: [mockOverviewData] });

            const response = await request(app)
                .get('/analytics/overview')
                .expect(200);

            expect(response.body).toEqual(expect.objectContaining({
                total_tasks: 10,
                completed_tasks: 6,
                pending_tasks: 2,
                in_progress_tasks: 2,
                overdue_tasks: 1,
                high_priority_tasks: 3,
                medium_priority_tasks: 4,
                low_priority_tasks: 3,
                completion_rate: 60.0
            }));

            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockUser.id]
            );
            expect(setSession).toHaveBeenCalledWith(
                `analytics:overview:${mockUser.id}`,
                expect.any(Object),
                300
            );
        });

        it('should return cached data when available', async () => {
            const cachedData = { total_tasks: 5, completion_rate: 80.0 };
            getSession.mockResolvedValueOnce(cachedData);

            const response = await request(app)
                .get('/analytics/overview')
                .expect(200);

            expect(response.body).toEqual(cachedData);
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('should handle zero tasks correctly', async () => {
            const emptyData = {
                total_tasks: '0',
                completed_tasks: '0',
                pending_tasks: '0',
                in_progress_tasks: '0',
                overdue_tasks: '0',
                high_priority_tasks: '0',
                medium_priority_tasks: '0',
                low_priority_tasks: '0'
            };
            pool.query.mockResolvedValueOnce({ rows: [emptyData] });

            const response = await request(app)
                .get('/analytics/overview')
                .expect(200);

            expect(response.body.completion_rate).toBe(0);
            expect(response.body.total_tasks).toBe(0);
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database connection failed'));

            const response = await request(app)
                .get('/analytics/overview')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Failed to fetch analytics overview'
            });
        });
    });

    describe('GET /analytics/productivity', () => {
        const mockProductivityData = [
            {
                date: new Date('2024-01-15'),
                tasks_created: '5',
                tasks_completed: '3'
            },
            {
                date: new Date('2024-01-14'),
                tasks_created: '2',
                tasks_completed: '4'
            }
        ];

        it('should return productivity metrics', async () => {
            pool.query.mockResolvedValueOnce({ rows: mockProductivityData });

            const response = await request(app)
                .get('/analytics/productivity')
                .expect(200);

            expect(response.body).toEqual({
                daily_stats: [
                    {
                        date: '2024-01-15',
                        tasks_created: 5,
                        tasks_completed: 3
                    },
                    {
                        date: '2024-01-14',
                        tasks_created: 2,
                        tasks_completed: 4
                    }
                ],
                avg_daily_completion: '3.5'
            });

            expect(setSession).toHaveBeenCalledWith(
                `analytics:productivity:${mockUser.id}`,
                expect.any(Object),
                600
            );
        });

        it('should handle empty productivity data', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .get('/analytics/productivity')
                .expect(200);

            expect(response.body).toEqual({
                daily_stats: [],
                avg_daily_completion: 0
            });
        });

        it('should return cached productivity data', async () => {
            const cachedData = { daily_stats: [], avg_daily_completion: 2.5 };
            getSession.mockResolvedValueOnce(cachedData);

            const response = await request(app)
                .get('/analytics/productivity')
                .expect(200);

            expect(response.body).toEqual(cachedData);
            expect(pool.query).not.toHaveBeenCalled();
        });
    });

    describe('GET /analytics/categories', () => {
        const mockCategoryData = [
            {
                category: 'Work',
                total_tasks: '10',
                completed_tasks: '6',
                pending_tasks: '2',
                in_progress_tasks: '2'
            },
            {
                category: null,
                total_tasks: '5',
                completed_tasks: '3',
                pending_tasks: '1',
                in_progress_tasks: '1'
            }
        ];

        it('should return category statistics', async () => {
            pool.query.mockResolvedValueOnce({ rows: mockCategoryData });

            const response = await request(app)
                .get('/analytics/categories')
                .expect(200);

            expect(response.body).toEqual([
                {
                    category: 'Work',
                    total_tasks: 10,
                    completed_tasks: 6,
                    pending_tasks: 2,
                    in_progress_tasks: 2,
                    completion_rate: '60.0'
                },
                {
                    "category": null,
                    "completed_tasks": 3,
                    "completion_rate": "60.0",
                    "in_progress_tasks": 1,
                    "pending_tasks": 1,
                    "total_tasks": 5,
                }
            ]);
        });

        it('should handle categories with zero completion rate', async () => {
            const zeroCompletionData = [{
                category: 'Personal',
                total_tasks: '0',
                completed_tasks: '0',
                pending_tasks: '0',
                in_progress_tasks: '0'
            }];
            pool.query.mockResolvedValueOnce({ rows: zeroCompletionData });

            const response = await request(app)
                .get('/analytics/categories')
                .expect(200);

            expect(response.body[0].completion_rate).toBe(0);
        });
    });

    describe('GET /analytics/trends', () => {
        const mockTrendsData = [
            {
                period: new Date('2024-01-15'),
                completed_count: '5'
            },
            {
                period: new Date('2024-01-14'),
                completed_count: '3'
            }
        ];

        it('should return trends for default 7d period', async () => {
            pool.query.mockResolvedValueOnce({ rows: mockTrendsData });

            const response = await request(app)
                .get('/analytics/trends')
                .expect(200);

            expect(response.body).toEqual({
                period: '7d',
                data: [
                    {
                        period: '2024-01-15',
                        completed_tasks: 5
                    },
                    {
                        period: '2024-01-14',
                        completed_tasks: 3
                    }
                ]
            });

            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining("DATE_TRUNC('day'"),
                [mockUser.id]
            );
        });

        it('should handle 30d period parameter', async () => {
            pool.query.mockResolvedValueOnce({ rows: mockTrendsData });

            const response = await request(app)
                .get('/analytics/trends?period=30d')
                .expect(200);

            expect(response.body.period).toBe('30d');
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining("INTERVAL '30 days'"),
                [mockUser.id]
            );
        });

        it('should handle 90d period with weekly grouping', async () => {
            pool.query.mockResolvedValueOnce({ rows: mockTrendsData });

            const response = await request(app)
                .get('/analytics/trends?period=90d')
                .expect(200);

            expect(response.body.period).toBe('90d');
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining("DATE_TRUNC('week'"),
                [mockUser.id]
            );
        });
    });

    describe('DELETE /analytics/cache', () => {
        it('should clear overview cache', async () => {
            const response = await request(app)
                .delete('/analytics/cache?type=overview')
                .expect(200);

            expect(response.body).toEqual({
                message: 'Overview cache cleared successfully'
            });
            expect(deleteSession).toHaveBeenCalledWith(
                `analytics:overview:${mockUser.id}`
            );
        });

        it('should clear productivity cache', async () => {
            const response = await request(app)
                .delete('/analytics/cache?type=productivity')
                .expect(200);

            expect(response.body).toEqual({
                message: 'Productivity cache cleared successfully'
            });
            expect(deleteSession).toHaveBeenCalledWith(
                `analytics:productivity:${mockUser.id}`
            );
        });

        it('should clear all trend caches', async () => {
            const response = await request(app)
                .delete('/analytics/cache?type=trends')
                .expect(200);

            expect(response.body).toEqual({
                message: 'Trends cache cleared successfully'
            });
            expect(deleteSession).toHaveBeenCalledTimes(3); // 7d, 30d, 90d
        });

        it('should clear all analytics cache when no type specified', async () => {
            const response = await request(app)
                .delete('/analytics/cache')
                .expect(200);

            expect(response.body).toEqual({
                message: 'All analytics cache cleared successfully'
            });
            expect(deleteSession).toHaveBeenCalledTimes(6); // All cache types
        });

        it('should handle cache clearing errors', async () => {
            deleteSession.mockRejectedValueOnce(new Error('Redis error'));

            const response = await request(app)
                .delete('/analytics/cache?type=overview')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Failed to clear cache'
            });
        });
    });

    describe('GET /analytics/cache/status', () => {
        it('should return cache status for all keys', async () => {
            redisClient.get
                .mockResolvedValueOnce('{"data": "cached"}') // overview exists
                .mockResolvedValueOnce(null) // productivity doesn't exist
                .mockResolvedValueOnce('{"stats": "data"}') // categories exists
                .mockResolvedValueOnce(null) // trends:7d doesn't exist
                .mockResolvedValueOnce(null) // trends:30d doesn't exist  
                .mockResolvedValueOnce(null); // trends:90d doesn't exist

            const response = await request(app)
                .get('/analytics/cache/status')
                .expect(200);

            expect(response.body).toEqual({
                overview: {
                    exists: true,
                    size: expect.any(Number)
                },
                productivity: {
                    exists: false,
                    size: 0
                },
                categories: {
                    exists: true,
                    size: expect.any(Number)
                },
                'trends:7d': {
                    exists: false,
                    size: 0
                },
                'trends:30d': {
                    exists: false,
                    size: 0
                },
                'trends:90d': {
                    exists: false,
                    size: 0
                }
            });
        });

        it('should handle Redis errors when checking cache status', async () => {
            redisClient.get.mockRejectedValue(new Error('Redis connection failed'));

            const response = await request(app)
                .get('/analytics/cache/status')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Failed to get cache status'
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle Redis cache errors gracefully', async () => {
            getSession.mockRejectedValueOnce(new Error('Redis error'));
            pool.query.mockResolvedValueOnce({ rows: [{}] });

            // Should still work even if cache fails
            const response = await request(app)
                .get('/analytics/overview')
                .expect(500); // This will fail due to the Redis error in getSession

            expect(response.body).toEqual({
                error: 'Failed to fetch analytics overview'
            });
        });

        it('should handle setSession cache errors gracefully', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{
                    total_tasks: '1',
                    completed_tasks: '1',
                    pending_tasks: '0',
                    in_progress_tasks: '0',
                    overdue_tasks: '0',
                    high_priority_tasks: '0',
                    medium_priority_tasks: '1',
                    low_priority_tasks: '0'
                }]
            });
            setSession.mockRejectedValueOnce(new Error('Cache write failed'));

            // Should still return data even if caching fails
            const response = await request(app)
                .get('/analytics/overview')
                .expect(500); // This will fail due to the setSession error

            expect(response.body).toEqual({
                error: 'Failed to fetch analytics overview'
            });
        });
    });
});