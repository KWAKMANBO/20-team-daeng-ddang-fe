const shouldLogOnLocalhost = (): boolean =>
    typeof window !== 'undefined' && window.location.hostname === 'localhost';

const debugLog = (...args: unknown[]) => {
    if (shouldLogOnLocalhost()) {
        console.debug(...args);
    }
};

export interface AnalysisSSEData {
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAIL';
    resultId?: string | null;
    errorMessage?: string | null;
    [key: string]: unknown;
}

/**
 * 표정분석 / 돌발미션 SSE 연결
 *   event: connected  → 연결 확인
 *   event: heartbeat  → 연결 유지
 *   event: status     → 분석 결과 (SUCCESS / FAIL)
 */
export const connectWalkAnalysisSSE = (
    walkId: number,
    taskId: string,
    onDone: (data: AnalysisSSEData) => void,
    onError: (err: Error) => void
): (() => void) => {
    const url = `/api/sse/walks/${walkId}/tasks/${taskId}`;
    let settled = false;

    const es = new EventSource(url, {
        withCredentials: true,
    });

    es.addEventListener('connected', (event) => {
        debugLog('[SSE Walk] connected:', (event as MessageEvent).data);
    });

    es.addEventListener('heartbeat', () => {
        debugLog('[SSE Walk] heartbeat');
    });

    es.addEventListener('status', (event) => {
        if (settled) return;
        try {
            const data: AnalysisSSEData = JSON.parse((event as MessageEvent).data);
            debugLog('[SSE Walk] status 수신:', data);

            if (data.status === 'SUCCESS') {
                settled = true;
                es.close();
                onDone(data);
            } else if (data.status === 'FAIL') {
                settled = true;
                es.close();
                onError(new Error(data.errorMessage ?? '분석에 실패했습니다.'));
            }
        } catch {
            settled = true;
            es.close();
            onError(new Error('SSE 메시지 파싱 실패'));
        }
    });

    es.onerror = (err) => {
        console.error('[SSE Walk] onerror settled:', settled, err);
        if (settled) return;
        settled = true;
        es.close();
        onError(new Error('SSE 연결 오류가 발생했습니다.'));
    };

    return () => {
        settled = true;
        es.close();
    };
};

//헬스케어 SSE 연결
export const connectHealthcareSSE = (
    taskId: string,
    onDone: (data: AnalysisSSEData) => void,
    onError: (err: Error) => void
): (() => void) => {
    const url = `/api/sse/healthcares/tasks/${taskId}`;
    let settled = false;

    const es = new EventSource(url, {
        withCredentials: true,
    });

    es.addEventListener('connected', (event) => {
        debugLog('[SSE Healthcare] connected:', (event as MessageEvent).data);
    });

    es.addEventListener('heartbeat', () => {
        debugLog('[SSE Healthcare] heartbeat');
    });

    es.addEventListener('status', (event) => {
        if (settled) return;
        try {
            const data: AnalysisSSEData = JSON.parse((event as MessageEvent).data);
            debugLog('[SSE Healthcare] status 수신:', data);

            if (data.status === 'SUCCESS') {
                settled = true;
                es.close();
                onDone(data);
            } else if (data.status === 'FAIL') {
                settled = true;
                es.close();
                onError(new Error(data.errorMessage ?? '헬스케어 분석에 실패했습니다.'));
            }
        } catch {
            settled = true;
            es.close();
            onError(new Error('SSE 메시지 파싱 실패'));
        }
    });

    es.onerror = (err) => {
        console.error('[SSE Healthcare] onerror settled:', settled, err);
        if (settled) return;
        settled = true;
        es.close();
        onError(new Error('SSE 연결 오류가 발생했습니다.'));
    };

    return () => {
        settled = true;
        es.close();
    };
};
