// Copyright (C) 2026 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import Spin from 'antd/lib/spin';
import Alert from 'antd/lib/alert';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface LabelCount {
    label: string;
    count: number;
}

interface CountsResponse {
    task_id: number;
    total: number;
    counts: LabelCount[];
}

function AnnotationCountsPage(): JSX.Element {
    const { tid } = useParams<{ tid: string }>();
    const [data, setData] = useState<CountsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState<boolean>(true);

    const load = useCallback(async (): Promise<void> => {
        setFetching(true);
        setError(null);

        try {
            const response = await fetch(`/api/test/tasks/${tid}/annotation-counts`, {
                credentials: 'include',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`The server answered ${response.status} ${response.statusText}`);
            }

            setData(await response.json());
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'The request failed.');
            setData(null);
        } finally {
            setFetching(false);
        }
    }, [tid]);

    useEffect(() => {
        load();
    }, [load]);

    if (fetching) {
        return (
            <div className='cvat-annotation-counts-page'>
                <Spin size='large' />
            </div>
        );
    }

    if (error !== null) {
        return (
            <div className='cvat-annotation-counts-page'>
                <Alert
                    type='error'
                    message='Could not load annotation counts'
                    description={error}
                    action={<Button onClick={load}>Try again</Button>}
                />
            </div>
        );
    }

    if (data === null || data.counts.length === 0) {
        return (
            <div className='cvat-annotation-counts-page'>
                <Empty description={`Task ${tid} has no annotations yet.`} />
            </div>
        );
    }

    const chartData = {
        labels: data.counts.map((row: LabelCount): string => row.label),
        datasets: [{
            data: data.counts.map((row: LabelCount): number => row.count),
            backgroundColor: '#1890ff',
            borderWidth: 0,
        }],
    };

    const options = {
        indexAxis: 'y' as const,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, title: { display: true, text: 'Annotations' } } },
    };

    return (
        <div className='cvat-annotation-counts-page'>
            <Row justify='center'>
                <Col span={22}>
                    <Title level={4}>{`Annotation counts for task ${data.task_id}`}</Title>
                    <Text type='secondary'>
                        {`${data.total} annotations across ${data.counts.length} labels`}
                    </Text>
                    <div style={{ height: Math.max(300, data.counts.length * 22) }}>
                        <Bar data={chartData} options={options} />
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(AnnotationCountsPage);