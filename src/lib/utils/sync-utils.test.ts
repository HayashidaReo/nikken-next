import { executeSyncWithTimeout } from './sync-utils';

describe('executeSyncWithTimeout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should execute sync task successfully', async () => {
        const mockTask = jest.fn().mockResolvedValue('success');
        const result = await executeSyncWithTimeout(mockTask);

        expect(result).toBe('success');
        expect(mockTask).toHaveBeenCalledTimes(1);
    });

    it('should return the result of the sync task', async () => {
        const expectedResult = { id: '123', name: 'test' };
        const mockTask = jest.fn().mockResolvedValue(expectedResult);

        const result = await executeSyncWithTimeout(mockTask);

        expect(result).toEqual(expectedResult);
    });

    it('should timeout if task takes too long', async () => {
        const slowTask = () => new Promise(resolve => setTimeout(() => resolve('done'), 20000));

        await expect(executeSyncWithTimeout(slowTask, { timeout: 100 }))
            .rejects.toThrow('Sync timeout');
    });

    it('should use default timeout of 10000ms', async () => {
        const slowTask = () => new Promise(resolve => setTimeout(() => resolve('done'), 15000));

        const startTime = Date.now();
        await expect(executeSyncWithTimeout(slowTask))
            .rejects.toThrow('Sync timeout');
        const duration = Date.now() - startTime;

        // タイムアウトは10秒前後で発生するはず
        expect(duration).toBeGreaterThanOrEqual(9900);
        expect(duration).toBeLessThan(11000);
    }, 15000); // テストのタイムアウトを15秒に設定

    it('should call onSuccess callback when task succeeds', async () => {
        const onSuccess = jest.fn();
        const mockTask = jest.fn().mockResolvedValue('ok');

        await executeSyncWithTimeout(mockTask, { onSuccess });

        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should call onError callback when task fails', async () => {
        const onError = jest.fn();
        const expectedError = new Error('test error');
        const failingTask = jest.fn().mockRejectedValue(expectedError);

        await expect(executeSyncWithTimeout(failingTask, { onError }))
            .rejects.toThrow('test error');

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expectedError);
    });

    it('should call onError callback on timeout', async () => {
        const onError = jest.fn();
        const slowTask = () => new Promise(resolve => setTimeout(() => resolve('done'), 20000));

        await expect(executeSyncWithTimeout(slowTask, { timeout: 100, onError }))
            .rejects.toThrow('Sync timeout');

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(onError.mock.calls[0][0].message).toBe('Sync timeout');
    });

    it('should convert non-Error exceptions to Error instances', async () => {
        const onError = jest.fn();
        const failingTask = jest.fn().mockRejectedValue('string error');

        await expect(executeSyncWithTimeout(failingTask, { onError }))
            .rejects.toThrow('Unknown sync error');

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(onError.mock.calls[0][0].message).toBe('Unknown sync error');
    });

    it('should allow custom timeout values', async () => {
        const slowTask = () => new Promise(resolve => setTimeout(() => resolve('done'), 3000));

        // 5秒のタイムアウトなら成功するはず
        await expect(executeSyncWithTimeout(slowTask, { timeout: 5000 }))
            .resolves.toBe('done');

        // 1秒のタイムアウトなら失敗するはず
        await expect(executeSyncWithTimeout(slowTask, { timeout: 1000 }))
            .rejects.toThrow('Sync timeout');
    });

    it('should work without any options', async () => {
        const mockTask = jest.fn().mockResolvedValue('result');

        const result = await executeSyncWithTimeout(mockTask);

        expect(result).toBe('result');
    });

    it('should not call onSuccess when task fails', async () => {
        const onSuccess = jest.fn();
        const failingTask = jest.fn().mockRejectedValue(new Error('fail'));

        await expect(executeSyncWithTimeout(failingTask, { onSuccess }))
            .rejects.toThrow('fail');

        expect(onSuccess).not.toHaveBeenCalled();
    });
});
