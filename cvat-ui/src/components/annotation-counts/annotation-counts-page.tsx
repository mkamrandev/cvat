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
import Select from 'antd/lib/select';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const ALL = 'all';

interface LabelCount {
    label: string;
    count: number;
}

interface ShapeTypeCount {
    type: string;
    count: number;
}

interface CountsResponse {
    task_id: number;
    shape_type: string | null;
    total: number;
    by_shape_type: ShapeTypeCount[];
    counts: LabelCount[];
}

function AnnotationCountsPage(): JSX.Element {
    const { tid } = useParams<{ tid: string }>();
    const [data, setData] = useState<CountsResponse | null>(null);
    const [shapeTypes, setShapeTypes] = useState<string[]>([]);
    const [selected, setSelected] = useState<string>(ALL);
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState<boolean>(true);

    const load = useCallback(async (): Promise<void> => {
        setFetching(true);
        setError(null);

        const query = selected === ALL ? '' : `?shape_type=${encodeURIComponent(selected)}`;

        try {
            const response = await fetch(`/api/test/tasks/${tid}/annotation-counts${query}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`The server answered ${response.status} ${response.statusText}`);
            }

            const payload: CountsResponse = await response.json();
            setData(payload);

            if (selected === ALL) {
                setShapeTypes(payload.by_shape_type.map((row: ShapeTypeCount): string => row.type));
            }
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'The request failed.');
            setData(null);
        } finally {
            setFetching(false);
        }
    }, [tid, selected]);

    useEffect(() => {
        load();
    }, [load]);

    let body: JSX.Element;

    if (fetching) {
        body = <Spin size='large' />;
    } else if (error !== null) {
        body = (
            <Alert
                type='error'
                message='Could not load annotation counts'
                description={error}
                action={<Button onClick={load}>Try again</Button>}
            />
        );
    } else if (data === null || data.counts.length === 0) {
        body = <Empty description={`Nothing to show for task ${tid} with the current filter.`} />;
    } else {
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

        body = (
            <div style={{ height: Math.max(300, data.counts.length * 22) }}>
                <Bar data={chartData} options={options} />
            </div>
        );
    }

    return (
        <div className='cvat-annotation-counts-page'>
            <Row justify='center'>
                <Col span={22}>
                    <Title level={4}>{`Annotation counts for task ${tid}`}</Title>
                    <Row justify='space-between' align='middle'>
                        <Col>
                            <Text type='secondary'>
                                {data === null ? '' : `${data.total} shapes across ${data.counts.length} labels`}
                            </Text>
                        </Col>
                        <Col>
                            <Text>Shape type: </Text>
                            <Select
                                value={selected}
                                style={{ width: 180 }}
                                onChange={(value: string): void => setSelected(value)}
                                options={[
                                    { value: ALL, label: 'All' },
                                    ...shapeTypes.map((type: string) => ({ value: type, label: type })),
                                ]}
                            />
                        </Col>
                    </Row>
                    {body}
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(AnnotationCountsPage);